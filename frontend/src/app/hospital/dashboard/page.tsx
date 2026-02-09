'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Avatar,
  LinearProgress,
  Fade,
  Grow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  CircularProgress
} from '@mui/material'
import { 
  Add, 
  LocalHospital, 
  Notifications, 
  TrendingUp,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Refresh,
  Analytics,
  BloodtypeOutlined,
  LocationOn,
  Phone,
  Edit
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { AppDispatch, RootState } from '@/store'
import { fetchHospitalAlerts, createAlert } from '@/store/slices/alertsSlice'
import FloatingActionButton from '@/components/FloatingActionButton'
import SimpleMap from '@/components/SimpleMap'
import MapStats from '@/components/MapStats'
import MapNotifications from '@/components/MapNotifications'
import ProfileEditor from '@/components/ProfileEditor'
import DemoControls from '@/components/DemoControls'
// import LiveNotifications from '@/components/LiveNotifications'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const priorities = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'critical', label: 'Critical', color: 'error' }
]

interface CreateAlertForm {
  bloodGroup: string
  unitsNeeded: number
  priority: string
  patientCondition: string
  additionalNotes: string
  requiredBy: string
  searchRadius: number
  isEmergency: boolean
}

export default function HospitalDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { hospitalAlerts, loading } = useSelector((state: RootState) => state.alerts)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [profileEditorOpen, setProfileEditorOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [mounted, isAuthenticated, router])

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateAlertForm>()

  useEffect(() => {
    dispatch(fetchHospitalAlerts())
  }, [dispatch])

  const onCreateAlert = async (data: CreateAlertForm) => {
    try {
      await dispatch(createAlert({
        ...data,
        requiredBy: new Date(data.requiredBy).toISOString(),
      })).unwrap()
      
      toast.success('Alert created successfully!')
      setCreateDialogOpen(false)
      reset()
      dispatch(fetchHospitalAlerts())
    } catch (error: any) {
      toast.error(error.message || 'Failed to create alert')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'primary'
      case 'fulfilled': return 'success'
      case 'expired': return 'error'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    const p = priorities.find(p => p.value === priority)
    return p?.color || 'default'
  }

  const activeAlerts = hospitalAlerts.filter(alert => alert.status === 'active')
  const totalResponses = hospitalAlerts.reduce((sum, alert) => sum + alert.responses.length, 0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Fade in timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem'
                }}
              >
                <LocalHospital fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Hospital Command Center
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Welcome back, {user?.name} 👋
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Chip 
                    icon={<LocationOn />} 
                    label="Emergency Ready" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip 
                    icon={<CheckCircle />} 
                    label="System Online" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(76,175,80,0.8)', color: 'white' }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setProfileEditorOpen(true)}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box textAlign="center">
              <Button
                variant="contained"
                startIcon={<Warning />}
                onClick={() => setCreateDialogOpen(true)}
                size="large"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  mb: 2,
                  minWidth: 200
                }}
              >
                🚨 Create Emergency Alert
              </Button>
              <Typography variant="caption" display="block">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {activeAlerts.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🚨 Active Alerts
                    </Typography>
                  </Box>
                  <Badge badgeContent={activeAlerts.length} color="error">
                    <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Badge>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((activeAlerts.length / 10) * 100, 100)} 
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
                  }}
                />
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {totalResponses}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      💬 Donor Responses
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Box display="flex" alignItems="center" mt={2}>
                  <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    {totalResponses > 0 ? '+12% from last week' : 'Awaiting responses'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {hospitalAlerts.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      📋 Total Requests
                    </Typography>
                  </Box>
                  <Analytics sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Box display="flex" alignItems="center" mt={2}>
                  <Schedule sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    Since {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1200}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      12
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      👨‍⚕️ Doctors On Shift
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Box display="flex" alignItems="center" mt={2}>
                  <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    8 Available, 4 In Surgery
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        {/* Additional Hospital-Specific Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1400}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #607d8b 0%, #78909c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      3
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🏕️ Nearby Camps
                    </Typography>
                  </Box>
                  <LocationOn sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Next: City Park - Tomorrow 9AM
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1600}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #795548 0%, #8d6e63 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      7
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🚑 Emergency Cases
                    </Typography>
                  </Box>
                  <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  2 Critical, 5 Stable
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff5722 0%, #ff7043 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      89%
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🏥 Bed Occupancy
                    </Typography>
                  </Box>
                  <LocalHospital sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={89} 
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
                  }}
                />
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={2000}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #009688 0%, #26a69a 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      156
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      📋 Today's Surgeries
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  23 Completed, 133 Scheduled
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Map Statistics */}
      <MapStats userRole="hospital" />

      {/* Live Donor Map */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)',
          p: 3,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            🗺️ Live Donor Map
            <Chip label="Real-time" color="success" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View available donors and blood camps in your area
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <SimpleMap userRole="hospital" height={500} />
        </CardContent>
      </Card>

      {/* Enhanced Recent Alerts */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)',
          p: 3,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <BloodtypeOutlined color="error" sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                🩸 Blood Alert Center
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh alerts">
                <IconButton onClick={() => dispatch(fetchHospitalAlerts())}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                size="small"
              >
                View Analytics
              </Button>
            </Box>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {hospitalAlerts.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Warning sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No alerts created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first blood donation alert to start saving lives
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                size="large"
              >
                Create First Alert
              </Button>
            </Box>
          ) : (
            <Box>
              {hospitalAlerts.slice(0, 10).map((alert, index) => (
                <Fade in timeout={300 + index * 100} key={alert._id}>
                  <Box>
                    <Box sx={{ 
                      p: 3, 
                      borderLeft: `4px solid ${
                        alert.priority === 'critical' ? '#f44336' :
                        alert.priority === 'high' ? '#ff9800' :
                        alert.priority === 'medium' ? '#2196f3' : '#4caf50'
                      }`,
                      '&:hover': { 
                        bgcolor: 'grey.50',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      }
                    }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Chip 
                              label={`🩸 ${alert.bloodGroup}`} 
                              color="error" 
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Chip 
                              label={alert.priority.toUpperCase()} 
                              color={getPriorityColor(alert.priority) as any}
                              size="small"
                              icon={alert.priority === 'critical' ? <Warning /> : undefined}
                            />
                            <Chip 
                              label={alert.status.toUpperCase()} 
                              color={getStatusColor(alert.status) as any}
                              size="small" 
                            />
                            {alert.isEmergency && (
                              <Chip 
                                label="🚨 EMERGENCY" 
                                color="error" 
                                size="small"
                                sx={{ animation: 'pulse 2s infinite' }}
                              />
                            )}
                          </Box>
                          
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {alert.patientCondition}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={3} mb={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <BloodtypeOutlined fontSize="small" color="error" />
                              <Typography variant="body2" fontWeight="medium">
                                {alert.unitsNeeded} units needed
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <People fontSize="small" color="primary" />
                              <Typography variant="body2">
                                {alert.responses.length} responses
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Schedule fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Due: {new Date(alert.requiredBy).toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {alert.additionalNotes && (
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              fontStyle: 'italic',
                              mt: 1,
                              p: 1,
                              bgcolor: 'grey.100',
                              borderRadius: 1
                            }}>
                              💬 {alert.additionalNotes}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box textAlign="right" ml={2}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(alert.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {index < hospitalAlerts.length - 1 && <Divider />}
                  </Box>
                </Fade>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Alert Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Blood Donation Alert</DialogTitle>
        <form onSubmit={handleSubmit(onCreateAlert)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Blood Group</InputLabel>
                  <Select
                    {...register('bloodGroup', { required: 'Blood group is required' })}
                    label="Blood Group"
                    error={!!errors.bloodGroup}
                  >
                    {bloodGroups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Units Needed"
                  type="number"
                  {...register('unitsNeeded', { 
                    required: 'Units needed is required',
                    min: { value: 1, message: 'Must be at least 1' }
                  })}
                  error={!!errors.unitsNeeded}
                  helperText={errors.unitsNeeded?.message}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    {...register('priority', { required: 'Priority is required' })}
                    label="Priority"
                    error={!!errors.priority}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Search Radius (km)"
                  type="number"
                  defaultValue={5}
                  {...register('searchRadius', { 
                    min: { value: 1, message: 'Must be at least 1 km' },
                    max: { value: 50, message: 'Must be less than 50 km' }
                  })}
                  error={!!errors.searchRadius}
                  helperText={errors.searchRadius?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Patient Condition"
                  {...register('patientCondition', { required: 'Patient condition is required' })}
                  error={!!errors.patientCondition}
                  helperText={errors.patientCondition?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Required By"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  {...register('requiredBy', { required: 'Required by date is required' })}
                  error={!!errors.requiredBy}
                  helperText={errors.requiredBy?.message}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={3}
                  {...register('additionalNotes')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Create Alert
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button */}
      <FloatingActionButton
        userRole="hospital"
        onCreateAlert={() => setCreateDialogOpen(true)}
        onRefresh={() => dispatch(fetchHospitalAlerts())}
      />

      {/* 🚨 HACKATHON DEMO: Live Notifications for Hospitals - Temporarily disabled */}
      {/* <LiveNotifications userId={user?.id || ''} userRole="hospital" /> */}
      
      {/* Map Notifications */}
      <MapNotifications userRole="hospital" />

      {/* Profile Editor Dialog */}
      <ProfileEditor 
        open={profileEditorOpen} 
        onClose={() => setProfileEditorOpen(false)} 
      />

      {/* Demo Controls for Judges */}
      <DemoControls userRole="hospital" />
    </Container>
  )
}