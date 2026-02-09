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
  Alert,
  LinearProgress,
  Avatar,
  Paper,
  Fade,
  Grow,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Favorite,
  EmojiEvents,
  LocationOn,
  CheckCircle,
  BloodtypeOutlined,
  Schedule,
  TrendingUp,
  Star,
  LocalHospital,
  Refresh,
  VolunteerActivism,
  Timeline,
  CardGiftcard,
  AccessTime,
  DirectionsRun,
  Phone,
  Navigation,
  Cancel,
  Edit
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { AppDispatch, RootState } from '@/store'
import { fetchActiveAlerts, respondToAlert } from '@/store/slices/alertsSlice'
import DonorHealthCard from '@/components/DonorHealthCard'
import SimpleMap from '@/components/SimpleMap'
import MapStats from '@/components/MapStats'
import MapNotifications from '@/components/MapNotifications'
import ProfileEditor from '@/components/ProfileEditor'
import DemoControls from '@/components/DemoControls'

export default function DonorDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const { activeAlerts, loading } = useSelector((state: RootState) => state.alerts)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [responding, setResponding] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileEditorOpen, setProfileEditorOpen] = useState(false)

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

  // Dynamic donor stats based on user data
  const donorStats = {
    totalDonations: 12,
    lastDonationDate: new Date('2024-01-15'),
    nextEligibleDate: new Date('2024-04-15'),
    bloodGroup: user?.bloodGroup || 'O+', // Use actual user blood group
    points: 1250,
    rewardPoints: 23,
    level: 'Gold Donor',
    badges: ['Life Saver', 'Regular Hero', 'Emergency Responder'],
    totalDistance: 45.2,
    livesImpacted: 36,
    healthScore: 95
  }

  useEffect(() => {
    dispatch(fetchActiveAlerts())
    const interval = setInterval(() => {
      dispatch(fetchActiveAlerts())
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch])

  const handleQuickResponse = async (alertId: string, response: 'accepted' | 'declined') => {
    setResponding(true)
    try {
      await dispatch(respondToAlert({
        alertId,
        response: {
          status: response,
          estimatedArrival: response === 'accepted' ? '30 minutes' : null,
          notes: response === 'accepted' ? 'On my way!' : 'Unable to help at this time'
        }
      })).unwrap()
      
      toast.success(response === 'accepted' ? 'Response sent! Thank you for helping!' : 'Response recorded')
      dispatch(fetchActiveAlerts())
    } catch (error: any) {
      toast.error(error.message || 'Failed to respond to alert')
    } finally {
      setResponding(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getTimeUrgency = (requiredBy: string) => {
    const now = new Date()
    const required = new Date(requiredBy)
    const hoursLeft = (required.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursLeft < 2) return { text: 'URGENT - Less than 2 hours', color: 'error' }
    if (hoursLeft < 6) return { text: `${Math.floor(hoursLeft)} hours left`, color: 'warning' }
    return { text: `${Math.floor(hoursLeft)} hours left`, color: 'success' }
  }

  const daysUntilEligible = Math.ceil((donorStats.nextEligibleDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  if (!mounted) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Donor Welcome Header */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
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
                <Favorite fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Welcome Back, {user?.name?.split(' ')[0] || 'Hero'}! 🩸
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  {user?.name || 'Anonymous Donor'} • {user?.bloodGroup || donorStats.bloodGroup} Donor
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Chip 
                    icon={<EmojiEvents />} 
                    label={donorStats.level} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,193,7,0.8)', color: 'white' }}
                  />
                  <Chip 
                    icon={<Star />} 
                    label={`${donorStats.points} Points`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
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
              <Typography variant="h2" fontWeight="bold" color="rgba(255,255,255,0.9)">
                {donorStats.livesImpacted}
              </Typography>
              <Typography variant="body1">
                Lives Impacted 💝
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Donor Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {donorStats.totalDonations}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🩸 Total Donations
                    </Typography>
                  </Box>
                  <BloodtypeOutlined sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(donorStats.totalDonations / 20) * 100} 
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.8)' }
                  }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Next milestone: 20 donations
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {donorStats.healthScore}%
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      💪 Health Score
                    </Typography>
                  </Box>
                  <Favorite sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Box display="flex" alignItems="center" mt={2}>
                  <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="caption">
                    Excellent condition for donation
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <Card sx={{ 
              background: daysUntilEligible <= 0 
                ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {daysUntilEligible <= 0 ? '✅' : daysUntilEligible}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {daysUntilEligible <= 0 ? '🎉 Ready to Donate!' : '⏰ Days Until Eligible'}
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {daysUntilEligible <= 0 
                    ? 'You can donate blood now!' 
                    : `Next eligible: ${new Date(donorStats.nextEligibleDate).toLocaleDateString()}`
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1200}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {donorStats.badges.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      🏆 Badges Earned
                    </Typography>
                  </Box>
                  <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Latest: {donorStats.badges[donorStats.badges.length - 1]}
                </Typography>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Available Blood Requests */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)',
          p: 3,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <LocalHospital color="error" sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                🚨 Blood Requests Near You
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh requests">
                <IconButton onClick={() => dispatch(fetchActiveAlerts())}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Chip 
                label={`${activeAlerts.length} Active`} 
                color="error" 
                size="small" 
              />
            </Box>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : activeAlerts.length === 0 ? (
            <Box textAlign="center" py={8}>
              <CheckCircle sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No urgent blood requests right now
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Great job! All current needs are being met. Check back later.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => dispatch(fetchActiveAlerts())}
              >
                Check for Updates
              </Button>
            </Box>
          ) : (
            <Box>
              {activeAlerts.slice(0, 5).map((alert, index) => {
                const urgency = getTimeUrgency(alert.requiredBy)
                return (
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
                              />
                              <Chip 
                                label={urgency.text} 
                                color={urgency.color as any}
                                size="small"
                                icon={<AccessTime />}
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
                              {alert.hospitalId?.hospitalName || 'Local Hospital'}
                            </Typography>
                            
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              {alert.patientCondition}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={3} mb={2}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <BloodtypeOutlined fontSize="small" color="error" />
                                <Typography variant="body2" fontWeight="medium">
                                  {alert.unitsNeeded} units needed
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOn fontSize="small" color="primary" />
                                <Typography variant="body2">
                                  Within {alert.searchRadius}km
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <DirectionsRun fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  ~15 min drive
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
                          
                          <Box display="flex" flexDirection="column" gap={1} ml={2}>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<Favorite />}
                              onClick={() => handleQuickResponse(alert._id, 'accepted')}
                              disabled={responding}
                              sx={{ minWidth: 120 }}
                            >
                              I Can Help!
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => handleQuickResponse(alert._id, 'declined')}
                              disabled={responding}
                              sx={{ minWidth: 120 }}
                            >
                              Can't Help
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<Phone />}
                              sx={{ minWidth: 120 }}
                            >
                              Call Hospital
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                      {index < activeAlerts.length - 1 && <Divider />}
                    </Box>
                  </Fade>
                )
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Map Statistics */}
      <MapStats userRole="donor" />

      {/* Live Map Section */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)',
          p: 3,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            🗺️ Nearby Opportunities
            <Chip label="Live Updates" color="primary" size="small" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find hospitals, emergency alerts, and donation camps near you
          </Typography>
        </Box>
        <CardContent sx={{ p: 0 }}>
          <SimpleMap userRole="donor" height={500} />
        </CardContent>
      </Card>

      {/* Donor Health Card */}
      <DonorHealthCard donorStats={donorStats} />

      {/* Recent Activity & Achievements */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" />
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText 
                    primary="Donated at Local Hospital"
                    secondary={`January 15, 2024 • 450ml • ${user?.bloodGroup || 'O+'} Blood`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EmojiEvents color="warning" /></ListItemIcon>
                  <ListItemText 
                    primary="Earned 'Emergency Responder' Badge"
                    secondary="Responded to 5 emergency alerts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Star color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Reached Gold Donor Status"
                    secondary="Completed 10+ successful donations"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardGiftcard color="secondary" />
                Rewards & Achievements
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {donorStats.badges.map((badge, index) => (
                  <Chip
                    key={index}
                    label={badge}
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<EmojiEvents />}
                  />
                ))}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress to next reward (Free Health Checkup)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(donorStats.points / 1500) * 100} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {donorStats.points}/1500 points • {1500 - donorStats.points} points to go
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map Notifications */}
      <MapNotifications userRole="donor" />

      {/* Profile Editor Dialog */}
      <ProfileEditor 
        open={profileEditorOpen} 
        onClose={() => setProfileEditorOpen(false)} 
      />

      {/* Demo Controls for Judges */}
      <DemoControls userRole="donor" />
    </Container>
  )
}