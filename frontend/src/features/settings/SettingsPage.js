import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  ExpandLess,
  ExpandMore,
  Save as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    profile: true,
    security: false,
    notifications: false,
    appearance: false,
    preferences: false
  });
  
  // User profile state
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York'
  });
  
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '2025-01-15',
    sessionTimeout: 30
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    budgetAlerts: true,
    goalAlerts: true,
    weeklyReports: true,
    monthlyReports: true
  });
  
  // Appearance settings state
  const [appearance, setAppearance] = useState({
    theme: 'light',
    colorScheme: 'blue',
    fontSize: 'medium',
    compactMode: false
  });
  
  // Preferences settings state
  const [preferences, setPreferences] = useState({
    defaultPage: 'dashboard',
    defaultCurrency: 'USD',
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: '12h'
  });
  
  // Edit mode state
  const [editMode, setEditMode] = useState({
    profile: false,
    security: false,
    notifications: false,
    appearance: false,
    preferences: false
  });

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use the mock data defined above
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleToggleSection = (section) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };

  const handleToggleEditMode = (section) => {
    setEditMode({
      ...editMode,
      [section]: !editMode[section]
    });
  };

  const handleProfileChange = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const handleSecurityChange = (field, value) => {
    setSecurity({
      ...security,
      [field]: value
    });
  };

  const handleNotificationsChange = (field, value) => {
    setNotifications({
      ...notifications,
      [field]: value
    });
  };

  const handleAppearanceChange = (field, value) => {
    setAppearance({
      ...appearance,
      [field]: value
    });
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
  };

  const handleSaveChanges = (section) => {
    // In a real app, we would send the updated data to the API
    // For demo purposes, we'll just toggle edit mode off
    setEditMode({
      ...editMode,
      [section]: false
    });
    
    // Show success message
    alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List component="nav" aria-label="settings navigation">
              <ListItemButton onClick={() => handleToggleSection('profile')}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
                {openSections.profile ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleToggleSection('security')}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText primary="Security" />
                {openSections.security ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleToggleSection('notifications')}>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
                {openSections.notifications ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleToggleSection('appearance')}>
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText primary="Appearance" />
                {openSections.appearance ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              
              <ListItemButton onClick={() => handleToggleSection('preferences')}>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Preferences" />
                {openSections.preferences ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* Profile Settings */}
          <Collapse in={openSections.profile} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Profile Settings
                </Typography>
                <IconButton 
                  color={editMode.profile ? 'primary' : 'default'}
                  onClick={() => handleToggleEditMode('profile')}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    disabled={!editMode.profile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    disabled={!editMode.profile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled={!editMode.profile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!editMode.profile}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!editMode.profile}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      labelId="currency-label"
                      value={profile.currency}
                      label="Currency"
                      onChange={(e) => handleProfileChange('currency', e.target.value)}
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                      <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!editMode.profile}>
                    <InputLabel id="language-label">Language</InputLabel>
                    <Select
                      labelId="language-label"
                      value={profile.language}
                      label="Language"
                      onChange={(e) => handleProfileChange('language', e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                      <MenuItem value="de">German</MenuItem>
                      <MenuItem value="zh">Chinese</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!editMode.profile}>
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      value={profile.timezone}
                      label="Timezone"
                      onChange={(e) => handleProfileChange('timezone', e.target.value)}
                    >
                      <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                      <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                      <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                      <MenuItem value="Europe/London">London (GMT)</MenuItem>
                      <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                      <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {editMode.profile && (
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveChanges('profile')}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Paper>
          </Collapse>
          
          {/* Security Settings */}
          <Collapse in={openSections.security} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Security Settings
                </Typography>
                <IconButton 
                  color={editMode.security ? 'primary' : 'default'}
                  onClick={() => handleToggleEditMode('security')}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode.security}>
                    <InputLabel id="two-factor-label">Two-Factor Authentication</InputLabel>
                    <Select
                      labelId="two-factor-label"
                      value={security.twoFactorEnabled ? 'enabled' : 'disabled'}
                      label="Two-Factor Authentication"
                      onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Last Password Change"
                    value={security.lastPasswordChange}
                    disabled={true}
                    helperText="Password should be changed every 90 days for security"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={!editMode.security}>
                    <InputLabel id="session-timeout-label">Session Timeout (minutes)</InputLabel>
                    <Select
                      labelId="session-timeout-label"
                      value={security.sessionTimeout}
                      label="Session Timeout (minutes)"
                      onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={120}>2 hours</MenuItem>
                      <MenuItem value={240}>4 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={!editMode.security}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
              
              {editMode.security && (
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveChanges('security')}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Paper>
          </Collapse>
          
          {/* Notification Settings */}
          <Collapse in={openSections.notifications} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Notification Settings
                </Typography>
                <IconButton 
                  color={editMode.notifications ? 'primary' : 'default'}
                  onClick={() => handleToggleEditMode('notifications')}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="email-notifications-label">Email Notifications</InputLabel>
                    <Select
                      labelId="email-notifications-label"
                      value={notifications.emailNotifications ? 'enabled' : 'disabled'}
                      label="Email Notifications"
                      onChange={(e) => handleNotificationsChange('emailNotifications', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="push-notifications-label">Push Notifications</InputLabel>
                    <Select
                      labelId="push-notifications-label"
                      value={notifications.pushNotifications ? 'enabled' : 'disabled'}
                      label="Push Notifications"
                      onChange={(e) => handleNotificationsChange('pushNotifications', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="transaction-alerts-label">Transaction Alerts</InputLabel>
                    <Select
                      labelId="transaction-alerts-label"
                      value={notifications.transactionAlerts ? 'enabled' : 'disabled'}
                      label="Transaction Alerts"
                      onChange={(e) => handleNotificationsChange('transactionAlerts', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="budget-alerts-label">Budget Alerts</InputLabel>
                    <Select
                      labelId="budget-alerts-label"
                      value={notifications.budgetAlerts ? 'enabled' : 'disabled'}
                      label="Budget Alerts"
                      onChange={(e) => handleNotificationsChange('budgetAlerts', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="goal-alerts-label">Goal Alerts</InputLabel>
                    <Select
                      labelId="goal-alerts-label"
                      value={notifications.goalAlerts ? 'enabled' : 'disabled'}
                      label="Goal Alerts"
                      onChange={(e) => handleNotificationsChange('goalAlerts', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="weekly-reports-label">Weekly Reports</InputLabel>
                    <Select
                      labelId="weekly-reports-label"
                      value={notifications.weeklyReports ? 'enabled' : 'disabled'}
                      label="Weekly Reports"
                      onChange={(e) => handleNotificationsChange('weeklyReports', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.notifications}>
                    <InputLabel id="monthly-reports-label">Monthly Reports</InputLabel>
                    <Select
                      labelId="monthly-reports-label"
                      value={notifications.monthlyReports ? 'enabled' : 'disabled'}
                      label="Monthly Reports"
                      onChange={(e) => handleNotificationsChange('monthlyReports', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {editMode.notifications && (
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveChanges('notifications')}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Paper>
          </Collapse>
          
          {/* Appearance Settings */}
          <Collapse in={openSections.appearance} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Appearance Settings
                </Typography>
                <IconButton 
                  color={editMode.appearance ? 'primary' : 'default'}
                  onClick={() => handleToggleEditMode('appearance')}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.appearance}>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label"
                      value={appearance.theme}
                      label="Theme"
                      onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System Default</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.appearance}>
                    <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
                    <Select
                      labelId="color-scheme-label"
                      value={appearance.colorScheme}
                      label="Color Scheme"
                      onChange={(e) => handleAppearanceChange('colorScheme', e.target.value)}
                    >
                      <MenuItem value="blue">Blue</MenuItem>
                      <MenuItem value="green">Green</MenuItem>
                      <MenuItem value="purple">Purple</MenuItem>
                      <MenuItem value="orange">Orange</MenuItem>
                      <MenuItem value="red">Red</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.appearance}>
                    <InputLabel id="font-size-label">Font Size</InputLabel>
                    <Select
                      labelId="font-size-label"
                      value={appearance.fontSize}
                      label="Font Size"
                      onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.appearance}>
                    <InputLabel id="compact-mode-label">Compact Mode</InputLabel>
                    <Select
                      labelId="compact-mode-label"
                      value={appearance.compactMode ? 'enabled' : 'disabled'}
                      label="Compact Mode"
                      onChange={(e) => handleAppearanceChange('compactMode', e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled</MenuItem>
                      <MenuItem value="disabled">Disabled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {editMode.appearance && (
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveChanges('appearance')}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Paper>
          </Collapse>
          
          {/* Preferences Settings */}
          <Collapse in={openSections.preferences} timeout="auto" unmountOnExit>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Preferences Settings
                </Typography>
                <IconButton 
                  color={editMode.preferences ? 'primary' : 'default'}
                  onClick={() => handleToggleEditMode('preferences')}
                >
                  <EditIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.preferences}>
                    <InputLabel id="default-page-label">Default Page</InputLabel>
                    <Select
                      labelId="default-page-label"
                      value={preferences.defaultPage}
                      label="Default Page"
                      onChange={(e) => handlePreferencesChange('defaultPage', e.target.value)}
                    >
                      <MenuItem value="dashboard">Dashboard</MenuItem>
                      <MenuItem value="accounts">Accounts</MenuItem>
                      <MenuItem value="transactions">Transactions</MenuItem>
                      <MenuItem value="budgets">Budgets</MenuItem>
                      <MenuItem value="goals">Goals</MenuItem>
                      <MenuItem value="investments">Investments</MenuItem>
                      <MenuItem value="reports">Reports</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.preferences}>
                    <InputLabel id="default-currency-label">Default Currency</InputLabel>
                    <Select
                      labelId="default-currency-label"
                      value={preferences.defaultCurrency}
                      label="Default Currency"
                      onChange={(e) => handlePreferencesChange('defaultCurrency', e.target.value)}
                    >
                      <MenuItem value="USD">USD - US Dollar</MenuItem>
                      <MenuItem value="EUR">EUR - Euro</MenuItem>
                      <MenuItem value="GBP">GBP - British Pound</MenuItem>
                      <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                      <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.preferences}>
                    <InputLabel id="date-format-label">Date Format</InputLabel>
                    <Select
                      labelId="date-format-label"
                      value={preferences.defaultDateFormat}
                      label="Date Format"
                      onChange={(e) => handlePreferencesChange('defaultDateFormat', e.target.value)}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode.preferences}>
                    <InputLabel id="time-format-label">Time Format</InputLabel>
                    <Select
                      labelId="time-format-label"
                      value={preferences.defaultTimeFormat}
                      label="Time Format"
                      onChange={(e) => handlePreferencesChange('defaultTimeFormat', e.target.value)}
                    >
                      <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24h">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {editMode.preferences && (
                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveChanges('preferences')}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </Paper>
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
