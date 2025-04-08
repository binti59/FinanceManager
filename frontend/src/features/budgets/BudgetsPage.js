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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const BudgetsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd')
  });

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock categories data
        const mockCategories = [
          { id: 1, name: 'Food', type: 'expense' },
          { id: 2, name: 'Housing', type: 'expense' },
          { id: 3, name: 'Transportation', type: 'expense' },
          { id: 4, name: 'Entertainment', type: 'expense' },
          { id: 5, name: 'Utilities', type: 'expense' },
          { id: 6, name: 'Healthcare', type: 'expense' },
          { id: 7, name: 'Shopping', type: 'expense' },
          { id: 8, name: 'Personal', type: 'expense' },
          { id: 9, name: 'Education', type: 'expense' }
        ];
        
        // Mock budgets data with progress
        const mockBudgets = [
          { 
            id: 1, 
            category_id: 1, 
            amount: 600, 
            period: 'monthly', 
            start_date: '2025-04-01', 
            end_date: '2025-04-30',
            spent: 450,
            remaining: 150,
            progress: 75
          },
          { 
            id: 2, 
            category_id: 2, 
            amount: 1200, 
            period: 'monthly', 
            start_date: '2025-04-01', 
            end_date: '2025-04-30',
            spent: 1200,
            remaining: 0,
            progress: 100
          },
          { 
            id: 3, 
            category_id: 3, 
            amount: 400, 
            period: 'monthly', 
            start_date: '2025-04-01', 
            end_date: '2025-04-30',
            spent: 250,
            remaining: 150,
            progress: 62.5
          },
          { 
            id: 4, 
            category_id: 4, 
            amount: 300, 
            period: 'monthly', 
            start_date: '2025-04-01', 
            end_date: '2025-04-30',
            spent: 180,
            remaining: 120,
            progress: 60
          },
          { 
            id: 5, 
            category_id: 5, 
            amount: 350, 
            period: 'monthly', 
            start_date: '2025-04-01', 
            end_date: '2025-04-30',
            spent: 320,
            remaining: 30,
            progress: 91.4
          }
        ];
        
        setCategories(mockCategories);
        setBudgets(mockBudgets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenDialog = (mode, budget = null) => {
    setDialogMode(mode);
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount.toString(),
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date
      });
    } else {
      setSelectedBudget(null);
      setFormData({
        category_id: '',
        amount: '',
        period: 'monthly',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd')
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
    
    // Update end date based on period selection
    if (name === 'period') {
      const startDate = new Date(formData.start_date);
      let endDate;
      
      switch (value) {
        case 'weekly':
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case 'monthly':
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 1);
      }
      
      setFormData({
        ...formData,
        period: value,
        end_date: format(endDate, 'yyyy-MM-dd')
      });
    }
    
    // Update end date when start date changes
    if (name === 'start_date') {
      const startDate = new Date(value);
      let endDate;
      
      switch (formData.period) {
        case 'weekly':
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 7);
          break;
        case 'monthly':
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'yearly':
          endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 1);
      }
      
      setFormData({
        ...formData,
        start_date: value,
        end_date: format(endDate, 'yyyy-MM-dd')
      });
    }
  };

  const handleSubmit = () => {
    // In a real app, we would send data to the API
    // For demo purposes, we'll just update the local state
    
    const newBudget = {
      ...formData,
      amount: parseFloat(formData.amount),
      spent: 0,
      remaining: parseFloat(formData.amount),
      progress: 0
    };
    
    if (dialogMode === 'add') {
      // Add new budget
      const budgetWithId = {
        ...newBudget,
        id: Math.max(...budgets.map(b => b.id), 0) + 1
      };
      setBudgets([...budgets, budgetWithId]);
    } else {
      // Edit existing budget
      const updatedBudgets = budgets.map(budget => {
        if (budget.id === selectedBudget.id) {
          // Preserve spent amount and recalculate progress
          const spent = budget.spent;
          const remaining = newBudget.amount - spent;
          const progress = (spent / newBudget.amount) * 100;
          
          return { 
            ...newBudget, 
            id: budget.id,
            spent,
            remaining,
            progress
          };
        }
        return budget;
      });
      setBudgets(updatedBudgets);
    }
    
    handleCloseDialog();
  };

  const handleDeleteBudget = (budgetId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedBudgets = budgets.filter(budget => budget.id !== budgetId);
    setBudgets(updatedBudgets);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getPeriodLabel = (period) => {
    const periods = {
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return periods[period] || 'Unknown';
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'error';
    if (progress >= 75) return 'warning';
    return 'primary';
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
        <Typography variant="h4">Budgets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Budget
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Budget Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Budgeted
              </Typography>
              <Typography variant="h5">
                ${budgets.reduce((total, budget) => total + budget.amount, 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Spent
              </Typography>
              <Typography variant="h5">
                ${budgets.reduce((total, budget) => total + budget.spent, 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Remaining
              </Typography>
              <Typography variant="h5">
                ${budgets.reduce((total, budget) => total + budget.remaining, 0).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Active Budgets
              </Typography>
              <Typography variant="h5">
                {budgets.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Budgets List */}
      <Grid container spacing={3}>
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div">
                      {getCategoryName(budget.category_id)}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog('edit', budget)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteBudget(budget.id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    {getPeriodLabel(budget.period)} • {format(new Date(budget.start_date), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}
                  </Typography>
                  
                  <Box mt={2} mb={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2">
                        ${budget.spent.toLocaleString()} of ${budget.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color={budget.remaining >= 0 ? 'success.main' : 'error.main'}>
                        ${budget.remaining.toLocaleString()} left
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(budget.progress, 100)} 
                      color={getProgressColor(budget.progress)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" align="right">
                    {budget.progress.toFixed(1)}% used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No budgets found. Click "Add Budget" to create your first budget.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Budget' : 'Edit Budget'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category_id"
                name="category_id"
                value={formData.category_id}
                label="Category"
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Budget Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="period-label">Budget Period</InputLabel>
              <Select
                labelId="period-label"
                id="period"
                name="period"
                value={formData.period}
                label="Budget Period"
                onChange={handleInputChange}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="start_date"
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="end_date"
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.category_id || !formData.amount || !formData.start_date || !formData.end_date}
          >
            {dialogMode === 'add' ? 'Add Budget' : 'Update Budget'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetsPage;
