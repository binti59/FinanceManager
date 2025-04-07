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
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Slider,
  InputAdornment
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const FIRECalculatorPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Basic FIRE Calculator inputs
  const [basicInputs, setBasicInputs] = useState({
    currentAge: 30,
    retirementAge: 45,
    currentSavings: 100000,
    annualIncome: 80000,
    annualExpenses: 50000,
    savingsRate: 37.5,
    investmentReturn: 7,
    withdrawalRate: 4,
    inflationRate: 2.5
  });
  
  // Advanced FIRE Calculator inputs
  const [advancedInputs, setAdvancedInputs] = useState({
    currentAge: 30,
    retirementAge: 45,
    lifeExpectancy: 90,
    currentSavings: 100000,
    annualIncome: 80000,
    annualExpenses: 50000,
    savingsRate: 37.5,
    preRetirementReturn: 7,
    postRetirementReturn: 5,
    withdrawalRate: 4,
    inflationRate: 2.5,
    socialSecurityAge: 67,
    socialSecurityAmount: 2000,
    additionalIncome: 0
  });
  
  // Results
  const [basicResults, setBasicResults] = useState({
    yearsToRetirement: 15,
    retirementSavingsGoal: 1250000,
    monthlyInvestment: 2500,
    retirementIncomeMonthly: 4166.67
  });
  
  const [advancedResults, setAdvancedResults] = useState({
    yearsToRetirement: 15,
    retirementSavingsGoal: 1250000,
    monthlyInvestment: 2500,
    retirementIncomeMonthly: 4166.67,
    successProbability: 95
  });
  
  // Projection data for charts
  const [projectionData, setProjectionData] = useState({
    labels: [],
    savingsData: [],
    expensesData: [],
    incomeData: []
  });

  useEffect(() => {
    // Calculate basic FIRE results
    calculateBasicFIRE();
    
    // Calculate advanced FIRE results
    calculateAdvancedFIRE();
    
    // Generate projection data for charts
    generateProjectionData();
  }, [basicInputs, advancedInputs]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBasicInputChange = (name, value) => {
    let newInputs = { ...basicInputs, [name]: value };
    
    // If annual income or expenses change, recalculate savings rate
    if (name === 'annualIncome' || name === 'annualExpenses') {
      const savingsRate = ((newInputs.annualIncome - newInputs.annualExpenses) / newInputs.annualIncome) * 100;
      newInputs.savingsRate = Math.max(0, Math.min(100, savingsRate));
    }
    
    // If savings rate changes, recalculate annual expenses
    if (name === 'savingsRate') {
      const annualExpenses = newInputs.annualIncome * (1 - (newInputs.savingsRate / 100));
      newInputs.annualExpenses = annualExpenses;
    }
    
    setBasicInputs(newInputs);
  };

  const handleAdvancedInputChange = (name, value) => {
    let newInputs = { ...advancedInputs, [name]: value };
    
    // If annual income or expenses change, recalculate savings rate
    if (name === 'annualIncome' || name === 'annualExpenses') {
      const savingsRate = ((newInputs.annualIncome - newInputs.annualExpenses) / newInputs.annualIncome) * 100;
      newInputs.savingsRate = Math.max(0, Math.min(100, savingsRate));
    }
    
    // If savings rate changes, recalculate annual expenses
    if (name === 'savingsRate') {
      const annualExpenses = newInputs.annualIncome * (1 - (newInputs.savingsRate / 100));
      newInputs.annualExpenses = annualExpenses;
    }
    
    setAdvancedInputs(newInputs);
  };

  const calculateBasicFIRE = () => {
    // Calculate retirement savings goal based on the 4% rule (or user-defined withdrawal rate)
    const annualExpensesInRetirement = basicInputs.annualExpenses * Math.pow(1 + (basicInputs.inflationRate / 100), basicInputs.retirementAge - basicInputs.currentAge);
    const retirementSavingsGoal = annualExpensesInRetirement * (100 / basicInputs.withdrawalRate);
    
    // Calculate years to retirement
    const yearsToRetirement = basicInputs.retirementAge - basicInputs.currentAge;
    
    // Calculate required monthly investment
    const monthlyInvestment = calculateRequiredMonthlySavings(
      basicInputs.currentSavings,
      retirementSavingsGoal,
      yearsToRetirement * 12,
      basicInputs.investmentReturn / 100 / 12
    );
    
    // Calculate monthly retirement income
    const retirementIncomeMonthly = (retirementSavingsGoal * (basicInputs.withdrawalRate / 100)) / 12;
    
    setBasicResults({
      yearsToRetirement,
      retirementSavingsGoal,
      monthlyInvestment,
      retirementIncomeMonthly
    });
  };

  const calculateAdvancedFIRE = () => {
    // Calculate retirement savings goal based on the 4% rule (or user-defined withdrawal rate)
    const annualExpensesInRetirement = advancedInputs.annualExpenses * Math.pow(1 + (advancedInputs.inflationRate / 100), advancedInputs.retirementAge - advancedInputs.currentAge);
    const retirementSavingsGoal = annualExpensesInRetirement * (100 / advancedInputs.withdrawalRate);
    
    // Calculate years to retirement
    const yearsToRetirement = advancedInputs.retirementAge - advancedInputs.currentAge;
    
    // Calculate required monthly investment
    const monthlyInvestment = calculateRequiredMonthlySavings(
      advancedInputs.currentSavings,
      retirementSavingsGoal,
      yearsToRetirement * 12,
      advancedInputs.preRetirementReturn / 100 / 12
    );
    
    // Calculate monthly retirement income
    const retirementIncomeMonthly = (retirementSavingsGoal * (advancedInputs.withdrawalRate / 100)) / 12;
    
    // Calculate success probability (simplified model)
    // In a real app, this would use Monte Carlo simulations
    const successProbability = calculateSuccessProbability(
      advancedInputs.withdrawalRate,
      advancedInputs.postRetirementReturn,
      advancedInputs.inflationRate,
      advancedInputs.lifeExpectancy - advancedInputs.retirementAge
    );
    
    setAdvancedResults({
      yearsToRetirement,
      retirementSavingsGoal,
      monthlyInvestment,
      retirementIncomeMonthly,
      successProbability
    });
  };

  const calculateRequiredMonthlySavings = (currentSavings, goal, months, monthlyRate) => {
    // PMT formula: PMT = (FV - PV * (1 + r)^n) / (((1 + r)^n - 1) / r)
    const futureValue = goal;
    const presentValue = currentSavings;
    const n = months;
    const r = monthlyRate;
    
    const compoundFactor = Math.pow(1 + r, n);
    const payment = (futureValue - presentValue * compoundFactor) / ((compoundFactor - 1) / r);
    
    return payment;
  };

  const calculateSuccessProbability = (withdrawalRate, returnRate, inflationRate, retirementYears) => {
    // This is a simplified model
    // In a real app, this would use Monte Carlo simulations
    
    // Higher withdrawal rates decrease success probability
    const withdrawalFactor = 100 - (withdrawalRate - 3) * 10;
    
    // Higher return rates increase success probability
    const returnFactor = (returnRate - inflationRate) * 5;
    
    // Longer retirement periods decrease success probability
    const yearsFactor = 100 - (retirementYears > 30 ? (retirementYears - 30) * 1 : 0);
    
    // Combine factors
    let probability = (withdrawalFactor + returnFactor + yearsFactor) / 3;
    
    // Ensure probability is between 0 and 100
    probability = Math.max(0, Math.min(100, probability));
    
    return probability;
  };

  const generateProjectionData = () => {
    const yearsToProject = Math.max(
      advancedInputs.lifeExpectancy - advancedInputs.currentAge,
      50
    );
    
    const labels = [];
    const savingsData = [];
    const expensesData = [];
    const incomeData = [];
    
    let currentSavings = basicInputs.currentSavings;
    let currentExpenses = basicInputs.annualExpenses;
    let currentIncome = 0;
    
    for (let year = 0; year <= yearsToProject; year++) {
      const age = basicInputs.currentAge + year;
      labels.push(age);
      
      // Before retirement
      if (age < basicInputs.retirementAge) {
        const annualSavings = basicInputs.annualIncome * (basicInputs.savingsRate / 100);
        currentSavings = currentSavings * (1 + basicInputs.investmentReturn / 100) + annualSavings;
        currentIncome = 0; // No retirement income yet
      } 
      // After retirement
      else {
        currentIncome = currentSavings * (basicInputs.withdrawalRate / 100);
        currentSavings = (currentSavings - currentIncome) * (1 + basicInputs.investmentReturn / 100);
      }
      
      // Adjust expenses for inflation
      if (year > 0) {
        currentExpenses = currentExpenses * (1 + basicInputs.inflationRate / 100);
      }
      
      savingsData.push(currentSavings);
      expensesData.push(currentExpenses);
      incomeData.push(currentIncome);
    }
    
    setProjectionData({
      labels,
      savingsData,
      expensesData,
      incomeData
    });
  };

  // Prepare data for projection chart
  const projectionChartData = {
    labels: projectionData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: projectionData.savingsData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Annual Expenses',
        data: projectionData.expensesData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Retirement Income',
        data: projectionData.incomeData,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Financial Independence Calculator
      </Typography>
      
      {/* Tabs for different calculators */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Basic FIRE Calculator" />
          <Tab label="Advanced FIRE Calculator" />
          <Tab label="Projection" />
        </Tabs>
      </Paper>
      
      {/* Basic FIRE Calculator */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Inputs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Age"
                    type="number"
                    value={basicInputs.currentAge}
                    onChange={(e) => handleBasicInputChange('currentAge', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 18, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Retirement Age"
                    type="number"
                    value={basicInputs.retirementAge}
                    onChange={(e) => handleBasicInputChange('retirementAge', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: basicInputs.currentAge + 1, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Savings"
                    type="number"
                    value={basicInputs.currentSavings}
                    onChange={(e) => handleBasicInputChange('currentSavings', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Income"
                    type="number"
                    value={basicInputs.annualIncome}
                    onChange={(e) => handleBasicInputChange('annualIncome', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Expenses"
                    type="number"
                    value={basicInputs.annualExpenses}
                    onChange={(e) => handleBasicInputChange('annualExpenses', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Savings Rate: {basicInputs.savingsRate.toFixed(1)}%</Typography>
                  <Slider
                    value={basicInputs.savingsRate}
                    onChange={(e, newValue) => handleBasicInputChange('savingsRate', newValue)}
                    min={0}
                    max={90}
                    step={0.5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Expected Investment Return: {basicInputs.investmentReturn}%</Typography>
                  <Slider
                    value={basicInputs.investmentReturn}
                    onChange={(e, newValue) => handleBasicInputChange('investmentReturn', newValue)}
                    min={1}
                    max={12}
                    step={0.5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Withdrawal Rate: {basicInputs.withdrawalRate}%</Typography>
                  <Slider
                    value={basicInputs.withdrawalRate}
                    onChange={(e, newValue) => handleBasicInputChange('withdrawalRate', newValue)}
                    min={2}
                    max={6}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Inflation Rate: {basicInputs.inflationRate}%</Typography>
                  <Slider
                    value={basicInputs.inflationRate}
                    onChange={(e, newValue) => handleBasicInputChange('inflationRate', newValue)}
                    min={0}
                    max={5}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Box mt={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Years to Retirement
                        </Typography>
                        <Typography variant="h4" component="div">
                          {basicResults.yearsToRetirement}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Retirement Savings Goal
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${basicResults.retirementSavingsGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Required Monthly Investment
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${basicResults.monthlyInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Monthly Retirement Income
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${basicResults.retirementIncomeMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Advanced FIRE Calculator */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Advanced Inputs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Current Age"
                    type="number"
                    value={advancedInputs.currentAge}
                    onChange={(e) => handleAdvancedInputChange('currentAge', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 18, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Retirement Age"
                    type="number"
                    value={advancedInputs.retirementAge}
                    onChange={(e) => handleAdvancedInputChange('retirementAge', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: advancedInputs.currentAge + 1, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Life Expectancy"
                    type="number"
                    value={advancedInputs.lifeExpectancy}
                    onChange={(e) => handleAdvancedInputChange('lifeExpectancy', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: advancedInputs.retirementAge + 1, max: 120 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Savings"
                    type="number"
                    value={advancedInputs.currentSavings}
                    onChange={(e) => handleAdvancedInputChange('currentSavings', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Income"
                    type="number"
                    value={advancedInputs.annualIncome}
                    onChange={(e) => handleAdvancedInputChange('annualIncome', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Expenses"
                    type="number"
                    value={advancedInputs.annualExpenses}
                    onChange={(e) => handleAdvancedInputChange('annualExpenses', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Savings Rate: {advancedInputs.savingsRate.toFixed(1)}%</Typography>
                  <Slider
                    value={advancedInputs.savingsRate}
                    onChange={(e, newValue) => handleAdvancedInputChange('savingsRate', newValue)}
                    min={0}
                    max={90}
                    step={0.5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Pre-Retirement Return: {advancedInputs.preRetirementReturn}%</Typography>
                  <Slider
                    value={advancedInputs.preRetirementReturn}
                    onChange={(e, newValue) => handleAdvancedInputChange('preRetirementReturn', newValue)}
                    min={1}
                    max={12}
                    step={0.5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Post-Retirement Return: {advancedInputs.postRetirementReturn}%</Typography>
                  <Slider
                    value={advancedInputs.postRetirementReturn}
                    onChange={(e, newValue) => handleAdvancedInputChange('postRetirementReturn', newValue)}
                    min={1}
                    max={10}
                    step={0.5}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Withdrawal Rate: {advancedInputs.withdrawalRate}%</Typography>
                  <Slider
                    value={advancedInputs.withdrawalRate}
                    onChange={(e, newValue) => handleAdvancedInputChange('withdrawalRate', newValue)}
                    min={2}
                    max={6}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Inflation Rate: {advancedInputs.inflationRate}%</Typography>
                  <Slider
                    value={advancedInputs.inflationRate}
                    onChange={(e, newValue) => handleAdvancedInputChange('inflationRate', newValue)}
                    min={0}
                    max={5}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Social Security Age"
                    type="number"
                    value={advancedInputs.socialSecurityAge}
                    onChange={(e) => handleAdvancedInputChange('socialSecurityAge', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: advancedInputs.retirementAge, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Social Security"
                    type="number"
                    value={advancedInputs.socialSecurityAmount}
                    onChange={(e) => handleAdvancedInputChange('socialSecurityAmount', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Monthly Income in Retirement"
                    type="number"
                    value={advancedInputs.additionalIncome}
                    onChange={(e) => handleAdvancedInputChange('additionalIncome', parseFloat(e.target.value))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Advanced Results
              </Typography>
              <Box mt={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Years to Retirement
                        </Typography>
                        <Typography variant="h4" component="div">
                          {advancedResults.yearsToRetirement}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Success Probability
                        </Typography>
                        <Typography variant="h4" component="div" color={advancedResults.successProbability >= 80 ? 'success.main' : advancedResults.successProbability >= 60 ? 'warning.main' : 'error.main'}>
                          {advancedResults.successProbability.toFixed(0)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Retirement Savings Goal
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${advancedResults.retirementSavingsGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Required Monthly Investment
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${advancedResults.monthlyInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Monthly Retirement Income
                        </Typography>
                        <Typography variant="h4" component="div">
                          ${advancedResults.retirementIncomeMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Projection Chart */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Retirement Projection
          </Typography>
          <Box height={500}>
            <Line 
              data={projectionChartData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Age'
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
                  },
                  annotation: {
                    annotations: {
                      retirementLine: {
                        type: 'line',
                        xMin: basicInputs.retirementAge,
                        xMax: basicInputs.retirementAge,
                        borderColor: 'rgba(255, 99, 132, 0.5)',
                        borderWidth: 2,
                        borderDash: [6, 6],
                        label: {
                          content: 'Retirement',
                          display: true,
                          position: 'start'
                        }
                      }
                    }
                  }
                }
              }}
            />
          </Box>
          <Box mt={3}>
            <Typography variant="body1" gutterBottom>
              This chart shows the projected growth of your portfolio over time, along with your expenses and retirement income. The vertical line indicates your retirement age.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Note: This is a simplified projection based on constant returns and inflation rates. Real-world results will vary due to market volatility and changing economic conditions.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default FIRECalculatorPage;
