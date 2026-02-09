import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument, AlertStatus, ResponseStatus } from '../schemas/alert.schema';
import { Donor, DonorDocument, DonorStatus } from '../schemas/donor.schema';
import { Hospital, HospitalDocument } from '../schemas/hospital.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateAlertDto } from './dto/create-alert.dto';
import { RespondToAlertDto } from './dto/respond-to-alert.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Donor.name) private donorModel: Model<DonorDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
    private socketGateway: SocketGateway,
  ) {}

  async createAlert(createAlertDto: CreateAlertDto, hospitalUserId: string) {
    // Find hospital profile
    const hospital = await this.hospitalModel.findOne({ 
      userId: new Types.ObjectId(hospitalUserId) 
    });
    
    if (!hospital) {
      throw new NotFoundException('Hospital profile not found');
    }

    // Create alert
    const alert = new this.alertModel({
      ...createAlertDto,
      hospitalId: hospital._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    const savedAlert = await alert.save();

    // Find eligible donors
    const eligibleDonors = await this.findEligibleDonors(
      createAlertDto.bloodGroup,
      hospital.userId,
      createAlertDto.searchRadius || 5
    );

    // Notify eligible donors
    if (eligibleDonors.length > 0) {
      await this.notifyDonors(savedAlert, eligibleDonors);
      
      // Update alert with notified donors
      savedAlert.notifiedDonors = eligibleDonors.map(donor => donor._id as any);
      await savedAlert.save();

      // Real-time notification
      this.socketGateway.emitNewAlert(savedAlert);
    }

    // Update hospital stats
    hospital.totalAlertsRaised += 1;
    await hospital.save();

    return this.populateAlert(savedAlert);
  }

  async findEligibleDonors(bloodGroup: string, hospitalUserId: Types.ObjectId, radiusKm: number) {
    // Get hospital location
    const hospitalUser = await this.userModel.findById(hospitalUserId);
    if (!hospitalUser) return [];

    const [longitude, latitude] = hospitalUser.location.coordinates;

    // Find eligible donors within radius
    const eligibleDonorUsers = await this.userModel.find({
      role: 'donor',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000, // Convert km to meters
        },
      },
    });

    const donorUserIds = eligibleDonorUsers.map(user => user._id);

    // Get donor profiles with matching blood group and eligible status
    const eligibleDonors = await this.donorModel.find({
      userId: { $in: donorUserIds },
      bloodGroup,
      status: DonorStatus.ELIGIBLE,
      availableForEmergency: true,
      notificationsEnabled: true,
    }).populate('userId');

    return eligibleDonors;
  }

  async notifyDonors(alert: AlertDocument, donors: DonorDocument[]) {
    const hospital = await this.hospitalModel.findById(alert.hospitalId).populate('userId');
    
    for (const donor of donors) {
      const donorUser = donor.userId as any;
      
      const message = `🚨 URGENT: ${hospital.hospitalName} needs ${alert.bloodGroup} blood. ${alert.unitsNeeded} units required for ${alert.patientCondition}. Can you help?`;
      
      // Send notifications via multiple channels
      await Promise.all([
        this.notificationsService.sendSMS(donorUser.phone, message),
        this.notificationsService.sendEmail(
          donorUser.email,
          'Urgent Blood Donation Request',
          message
        ),
        donor.fcmToken ? this.notificationsService.sendPushNotification(
          donor.fcmToken,
          'Blood Donation Alert',
          message
        ) : Promise.resolve(),
      ]);
    }
  }

  async respondToAlert(alertId: string, donorUserId: string, responseDto: RespondToAlertDto) {
    const alert = await this.alertModel.findById(alertId);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    if (alert.status !== AlertStatus.ACTIVE) {
      throw new ForbiddenException('Alert is no longer active');
    }

    const donor = await this.donorModel.findOne({ 
      userId: new Types.ObjectId(donorUserId) 
    });
    
    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    // Check if donor already responded
    const existingResponse = alert.responses.find(
      response => response.donorId.toString() === donor._id.toString()
    );

    if (existingResponse) {
      // Update existing response
      existingResponse.status = responseDto.status;
      existingResponse.responseTime = new Date();
      existingResponse.estimatedArrival = responseDto.estimatedArrival ? new Date(responseDto.estimatedArrival) : undefined;
      existingResponse.notes = responseDto.notes;
    } else {
      // Add new response
      alert.responses.push({
        donorId: donor._id,
        status: responseDto.status,
        responseTime: new Date(),
        estimatedArrival: responseDto.estimatedArrival ? new Date(responseDto.estimatedArrival) : undefined,
        notes: responseDto.notes,
      } as any);
    }

    await alert.save();

    // Notify hospital of response
    const hospital = await this.hospitalModel.findById(alert.hospitalId).populate('userId');
    const donorUser = await this.userModel.findById(donorUserId);
    
    const hospitalUser = hospital.userId as any;
    const responseMessage = `Donor ${donorUser.name} has ${responseDto.status} your blood request for ${alert.bloodGroup}.`;
    
    await this.notificationsService.sendEmail(
      hospitalUser.email,
      'Blood Donation Response',
      responseMessage
    );

    // Real-time notification
    this.socketGateway.emitAlertResponse(hospitalUser._id.toString(), {
      alertId: alert._id,
      donorId: donor._id,
      status: responseDto.status,
      donorName: donorUser.name,
      bloodGroup: alert.bloodGroup
    });

    return this.populateAlert(alert);
  }

  async getAlertsByHospital(hospitalUserId: string, status?: AlertStatus) {
    const hospital = await this.hospitalModel.findOne({ 
      userId: new Types.ObjectId(hospitalUserId) 
    });
    
    if (!hospital) {
      throw new NotFoundException('Hospital profile not found');
    }

    const query: any = { hospitalId: hospital._id };
    if (status) {
      query.status = status;
    }

    const alerts = await this.alertModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate('hospitalId')
      .populate('responses.donorId');

    return alerts;
  }

  async getActiveAlerts() {
    return this.alertModel
      .find({ status: AlertStatus.ACTIVE })
      .sort({ priority: -1, createdAt: -1 })
      .populate('hospitalId')
      .populate('responses.donorId');
  }

  async updateAlertStatus(alertId: string, status: AlertStatus, hospitalUserId: string) {
    const alert = await this.alertModel.findById(alertId);
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    const hospital = await this.hospitalModel.findOne({ 
      userId: new Types.ObjectId(hospitalUserId) 
    });

    if (!hospital || alert.hospitalId.toString() !== hospital._id.toString()) {
      throw new ForbiddenException('Not authorized to update this alert');
    }

    alert.status = status;
    await alert.save();

    // Real-time notification
    this.socketGateway.emitAlertUpdate(alert);

    return this.populateAlert(alert);
  }

  private async populateAlert(alert: AlertDocument) {
    return alert.populate([
      { path: 'hospitalId', populate: { path: 'userId' } },
      { path: 'responses.donorId', populate: { path: 'userId' } }
    ]);
  }
}