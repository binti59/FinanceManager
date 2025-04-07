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
  TablePagination,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

const ReportsPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Report data
  const [incomeExpenseData, setIncomeExpenseData] = useState({
    labels: [],
    incomeData: [],
    expenseData: []
  });
  
  const [categoryData, setCategoryData] = useState({
    labels: [],
    data: []
  });
  
  const [trendData, setTrendData] = useState({
    labels: [],
    netWorthData: [],
    savingsRateData: []
  });
  
  const [budgetData, setBudgetData] = useState([]);
  
  // Date range filter
  const [dateRange, setDateRange] = useState('month');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data based on date range
        generateMockData();
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, dateRange, customStartDate, customEndDate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleCustomDateChange = (name, value) => {
    if (name === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const generateMockData = () => {
    // Generate date labels based on selected range
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const netWorthData = [];
    const savingsRateData = [];
    
    let startDate, endDate, dateFormat;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(new Date().setDate(new Date().getDate() - 7));
        endDate = new Date();
        dateFormat = 'EEE';
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          labels.push(format(d, dateFormat));
          incomeData.push(Math.floor(Math.random() * 300) + 100);
          expenseData.push(Math.floor(Math.random() * 200) + 50);
          netWorthData.push(40000 + Math.floor(Math.random() * 2000));
          savingsRateData.push(Math.floor(Math.random() * 20) + 20);
        }
        break;
      case 'month':
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        endDate = new Date();
        dateFormat = 'MMM dd';
        for (let i = 0; i < 30; i += 3) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          if (d <= endDate) {
            labels.push(format(d, dateFormat));
            incomeData.push(Math.floor(Math.random() * 1000) + 500);
            expenseData.push(Math.floor(Math.random() * 800) + 300);
            netWorthData.push(40000 + Math.floor(Math.random() * 2000));
            savingsRateData.push(Math.floor(Math.random() * 20) + 20);
          }
        }
        break;
      case 'year':
        startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
        endDate = new Date();
        dateFormat = 'MMM yyyy';
        for (let i = 0; i < 12; i++) {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + i);
          if (d <= endDate) {
            labels.push(format(d, dateFormat));
            incomeData.push(Math.floor(Math.random() * 5000) + 3000);
            expenseData.push(Math.floor(Math.random() * 3000) + 2000);
            netWorthData.push(35000 + (i * 1000) + Math.floor(Math.random() * 1000));
            savingsRateData.push(Math.floor(Math.random() * 15) + 25);
          }
        }
        break;
      case 'custom':
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 14) {
          dateFormat = 'MMM dd';
          for (let i = 0; i <= diffDays; i += 1) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            if (d <= endDate) {
              labels.push(format(d, dateFormat));
              incomeData.push(Math.floor(Math.random() * 300) + 100);
              expenseData.push(Math.floor(Math.random() * 200) + 50);
              netWorthData.push(40000 + Math.floor(Math.random() * 2000));
              savingsRateData.push(Math.floor(Math.random() * 20) + 20);
            }
          }
        } else if (diffDays <= 90) {
          dateFormat = 'MMM dd';
          for (let i = 0; i <= diffDays; i += 7) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            if (d <= endDate) {
              labels.push(format(d, dateFormat));
              incomeData.push(Math.floor(Math.random() * 1000) + 500);
              expenseData.push(Math.floor(Math.random() * 800) + 300);
              netWorthData.push(40000 + Math.floor(Math.random() * 2000));
              savingsRateData.push(Math.floor(Math.random() * 20) + 20);
            }
          }
        } else {
          dateFormat = 'MMM yyyy';
          const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
          for (let i = 0; i <= diffMonths; i++) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            if (d <= endDate) {
              labels.push(format(d, dateFormat));
              incomeData.push(Math.floor(Math.random() * 5000) + 3000);
              expenseData.push(Math.floor(Math.random() * 3000) + 2000);
              netWorthData.push(35000 + (i * 1000) + Math.floor(Math.random() * 1000));
              savingsRateData.push(Math.floor(Math.random() * 15) + 25);
            }
          }
        }
        break;
      default:
        break;
    }
    
    // Set income/expense data
    setIncomeExpenseData({
      labels,
      incomeData,
      expenseData
    });
    
    // Set trend data
    setTrendData({
      labels,
      netWorthData,
      savingsRateData
    });
    
    // Set category data
    setCategoryData({
      labels: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping'],
      data: [
        Math.floor(Math.random() * 500) + 300,
        Math.floor(Math.random() * 1000) + 1000,
        Math.floor(Math.random() * 300) + 200,
        Math.floor(Math.random() * 200) + 100,
        Math.floor(Math.random() * 200) + 150,
        Math.floor(Math.random() * 200) + 100,
        Math.floor(Math.random() * 300) + 200
      ]
    });
    
    // Set budget data
    setBudgetData([
      { category: 'Food', budget: 600, spent: 450, remaining: 150, progress: 75 },
      { category: 'Housing', budget: 1200, spent: 1200, remaining: 0, progress: 100 },
      { category: 'Transportation', budget: 400, spent: 250, remaining: 150, progress: 62.5 },
      { category: 'Entertainment', budget: 300, spent: 180, remaining: 120, progress: 60 },
      { category: 'Utilities', budget: 350, spent: 320, remaining: 30, progress: 91.4 },
      { category: 'Healthcare', budget: 200, spent: 100, remaining: 100, progress: 50 },
      { category: 'Shopping', budget: 400, spent: 350, remaining: 50, progress: 87.5 }
    ]);
  };

  const handleExportReport = () => {
    // In a real app, this would generate a PDF or CSV file
    alert('Report export functionality would be implemented here');
  };

  const handlePrintReport = () => {
    // In a real app, this would open the print dialog
    window.print();
  };

  // Prepare data for income/expense chart
  const incomeExpenseChartData = {
    labels: incomeExpenseData.labels,
    datasets: [
      {
        label: 'Income',
        data: incomeExpenseData.incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: incomeExpenseData.expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Prepare data for category chart
  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
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

  // Prepare data for trend chart
  const trendChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Net Worth',
        data: trendData.netWorthData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        yAxisID: 'y',
        tension: 0.4
      },
      {
        label: 'Savings Rate (%)',
        data: trendData.savingsRateData,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
        yAxisID: 'y1',
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
        <Typography variant="h4">Reports & Analytics</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintReport}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="date-range-label">Date Range</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={dateRange}
                label="Date Range"
                onChange={handleDateRangeChange}
              >
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="year">Last 12 Months</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {dateRange === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Tabs for different reports */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<BarChartIcon />} label="Income & Expenses" />
          <Tab icon={<PieChartIcon />} label="Categories" />
          <Tab icon={<BarChartIcon />} label="Budget" />
          <Tab icon={<BarChartIcon />} label="Trends" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Income vs. Expenses
          </Typography>
          <Box height={400}>
            <Bar 
              data={incomeExpenseChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value}`
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
                      }
                    }
                  }
                }
              }}
            />
          </Box>
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Income
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${incomeExpenseData.incomeData.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${incomeExpenseData.expenseData.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Net Income
                    </Typography>
                    <Typography 
                      variant="h5" 
                      component="div"
                      color={(incomeExpenseData.incomeData.reduce((a, b) => a + b, 0) - incomeExpenseData.expenseData.reduce((a, b) => a + b, 0)) >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${(incomeExpenseData.incomeData.reduce((a, b) => a + b, 0) - incomeExpenseData.expenseData.reduce((a, b) => a + b, 0)).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Savings Rate
                    </Typography>
                    <Typography variant="h5" component="div">
                      {Math.round(((incomeExpenseData.incomeData.reduce((a, b) => a + b, 0) - incomeExpenseData.expenseData.reduce((a, b) => a + b, 0)) / incomeExpenseData.incomeData.reduce((a, b) => a + b, 0)) * 100)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Expense Categories
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box height={400} display="flex" justifyContent="center">
                <Box width="80%" height="100%">
                  <Pie 
                    data={categoryChartData} 
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
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData.labels.map((category, index) => {
                      const amount = categoryData.data[index];
                      const total = categoryData.data.reduce((a, b) => a + b, 0);
                      const percentage = ((amount / total) * 100).toFixed(1);
                      
                      return (
                        <TableRow key={category}>
                          <TableCell>{category}</TableCell>
                          <TableCell align="right">${amount.toLocaleString()}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>${categoryData.data.reduce((a, b) => a + b, 0).toLocaleString()}</strong></TableCell>
                      <TableCell align="right"><strong>100%</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Budget Performance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Budget</TableCell>
                  <TableCell align="right">Spent</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                  <TableCell align="right">Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgetData.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">${item.budget.toLocaleString()}</TableCell>
                    <TableCell align="right">${item.spent.toLocaleString()}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ color: item.remaining >= 0 ? 'success.main' : 'error.main' }}
                    >
                      ${item.remaining.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(item.progress, 100)} 
                            color={item.progress >= 90 ? 'error' : item.progress >= 75 ? 'warning' : 'primary'}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box minWidth={35}>
                          <Typography variant="body2" color="textSecondary">
                            {item.progress.toFixed(0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right"><strong>${budgetData.reduce((a, b) => a + b.budget, 0).toLocaleString()}</strong></TableCell>
                  <TableCell align="right"><strong>${budgetData.reduce((a, b) => a + b.spent, 0).toLocaleString()}</strong></TableCell>
                  <TableCell align="right"><strong>${budgetData.reduce((a, b) => a + b.remaining, 0).toLocaleString()}</strong></TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      <strong>
                        {Math.round((budgetData.reduce((a, b) => a + b.spent, 0) / budgetData.reduce((a, b) => a + b.budget, 0)) * 100)}% Overall
                      </strong>
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Financial Trends
          </Typography>
          <Box height={400}>
            <Line 
              data={trendChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: false,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    },
                    grid: {
                      drawOnChartArea: false
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        if (context.dataset.label === 'Net Worth') {
                          return `Net Worth: $${context.raw.toLocaleString()}`;
                        } else {
                          return `Savings Rate: ${context.raw}%`;
                        }
                      }
                    }
                  }
                }
              }}
            />
          </Box>
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Trend Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Starting Net Worth
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${trendData.netWorthData[0].toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Current Net Worth
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${trendData.netWorthData[trendData.netWorthData.length - 1].toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Net Worth Change
                    </Typography>
                    <Typography 
                      variant="h5" 
                      component="div"
                      color={(trendData.netWorthData[trendData.netWorthData.length - 1] - trendData.netWorthData[0]) >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${(trendData.netWorthData[trendData.netWorthData.length - 1] - trendData.netWorthData[0]).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Savings Rate
                    </Typography>
                    <Typography variant="h5" component="div">
                      {Math.round(trendData.savingsRateData.reduce((a, b) => a + b, 0) / trendData.savingsRateData.length)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReportsPage;
