import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken })
};

// User service
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePassword: (passwordData) => api.put('/users/password', passwordData)
};

// Account service
export const accountService = {
  getAllAccounts: () => api.get('/accounts'),
  getAccountById: (id) => api.get(`/accounts/${id}`),
  createAccount: (accountData) => api.post('/accounts', accountData),
  updateAccount: (id, accountData) => api.put(`/accounts/${id}`, accountData),
  deleteAccount: (id) => api.delete(`/accounts/${id}`),
  getAccountSummary: () => api.get('/accounts/summary')
};

// Transaction service
export const transactionService = {
  getAllTransactions: (params) => api.get('/transactions', { params }),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  createTransaction: (transactionData) => api.post('/transactions', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/transactions/${id}`, transactionData),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  getTransactionSummary: (params) => api.get('/transactions/summary', { params }),
  getTransactionsByCategory: (params) => api.get('/transactions/by-category', { params }),
  getTransactionsByAccount: (params) => api.get('/transactions/by-account', { params })
};

// Category service
export const categoryService = {
  getAllCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Budget service
export const budgetService = {
  getAllBudgets: (params) => api.get('/budgets', { params }),
  getBudgetById: (id) => api.get(`/budgets/${id}`),
  createBudget: (budgetData) => api.post('/budgets', budgetData),
  updateBudget: (id, budgetData) => api.put(`/budgets/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
  getBudgetSummary: (params) => api.get('/budgets/summary', { params }),
  getBudgetProgress: (params) => api.get('/budgets/progress', { params })
};

// Goal service
export const goalService = {
  getAllGoals: () => api.get('/goals'),
  getGoalById: (id) => api.get(`/goals/${id}`),
  createGoal: (goalData) => api.post('/goals', goalData),
  updateGoal: (id, goalData) => api.put(`/goals/${id}`, goalData),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};

// Asset service
export const assetService = {
  getAllAssets: () => api.get('/assets'),
  getAssetById: (id) => api.get(`/assets/${id}`),
  createAsset: (assetData) => api.post('/assets', assetData),
  updateAsset: (id, assetData) => api.put(`/assets/${id}`, assetData),
  deleteAsset: (id) => api.delete(`/assets/${id}`),
  getAssetAllocation: () => api.get('/assets/allocation'),
  getAssetPerformance: () => api.get('/assets/performance')
};

// Report service
export const reportService = {
  generateIncomeStatement: (params) => api.get('/reports/income-statement', { params }),
  generateBalanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  generateCashFlow: (params) => api.get('/reports/cash-flow', { params }),
  generateExpenseByCategory: (params) => api.get('/reports/expense-by-category', { params }),
  generateIncomeByCategory: (params) => api.get('/reports/income-by-category', { params }),
  generateNetWorthHistory: (params) => api.get('/reports/net-worth-history', { params }),
  generateFinancialIndependence: () => api.get('/reports/financial-independence'),
  exportReportData: (reportData) => api.post('/reports/export', reportData)
};

export default api;
