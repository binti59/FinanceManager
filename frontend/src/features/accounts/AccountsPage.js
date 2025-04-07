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
  Divider,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const AccountsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    institution: '',
    balance: '',
    currency: 'USD'
  });

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockAccounts = [
          { id: 1, name: 'Checking Account', type: 'checking', institution: 'Bank of America', balance: 5678.90, currency: 'USD' },
          { id: 2, name: 'Savings Account', type: 'savings', institution: 'Chase Bank', balance: 15000, currency: 'USD' },
          { id: 3, name: 'Investment Account', type: 'investment', institution: 'Vanguard', balance: 25000, currency: 'USD' },
          { id: 4, name: 'Credit Card', type: 'credit', institution: 'American Express', balance: -1250.40, currency: 'USD' }
        ];
        
        setAccounts(mockAccounts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, [dispatch]);

  const handleOpenDialog = (mode, account = null) => {
    setDialogMode(mode);
    if (account) {
      setSelectedAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        institution: account.institution,
        balance: account.balance.toString(),
        currency: account.currency
      });
    } else {
      setSelectedAccount(null);
      setFormData({
        name: '',
        type: 'checking',
        institution: '',
        balance: '',
        currency: 'USD'
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
    
    const newAccount = {
      ...formData,
      balance: parseFloat(formData.balance)
    };
    
    if (dialogMode === 'add') {
      // Add new account
      const accountWithId = {
        ...newAccount,
        id: Math.max(...accounts.map(a => a.id), 0) + 1
      };
      setAccounts([...accounts, accountWithId]);
    } else {
      // Edit existing account
      const updatedAccounts = accounts.map(account => 
        account.id === selectedAccount.id ? { ...newAccount, id: account.id } : account
      );
      setAccounts(updatedAccounts);
    }
    
    handleCloseDialog();
  };

  const handleDeleteAccount = (accountId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedAccounts = accounts.filter(account => account.id !== accountId);
    setAccounts(updatedAccounts);
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const getAccountTypeLabel = (type) => {
    const types = {
      checking: 'Checking',
      savings: 'Savings',
      investment: 'Investment',
      credit: 'Credit Card',
      loan: 'Loan',
      other: 'Other'
    };
    return types[type] || 'Unknown';
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
        <Typography variant="h4">Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Account
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Balance
              </Typography>
              <Typography variant="h5">
                ${getTotalBalance().toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Accounts
              </Typography>
              <Typography variant="h5">
                {accounts.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Accounts List */}
      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" component="div">
                    {account.name}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog('edit', account)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteAccount(account.id)}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {account.institution} • {getAccountTypeLabel(account.type)}
                </Typography>
                <Typography 
                  variant="h5" 
                  component="div"
                  color={account.balance < 0 ? 'error.main' : 'inherit'}
                >
                  {account.balance.toLocaleString('en-US', {
                    style: 'currency',
                    currency: account.currency
                  })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Account Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Account' : 'Edit Account'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Account Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-type-label">Account Type</InputLabel>
              <Select
                labelId="account-type-label"
                id="type"
                name="type"
                value={formData.type}
                label="Account Type"
                onChange={handleInputChange}
              >
                <MenuItem value="checking">Checking</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
                <MenuItem value="investment">Investment</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="loan">Loan</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="institution"
              label="Institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="balance"
              label="Balance"
              name="balance"
              type="number"
              value={formData.balance}
              onChange={handleInputChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                id="currency"
                name="currency"
                value={formData.currency}
                label="Currency"
                onChange={handleInputChange}
              >
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add Account' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;
