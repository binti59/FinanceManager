import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
Chart.register(...registerables);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    netWorth: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    accounts: [],
    recentTransactions: [],
    budgetProgress: [],
    netWorthHistory: [],
    expensesByCategory: []
  });

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = {
          netWorth: 45678.90,
          monthlyIncome: 5000,
          monthlyExpenses: 3500,
          savingsRate: 30,
          accounts: [
            { id: 1, name: 'Checking Account', balance: 5678.90, type: 'bank' },
            { id: 2, name: 'Savings Account', balance: 15000, type: 'bank' },
            { id: 3, name: 'Investment Account', balance: 25000, type: 'investment' }
          ],
          recentTransactions: [
            { id: 1, description: 'Grocery Store', amount: -120.50, date: '2025-04-05', category: 'Food' },
            { id: 2, description: 'Salary', amount: 5000, date: '2025-04-01', category: 'Income' },
            { id: 3, description: 'Electric Bill', amount: -85.20, date: '2025-04-03', category: 'Utilities' },
            { id: 4, description: 'Restaurant', amount: -45.80, date: '2025-04-06', category: 'Dining' },
            { id: 5, description: 'Gas Station', amount: -35.40, date: '2025-04-04', category: 'Transportation' }
          ],
          budgetProgress: [
            { category: 'Food', spent: 450, budget: 600, percentage: 75 },
            { category: 'Housing', spent: 1200, budget: 1200, percentage: 100 },
            { category: 'Transportation', spent: 250, budget: 400, percentage: 62.5 },
            { category: 'Entertainment', spent: 180, budget: 300, percentage: 60 },
            { category: 'Utilities', spent: 320, budget: 350, percentage: 91.4 }
          ],
          netWorthHistory: [
            { month: 'Jan', value: 40000 },
            { month: 'Feb', value: 41500 },
            { month: 'Mar', value: 43000 },
            { month: 'Apr', value: 45678.90 }
          ],
          expensesByCategory: [
            { category: 'Food', amount: 450 },
            { category: 'Housing', amount: 1200 },
            { category: 'Transportation', amount: 250 },
            { category: 'Entertainment', amount: 180 },
            { category: 'Utilities', amount: 320 },
            { category: 'Other', amount: 100 }
          ]
        };
        
        setDashboardData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dispatch]);

  // Chart data for Net Worth History
  const netWorthChartData = {
    labels: dashboardData.netWorthHistory.map(item => item.month),
    datasets: [
      {
        label: 'Net Worth',
        data: dashboardData.netWorthHistory.map(item => item.value),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4
      }
    ]
  };

  // Chart data for Expenses by Category
  const expenseChartData = {
    labels: dashboardData.expensesByCategory.map(item => item.category),
    datasets: [
      {
        data: dashboardData.expensesByCategory.map(item => item.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }
    ]
  };

  // Chart data for Budget Progress
  const budgetChartData = {
    labels: dashboardData.budgetProgress.map(item => item.category),
    datasets: [
      {
        label: 'Spent',
        data: dashboardData.budgetProgress.map(item => item.spent),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      },
      {
        label: 'Budget',
        data: dashboardData.budgetProgress.map(item => item.budget),
        backgroundColor: 'rgba(255, 206, 86, 0.6)'
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
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Net Worth
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${dashboardData.netWorth.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalanceIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Monthly Income
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${dashboardData.monthlyIncome.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Monthly Expenses
                  </Typography>
                  <Typography variant="h5" component="div">
                    ${dashboardData.monthlyExpenses.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingDownIcon color="error" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Savings Rate
                  </Typography>
                  <Typography variant="h5" component="div">
                    {dashboardData.savingsRate}%
                  </Typography>
                </Box>
                <AssessmentIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts and Tables */}
      <Grid container spacing={3}>
        {/* Net Worth Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Net Worth History
            </Typography>
            <Box height={300}>
              <Line 
                data={netWorthChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Expense by Category */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box height={300} display="flex" justifyContent="center" alignItems="center">
              <Pie 
                data={expenseChartData} 
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Budget Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Progress
            </Typography>
            <Box height={300}>
              <Bar 
                data={budgetChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `$${value}`
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Transactions
              </Typography>
              <Button variant="outlined" size="small" onClick={() => {}}>
                View All
              </Button>
            </Box>
            <Box>
              {dashboardData.recentTransactions.map((transaction) => (
                <Box key={transaction.id} mb={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {transaction.category} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                    >
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Accounts Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Accounts
              </Typography>
              <Button variant="outlined" size="small" onClick={() => {}}>
                Manage Accounts
              </Button>
            </Box>
            <Grid container spacing={2}>
              {dashboardData.accounts.map((account) => (
                <Grid item xs={12} sm={6} md={4} key={account.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {account.name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </Typography>
                      <Typography variant="h5" component="div">
                        ${account.balance.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
