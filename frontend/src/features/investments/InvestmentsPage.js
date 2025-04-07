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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

const InvestmentsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    symbol: '',
    shares: '',
    purchase_price: '',
    current_price: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [tabValue, setTabValue] = useState(0);

  // Performance history data
  const [performanceHistory, setPerformanceHistory] = useState([]);

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock assets data
        const mockAssets = [
          { 
            id: 1, 
            name: 'Apple Inc.', 
            type: 'stock', 
            symbol: 'AAPL', 
            shares: 10, 
            purchase_price: 150.75, 
            current_price: 175.25,
            purchase_date: '2024-10-15',
            total_value: 1752.50,
            gain_loss: 245.00,
            gain_loss_percent: 16.25
          },
          { 
            id: 2, 
            name: 'Microsoft Corporation', 
            type: 'stock', 
            symbol: 'MSFT', 
            shares: 5, 
            purchase_price: 280.50, 
            current_price: 325.75,
            purchase_date: '2024-11-20',
            total_value: 1628.75,
            gain_loss: 226.25,
            gain_loss_percent: 16.13
          },
          { 
            id: 3, 
            name: 'Vanguard Total Stock Market ETF', 
            type: 'etf', 
            symbol: 'VTI', 
            shares: 15, 
            purchase_price: 220.30, 
            current_price: 245.80,
            purchase_date: '2024-09-05',
            total_value: 3687.00,
            gain_loss: 382.50,
            gain_loss_percent: 11.58
          },
          { 
            id: 4, 
            name: 'Bitcoin', 
            type: 'crypto', 
            symbol: 'BTC', 
            shares: 0.5, 
            purchase_price: 42000.00, 
            current_price: 65000.00,
            purchase_date: '2024-08-10',
            total_value: 32500.00,
            gain_loss: 11500.00,
            gain_loss_percent: 54.76
          },
          { 
            id: 5, 
            name: 'Real Estate Property', 
            type: 'real_estate', 
            symbol: 'N/A', 
            shares: 1, 
            purchase_price: 350000.00, 
            current_price: 380000.00,
            purchase_date: '2023-05-15',
            total_value: 380000.00,
            gain_loss: 30000.00,
            gain_loss_percent: 8.57
          }
        ];
        
        // Mock performance history data
        const mockPerformanceHistory = [
          { date: '2025-01-01', value: 410000 },
          { date: '2025-01-15', value: 415000 },
          { date: '2025-02-01', value: 412000 },
          { date: '2025-02-15', value: 418000 },
          { date: '2025-03-01', value: 420000 },
          { date: '2025-03-15', value: 417000 },
          { date: '2025-04-01', value: 419568.25 }
        ];
        
        setAssets(mockAssets);
        setPerformanceHistory(mockPerformanceHistory);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenDialog = (mode, asset = null) => {
    setDialogMode(mode);
    if (asset) {
      setSelectedAsset(asset);
      setFormData({
        name: asset.name,
        type: asset.type,
        symbol: asset.symbol,
        shares: asset.shares.toString(),
        purchase_price: asset.purchase_price.toString(),
        current_price: asset.current_price.toString(),
        purchase_date: asset.purchase_date
      });
    } else {
      setSelectedAsset(null);
      setFormData({
        name: '',
        type: 'stock',
        symbol: '',
        shares: '',
        purchase_price: '',
        current_price: '',
        purchase_date: format(new Date(), 'yyyy-MM-dd')
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
    
    const shares = parseFloat(formData.shares);
    const purchasePrice = parseFloat(formData.purchase_price);
    const currentPrice = parseFloat(formData.current_price);
    const totalValue = shares * currentPrice;
    const gainLoss = totalValue - (shares * purchasePrice);
    const gainLossPercent = (gainLoss / (shares * purchasePrice)) * 100;
    
    const newAsset = {
      ...formData,
      shares,
      purchase_price: purchasePrice,
      current_price: currentPrice,
      total_value: totalValue,
      gain_loss: gainLoss,
      gain_loss_percent: gainLossPercent
    };
    
    if (dialogMode === 'add') {
      // Add new asset
      const assetWithId = {
        ...newAsset,
        id: Math.max(...assets.map(a => a.id), 0) + 1
      };
      setAssets([...assets, assetWithId]);
    } else {
      // Edit existing asset
      const updatedAssets = assets.map(asset => 
        asset.id === selectedAsset.id ? { ...newAsset, id: asset.id } : asset
      );
      setAssets(updatedAssets);
    }
    
    handleCloseDialog();
  };

  const handleDeleteAsset = (assetId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedAssets = assets.filter(asset => asset.id !== assetId);
    setAssets(updatedAssets);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getAssetTypeLabel = (type) => {
    const types = {
      stock: 'Stock',
      etf: 'ETF',
      mutual_fund: 'Mutual Fund',
      bond: 'Bond',
      crypto: 'Cryptocurrency',
      real_estate: 'Real Estate',
      other: 'Other'
    };
    return types[type] || 'Unknown';
  };

  // Calculate total portfolio value
  const getTotalPortfolioValue = () => {
    return assets.reduce((total, asset) => total + asset.total_value, 0);
  };

  // Calculate total gain/loss
  const getTotalGainLoss = () => {
    return assets.reduce((total, asset) => total + asset.gain_loss, 0);
  };

  // Calculate average gain/loss percentage
  const getAverageGainLossPercent = () => {
    if (assets.length === 0) return 0;
    const totalInvestment = assets.reduce((total, asset) => total + (asset.purchase_price * asset.shares), 0);
    const totalValue = getTotalPortfolioValue();
    return ((totalValue - totalInvestment) / totalInvestment) * 100;
  };

  // Prepare data for asset allocation chart
  const assetAllocationData = {
    labels: assets.map(asset => asset.name),
    datasets: [
      {
        data: assets.map(asset => asset.total_value),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8AC926'
        ]
      }
    ]
  };

  // Prepare data for performance history chart
  const performanceChartData = {
    labels: performanceHistory.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceHistory.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }
    ]
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
        <Typography variant="h4">Investments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Investment
        </Button>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Portfolio Value
              </Typography>
              <Typography variant="h5">
                ${getTotalPortfolioValue().toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Gain/Loss
              </Typography>
              <Typography 
                variant="h5"
                color={getTotalGainLoss() >= 0 ? 'success.main' : 'error.main'}
              >
                {getTotalGainLoss() >= 0 ? '+' : ''}${getTotalGainLoss().toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Return Rate
              </Typography>
              <Typography 
                variant="h5"
                color={getAverageGainLossPercent() >= 0 ? 'success.main' : 'error.main'}
              >
                {getAverageGainLossPercent() >= 0 ? '+' : ''}{getAverageGainLossPercent().toFixed(2)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Assets
              </Typography>
              <Typography variant="h5">
                {assets.length}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Assets" />
          <Tab label="Allocation" />
          <Tab label="Performance" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Gain/Loss</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{getAssetTypeLabel(asset.type)}</TableCell>
                      <TableCell>{asset.symbol}</TableCell>
                      <TableCell align="right">{asset.shares.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })}</TableCell>
                      <TableCell align="right">${asset.purchase_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">${asset.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">
                        <Typography
                          color={asset.gain_loss >= 0 ? 'success.main' : 'error.main'}
                        >
                          {asset.gain_loss >= 0 ? '+' : ''}${asset.gain_loss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <br />
                          ({asset.gain_loss >= 0 ? '+' : ''}{asset.gain_loss_percent.toFixed(2)}%)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('edit', asset)}
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAsset(asset.id)}
                          aria-label="delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No investments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Asset Allocation
          </Typography>
          <Box height={400} display="flex" justifyContent="center">
            <Box width="70%" height="100%">
              {assets.length > 0 ? (
                <Pie 
                  data={assetAllocationData} 
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1" color="textSecondary">
                    No data available for allocation chart
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Portfolio Performance
          </Typography>
          <Box height={400}>
            {performanceHistory.length > 0 ? (
              <Line 
                data={performanceChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Portfolio Value: $${context.raw.toLocaleString()}`;
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="textSecondary">
                  No data available for performance chart
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Add/Edit Asset Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Investment' : 'Edit Investment'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Investment Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="asset-type-label">Asset Type</InputLabel>
              <Select
                labelId="asset-type-label"
                id="type"
                name="type"
                value={formData.type}
                label="Asset Type"
                onChange={handleInputChange}
              >
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="etf">ETF</MenuItem>
                <MenuItem value="mutual_fund">Mutual Fund</MenuItem>
                <MenuItem value="bond">Bond</MenuItem>
                <MenuItem value="crypto">Cryptocurrency</MenuItem>
                <MenuItem value="real_estate">Real Estate</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="symbol"
              label="Symbol/Ticker"
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="shares"
              label="Shares/Units"
              name="shares"
              type="number"
              value={formData.shares}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="purchase_price"
              label="Purchase Price"
              name="purchase_price"
              type="number"
              value={formData.purchase_price}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="current_price"
              label="Current Price"
              name="current_price"
              type="number"
              value={formData.current_price}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="purchase_date"
              label="Purchase Date"
              name="purchase_date"
              type="date"
              value={formData.purchase_date}
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
            {dialogMode === 'add' ? 'Add Investment' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvestmentsPage;
