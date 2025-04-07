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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense'
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    account: null,
    category: null,
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock accounts data
        const mockAccounts = [
          { id: 1, name: 'Checking Account' },
          { id: 2, name: 'Savings Account' },
          { id: 3, name: 'Investment Account' },
          { id: 4, name: 'Credit Card' }
        ];
        
        // Mock categories data
        const mockCategories = [
          { id: 1, name: 'Food', type: 'expense' },
          { id: 2, name: 'Housing', type: 'expense' },
          { id: 3, name: 'Transportation', type: 'expense' },
          { id: 4, name: 'Entertainment', type: 'expense' },
          { id: 5, name: 'Utilities', type: 'expense' },
          { id: 6, name: 'Healthcare', type: 'expense' },
          { id: 7, name: 'Salary', type: 'income' },
          { id: 8, name: 'Investment', type: 'income' },
          { id: 9, name: 'Gift', type: 'income' }
        ];
        
        // Mock transactions data
        const mockTransactions = [
          { id: 1, account_id: 1, category_id: 1, amount: -120.50, description: 'Grocery Store', date: '2025-04-05', type: 'expense' },
          { id: 2, account_id: 1, category_id: 7, amount: 5000, description: 'Salary', date: '2025-04-01', type: 'income' },
          { id: 3, account_id: 4, category_id: 5, amount: -85.20, description: 'Electric Bill', date: '2025-04-03', type: 'expense' },
          { id: 4, account_id: 4, category_id: 1, amount: -45.80, description: 'Restaurant', date: '2025-04-06', type: 'expense' },
          { id: 5, account_id: 1, category_id: 3, amount: -35.40, description: 'Gas Station', date: '2025-04-04', type: 'expense' },
          { id: 6, account_id: 2, category_id: 8, amount: 120.75, description: 'Dividend Payment', date: '2025-04-02', type: 'income' },
          { id: 7, account_id: 1, category_id: 4, amount: -65.00, description: 'Movie Tickets', date: '2025-04-07', type: 'expense' },
          { id: 8, account_id: 4, category_id: 2, amount: -1200.00, description: 'Rent Payment', date: '2025-04-01', type: 'expense' },
          { id: 9, account_id: 1, category_id: 6, amount: -45.00, description: 'Pharmacy', date: '2025-04-08', type: 'expense' },
          { id: 10, account_id: 3, category_id: 8, amount: 250.00, description: 'Stock Sale', date: '2025-04-05', type: 'income' },
          { id: 11, account_id: 1, category_id: 9, amount: 100.00, description: 'Birthday Gift', date: '2025-04-10', type: 'income' },
          { id: 12, account_id: 4, category_id: 3, amount: -55.30, description: 'Uber Ride', date: '2025-04-09', type: 'expense' }
        ];
        
        setAccounts(mockAccounts);
        setCategories(mockCategories);
        setTransactions(mockTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenDialog = (mode, transaction = null) => {
    setDialogMode(mode);
    if (transaction) {
      setSelectedTransaction(transaction);
      setFormData({
        account_id: transaction.account_id,
        category_id: transaction.category_id,
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        date: transaction.date,
        type: transaction.type
      });
    } else {
      setSelectedTransaction(null);
      setFormData({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense'
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
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;
    
    const newTransaction = {
      ...formData,
      amount: finalAmount
    };
    
    if (dialogMode === 'add') {
      // Add new transaction
      const transactionWithId = {
        ...newTransaction,
        id: Math.max(...transactions.map(t => t.id), 0) + 1
      };
      setTransactions([transactionWithId, ...transactions]);
    } else {
      // Edit existing transaction
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === selectedTransaction.id ? { ...newTransaction, id: transaction.id } : transaction
      );
      setTransactions(updatedTransactions);
    }
    
    handleCloseDialog();
  };

  const handleDeleteTransaction = (transactionId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
    setTransactions(updatedTransactions);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      account: null,
      category: null,
      dateFrom: '',
      dateTo: '',
      type: 'all'
    });
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryType = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.type : 'expense';
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Account filter
    if (filters.account && transaction.account_id !== filters.account.id) {
      return false;
    }
    
    // Category filter
    if (filters.category && transaction.category_id !== filters.category.id) {
      return false;
    }
    
    // Date range filter
    if (filters.dateFrom && transaction.date < filters.dateFrom) {
      return false;
    }
    
    if (filters.dateTo && transaction.date > filters.dateTo) {
      return false;
    }
    
    // Transaction type filter
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }
    
    return true;
  });

  // Calculate pagination
  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        <Typography variant="h4">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <TextField
              placeholder="Search transactions..."
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
            >
              Filters
            </Button>
          </Box>
          <Box>
            <Button
              variant="text"
              onClick={resetFilters}
              disabled={!filters.search && !filters.account && !filters.category && !filters.dateFrom && !filters.dateTo && filters.type === 'all'}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={accounts}
                getOptionLabel={(option) => option.name}
                value={filters.account}
                onChange={(event, newValue) => handleFilterChange('account', newValue)}
                renderInput={(params) => <TextField {...params} label="Account" size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                value={filters.category}
                onChange={(event, newValue) => handleFilterChange('category', newValue)}
                renderInput={(params) => <TextField {...params} label="Category" size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                fullWidth
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="To Date"
                type="date"
                size="small"
                fullWidth
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryName(transaction.category_id)} 
                        size="small"
                        color={getCategoryType(transaction.category_id) === 'income' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{getAccountName(transaction.account_id)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {transaction.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog('edit', transaction)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
              <Select
                labelId="transaction-type-label"
                id="type"
                name="type"
                value={formData.type}
                label="Transaction Type"
                onChange={handleInputChange}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-label">Account</InputLabel>
              <Select
                labelId="account-label"
                id="account_id"
                name="account_id"
                value={formData.account_id}
                label="Account"
                onChange={handleInputChange}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
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
                {categories
                  .filter(category => category.type === formData.type)
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="date"
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add Transaction' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
