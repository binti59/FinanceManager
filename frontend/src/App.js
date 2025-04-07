import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';

import theme from './theme';
import store from './store';

// Layout
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Feature Pages
import DashboardPage from './features/dashboard/DashboardPage';
import AccountsPage from './features/accounts/AccountsPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import BudgetsPage from './features/budgets/BudgetsPage';
import GoalsPage from './features/goals/GoalsPage';
import InvestmentsPage from './features/investments/InvestmentsPage';
import FIRECalculatorPage from './features/fire-calculator/FIRECalculatorPage';
import ReportsPage from './features/reports/ReportsPage';
import FilesPage from './features/files/FilesPage';
import SettingsPage from './features/settings/SettingsPage';
import HelpSupportPage from './features/help/HelpSupportPage';

// Common Components
import AuthGuard from './components/common/AuthGuard';
import NotFoundPage from './components/common/NotFoundPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/investments" element={<InvestmentsPage />} />
                <Route path="/fire-calculator" element={<FIRECalculatorPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpSupportPage />} />
                {/* Removed ProfilePage route */}
              </Route>
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
