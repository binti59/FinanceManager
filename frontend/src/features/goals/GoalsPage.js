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
  LinearProgress,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const GoalsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'active'
  });

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock goals data
        const mockGoals = [
          { 
            id: 1, 
            name: 'Emergency Fund', 
            target_amount: 10000, 
            current_amount: 5000, 
            target_date: '2025-10-01', 
            priority: 'high',
            status: 'active',
            progress: 50
          },
          { 
            id: 2, 
            name: 'Down Payment for House', 
            target_amount: 50000, 
            current_amount: 15000, 
            target_date: '2027-04-01', 
            priority: 'medium',
            status: 'active',
            progress: 30
          },
          { 
            id: 3, 
            name: 'New Car', 
            target_amount: 25000, 
            current_amount: 8000, 
            target_date: '2026-07-01', 
            priority: 'low',
            status: 'active',
            progress: 32
          },
          { 
            id: 4, 
            name: 'Vacation Fund', 
            target_amount: 5000, 
            current_amount: 5000, 
            target_date: '2025-06-01', 
            priority: 'medium',
            status: 'completed',
            progress: 100
          }
        ];
        
        setGoals(mockGoals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenDialog = (mode, goal = null) => {
    setDialogMode(mode);
    if (goal) {
      setSelectedGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount.toString(),
        current_amount: goal.current_amount.toString(),
        target_date: goal.target_date,
        priority: goal.priority,
        status: goal.status
      });
    } else {
      setSelectedGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '',
        target_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
        priority: 'medium',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // In a real app, we would send data to the API
    // For demo purposes, we'll just update the local state
    
    const targetAmount = parseFloat(formData.target_amount);
    const currentAmount = parseFloat(formData.current_amount);
    const progress = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
    
    // Update status if goal is completed
    const status = progress >= 100 ? 'completed' : formData.status;
    
    const newGoal = {
      ...formData,
      target_amount: targetAmount,
      current_amount: currentAmount,
      progress,
      status
    };
    
    if (dialogMode === 'add') {
      // Add new goal
      const goalWithId = {
        ...newGoal,
        id: Math.max(...goals.map(g => g.id), 0) + 1
      };
      setGoals([...goals, goalWithId]);
    } else {
      // Edit existing goal
      const updatedGoals = goals.map(goal => 
        goal.id === selectedGoal.id ? { ...newGoal, id: goal.id } : goal
      );
      setGoals(updatedGoals);
    }
    
    handleCloseDialog();
  };

  const handleDeleteGoal = (goalId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
  };

  const getPriorityLabel = (priority) => {
    const priorities = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };
    return priorities[priority] || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusLabel = (status) => {
    const statuses = {
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed'
    };
    return statuses[status] || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'primary',
      paused: 'warning',
      completed: 'success'
    };
    return colors[status] || 'default';
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'secondary';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Financial Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Goal
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Goals Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Goals
              </Typography>
              <Typography variant="h5">
                {goals.length}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Target Amount
              </Typography>
              <Typography variant="h5">
                ${goals.reduce((total, goal) => total + goal.target_amount, 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Saved
              </Typography>
              <Typography variant="h5">
                ${goals.reduce((total, goal) => total + goal.current_amount, 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Completed Goals
              </Typography>
              <Typography variant="h5">
                {goals.filter(goal => goal.status === 'completed').length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Goals List */}
      <Grid container spacing={3}>
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div">
                      {goal.name}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('edit', goal)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteGoal(goal.id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Target: ${goal.target_amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      By {format(new Date(goal.target_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  
                  <Box mt={2} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2">
                        ${goal.current_amount.toLocaleString()} saved
                      </Typography>
                      <Typography variant="body2">
                        ${(goal.target_amount - goal.current_amount).toLocaleString()} to go
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={goal.progress} 
                      color={getProgressColor(goal.progress)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography 
                      variant="body2" 
                      color={getPriorityColor(goal.priority) + '.main'}
                    >
                      Priority: {getPriorityLabel(goal.priority)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={getStatusColor(goal.status) + '.main'}
                    >
                      {getStatusLabel(goal.status)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No goals found. Click "Add Goal" to create your first financial goal.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Goal' : 'Edit Goal'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Goal Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="target_amount"
              label="Target Amount"
              name="target_amount"
              type="number"
              value={formData.target_amount}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="current_amount"
              label="Current Amount"
              name="current_amount"
              type="number"
              value={formData.current_amount}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="target_date"
              label="Target Date"
              name="target_date"
              type="date"
              value={formData.target_date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleInputChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add Goal' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalsPage;
