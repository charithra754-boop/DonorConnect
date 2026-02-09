'use client'

import { useState, useEffect } from 'react'
import {
    Box,
    Snackbar,
    Alert,
    Avatar,
    Typography,
    Button,
    Slide,
    Fade,
    IconButton,
    Chip
} from '@mui/material'
import {
    Close,
    Navigation,
    Phone,
    BloodtypeOutlined,
    LocalHospital,
    Event,
    Person
} from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'
import React from 'react'

const SlideTransition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />
})

interface MapNotification {
    id: string
    type: 'emergency' | 'donor_nearby' | 'camp_reminder' | 'response_received'
    title: string
    message: string
    data?: any
    timestamp: Date
    priority: 'low' | 'medium' | 'high' | 'critical'
}

interface MapNotificationsProps {
    userRole: 'donor' | 'hospital'
}

export default function MapNotifications({ userRole }: MapNotificationsProps) {
    const [notifications, setNotifications] = useState<MapNotification[]>([])
    const [currentNotification, setCurrentNotification] = useState<MapNotification | null>(null)

    useEffect(() => {
        // Listen for demo triggers
        const handleDemoTrigger = (event: any) => {
            const { type, ...data } = event.detail
            const notificationId = Date.now().toString()
            let notification: MapNotification

            switch (type) {
                case 'emergency':
                    notification = {
                        id: notificationId,
                        type: 'emergency',
                        title: '🚨 DEMO: Emergency Alert',
                        message: 'Critical O+ request triggered manually',
                        priority: 'critical',
                        data: { hospitalName: 'City General', bloodGroup: 'O+', distance: 1.2, timeLeft: '1 hour' },
                        timestamp: new Date()
                    }
                    break
                case 'camp':
                    notification = {
                        id: notificationId,
                        type: 'camp_reminder',
                        title: '🏕️ DEMO: Blood Camp',
                        message: 'New drive at Community Center',
                        priority: 'medium',
                        data: { campName: 'Demo Drive', incentive: 'Free T-Shirt', date: 'Tomorrow' },
                        timestamp: new Date()
                    }
                    break
                case 'donor_found':
                    notification = {
                        id: notificationId,
                        type: 'donor_nearby',
                        title: '👥 DEMO: Donor Found',
                        message: 'Found compatible donor nearby',
                        priority: 'medium',
                        data: { donorName: 'Demo User', distance: 0.5 },
                        timestamp: new Date()
                    }
                    break
                case 'response':
                    notification = {
                        id: notificationId,
                        type: 'response_received',
                        title: '✅ DEMO: Response',
                        message: 'Donor accepted your request',
                        priority: 'high',
                        data: { donorName: 'Sarah M.', eta: '15 mins' },
                        timestamp: new Date()
                    }
                    break
                default:
                    return
            }

            setNotifications(prev => [notification, ...prev.slice(0, 4)])
            setCurrentNotification(notification)
            
            // Auto-hide non-critical demo alerts
            if (notification.priority !== 'critical') {
                setTimeout(() => setCurrentNotification(null), 8000)
            }
        }

        window.addEventListener('DEMO_TRIGGER_NOTIFICATION', handleDemoTrigger)

        // Simulate real-time notifications
        const interval = setInterval(() => {
            generateRandomNotification()
        }, 15000) // Every 15 seconds

        // Generate initial notification after 3 seconds
        setTimeout(() => {
            generateRandomNotification()
        }, 3000)

        return () => {
            clearInterval(interval)
            window.removeEventListener('DEMO_TRIGGER_NOTIFICATION', handleDemoTrigger)
        }
    }, [userRole])

    const generateRandomNotification = () => {
        const notificationId = Date.now().toString()
        let notification: MapNotification

        if (userRole === 'hospital') {
            const hospitalNotifications = [
                {
                    type: 'donor_nearby' as const,
                    title: '🩸 New Donor Available',
                    message: 'A B+ donor just became available 2.3km away',
                    priority: 'medium' as const,
                    data: { bloodGroup: 'B+', distance: 2.3, donorName: 'John D.' }
                },
                {
                    type: 'response_received' as const,
                    title: '✅ Alert Response',
                    message: 'Sarah M. accepted your emergency alert for O- blood',
                    priority: 'high' as const,
                    data: { donorName: 'Sarah M.', bloodGroup: 'O-', eta: '25 minutes' }
                },
                {
                    type: 'camp_reminder' as const,
                    title: '🏕️ Blood Camp Update',
                    message: 'City Park blood drive has 15 new registrations',
                    priority: 'low' as const,
                    data: { campName: 'City Park Drive', newRegistrations: 15 }
                }
            ]
            notification = {
                id: notificationId,
                ...hospitalNotifications[Math.floor(Math.random() * hospitalNotifications.length)],
                timestamp: new Date()
            }
        } else {
            const donorNotifications = [
                {
                    type: 'emergency' as const,
                    title: '🚨 Emergency Alert',
                    message: 'City General Hospital urgently needs A+ blood - 1.5km away',
                    priority: 'critical' as const,
                    data: { hospitalName: 'City General', bloodGroup: 'A+', distance: 1.5, timeLeft: '2 hours' }
                },
                {
                    type: 'camp_reminder' as const,
                    title: '🏕️ Donation Camp Tomorrow',
                    message: 'Red Cross blood drive at Community Center - Free health checkup!',
                    priority: 'medium' as const,
                    data: { campName: 'Red Cross Drive', incentive: 'Free health checkup', date: 'Tomorrow 9AM' }
                },
                {
                    type: 'donor_nearby' as const,
                    title: '👥 Join Other Donors',
                    message: '3 other donors are heading to Memorial Hospital right now',
                    priority: 'low' as const,
                    data: { hospitalName: 'Memorial Hospital', otherDonors: 3 }
                }
            ]
            notification = {
                id: notificationId,
                ...donorNotifications[Math.floor(Math.random() * donorNotifications.length)],
                timestamp: new Date()
            }
        }

        setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep last 5
        setCurrentNotification(notification)

        // Auto-hide after 8 seconds for non-critical notifications
        if (notification.priority !== 'critical') {
            setTimeout(() => {
                setCurrentNotification(null)
            }, 8000)
        }
    }

    const handleClose = () => {
        setCurrentNotification(null)
    }

    const handleAction = (action: string) => {
        if (!currentNotification) return

        switch (action) {
            case 'navigate':
                // Open navigation
                break
            case 'call':
                // Make phone call
                break
            case 'respond':
                // Respond to alert
                break
            case 'register':
                // Register for camp
                break
        }
        handleClose()
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'emergency':
                return <BloodtypeOutlined sx={{ color: '#f44336' }} />
            case 'donor_nearby':
                return <Person sx={{ color: '#4caf50' }} />
            case 'camp_reminder':
                return <Event sx={{ color: '#2196f3' }} />
            case 'response_received':
                return <LocalHospital sx={{ color: '#ff9800' }} />
            default:
                return <BloodtypeOutlined />
        }
    }

    const getNotificationColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'error'
            case 'high':
                return 'warning'
            case 'medium':
                return 'info'
            case 'low':
                return 'success'
            default:
                return 'info'
        }
    }

    const renderNotificationActions = (notification: MapNotification) => {
        const actions = []

        if (notification.type === 'emergency' && userRole === 'donor') {
            actions.push(
                <Button
                    key="respond"
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<BloodtypeOutlined />}
                    onClick={() => handleAction('respond')}
                    sx={{ mr: 1 }}
                >
                    I Can Help!
                </Button>
            )
        }

        if (notification.type === 'camp_reminder') {
            actions.push(
                <Button
                    key="register"
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<Event />}
                    onClick={() => handleAction('register')}
                    sx={{ mr: 1 }}
                >
                    Register
                </Button>
            )
        }

        if (notification.data?.hospitalName || notification.data?.campName) {
            actions.push(
                <Button
                    key="navigate"
                    size="small"
                    variant="outlined"
                    startIcon={<Navigation />}
                    onClick={() => handleAction('navigate')}
                    sx={{ mr: 1 }}
                >
                    Navigate
                </Button>
            )
        }

        if (notification.type === 'donor_nearby' && userRole === 'hospital') {
            actions.push(
                <Button
                    key="call"
                    size="small"
                    variant="outlined"
                    startIcon={<Phone />}
                    onClick={() => handleAction('call')}
                >
                    Call
                </Button>
            )
        }

        return actions
    }

    return (
        <>
            {/* Current Notification Snackbar */}
            <Snackbar
                open={!!currentNotification}
                TransitionComponent={SlideTransition}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 8 }}
            >
                <Alert
                    severity={getNotificationColor(currentNotification?.priority || 'info') as any}
                    sx={{
                        width: '100%',
                        maxWidth: 400,
                        '& .MuiAlert-message': { width: '100%' },
                        animation: currentNotification?.priority === 'critical' ? 'pulse 2s infinite' : 'none'
                    }}
                    action={
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleClose}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    }
                >
                    <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            {getNotificationIcon(currentNotification?.type || 'emergency')}
                            <Typography variant="subtitle2" fontWeight="bold">
                                {currentNotification?.title || ''}
                            </Typography>
                            {currentNotification?.priority === 'critical' && (
                                <Chip label="URGENT" color="error" size="small" />
                            )}
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {currentNotification?.message || ''}
                        </Typography>

                        {/* Additional Data */}
                        {currentNotification?.data && (
                            <Box sx={{ mb: 2 }}>
                                {currentNotification.data.bloodGroup && (
                                    <Chip
                                        label={currentNotification.data.bloodGroup}
                                        color="error"
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                )}
                                {currentNotification.data.distance && (
                                    <Chip
                                        label={`${currentNotification.data.distance}km away`}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                )}
                                {currentNotification.data.timeLeft && (
                                    <Chip
                                        label={`${currentNotification.data.timeLeft} left`}
                                        color="warning"
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                )}
                                {currentNotification.data.eta && (
                                    <Chip
                                        label={`ETA: ${currentNotification.data.eta}`}
                                        color="info"
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {currentNotification && renderNotificationActions(currentNotification)}
                        </Box>
                    </Box>
                </Alert>
            </Snackbar>

            {/* Notification History (Optional - could be shown in a drawer) */}
            {notifications.length > 0 && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 100,
                        right: 16,
                        zIndex: 1200,
                        maxWidth: 300,
                        display: 'none' // Hidden for now, could be toggled
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Recent Notifications
                    </Typography>
                    {notifications.slice(0, 3).map((notification, index) => (
                        <Fade in timeout={300 + index * 100} key={notification.id}>
                            <Alert
                                severity={getNotificationColor(notification.priority) as any}
                                sx={{ mb: 1, fontSize: '0.875rem' }}
                            >
                                <Typography variant="caption" display="block">
                                    {notification.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {notification.timestamp.toLocaleTimeString()}
                                </Typography>
                            </Alert>
                        </Fade>
                    ))}
                </Box>
            )}
        </>
    )
}