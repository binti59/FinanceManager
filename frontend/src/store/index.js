import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import budgetsReducer from './slices/budgetsSlice';
import goalsReducer from './slices/goalsSlice';
import investmentsReducer from './slices/investmentsSlice';
import reportsReducer from './slices/reportsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer,
    budgets: budgetsReducer,
    goals: goalsReducer,
    investments: investmentsReducer,
    reports: reportsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
