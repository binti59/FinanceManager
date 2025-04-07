import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Auth pages
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';

// Protected pages
import DashboardPage from './features/dashboard/DashboardPage';
import AccountsPage from './features/accounts/AccountsPage';
import TransactionsPage from './features/transactions/TransactionsPage';
import BudgetsPage from './features/budgets/BudgetsPage';
import GoalsPage from './features/goals/GoalsPage';
import InvestmentsPage from './features/investments/InvestmentsPage';
import FinancialIndependencePage from './features/investments/FinancialIndependencePage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import ProfilePage from './features/settings/ProfilePage';

// Other pages
import NotFoundPage from './components/common/NotFoundPage';

// Auth guard
import AuthGuard from './components/common/AuthGuard';

function App() {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/financial-independence" element={<FinancialIndependencePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Box>
  );
}

export default App;
