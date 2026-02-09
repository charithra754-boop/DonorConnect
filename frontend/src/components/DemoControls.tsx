'use client'

import { useState } from 'react'
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Divider
} from '@mui/material'
import {
  Settings,
  Warning,
  Person,
  CheckCircle,
  LocalHospital,
  Bloodtype,
  BugReport
} from '@mui/icons-material'

interface DemoControlsProps {
  userRole: 'donor' | 'hospital'
}

export default function DemoControls({ userRole }: DemoControlsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const triggerEvent = (type: string, data?: any) => {
    const event = new CustomEvent('DEMO_TRIGGER_NOTIFICATION', {
      detail: { type, userRole, ...data }
    })
    window.dispatchEvent(event)
    handleClose()
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 2000 }}>
      <Tooltip title="Demo Controls (For Judges)">
        <Fab 
          color="secondary" 
          aria-label="demo-controls"
          onClick={handleClick}
          size="medium"
          sx={{ border: '2px solid white' }}
        >
          <BugReport />
        </Fab>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            🚀 Demo Event Triggers
          </Typography>
        </Box>
        <Divider />
        
        {userRole === 'donor' && (
          <>
            <MenuItem onClick={() => triggerEvent('emergency')}>
              <ListItemIcon>
                <Warning color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Emergency Alert" 
                secondary="Critical O+ request nearby" 
              />
            </MenuItem>
            <MenuItem onClick={() => triggerEvent('camp')}>
              <ListItemIcon>
                <LocalHospital color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Blood Camp" 
                secondary="New drive at Community Center" 
              />
            </MenuItem>
            <MenuItem onClick={() => triggerEvent('milestone')}>
              <ListItemIcon>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Achievement" 
                secondary="Unlock 'Life Saver' badge" 
              />
            </MenuItem>
          </>
        )}

        {userRole === 'hospital' && (
          <>
            <MenuItem onClick={() => triggerEvent('donor_found')}>
              <ListItemIcon>
                <Person color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Donor Nearby" 
                secondary="Found B+ donor 2km away" 
              />
            </MenuItem>
            <MenuItem onClick={() => triggerEvent('response')}>
              <ListItemIcon>
                <CheckCircle color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Donor Response" 
                secondary="Sarah accepted your request" 
              />
            </MenuItem>
            <MenuItem onClick={() => triggerEvent('low_stock')}>
              <ListItemIcon>
                <Bloodtype color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Low Inventory" 
                secondary="A- stock below threshold" 
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  )
}
