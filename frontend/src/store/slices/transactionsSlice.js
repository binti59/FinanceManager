import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  filters: { dateRange: null, category: null, account: null },
  pagination: { page: 1, limit: 10, total: 0 },
  loading: false,
  error: null
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    fetchTransactionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTransactionsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
    },
    fetchTransactionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    createTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTransactionSuccess: (state, action) => {
      state.loading = false;
      state.items = [action.payload, ...state.items].slice(0, state.pagination.limit);
      state.pagination.total += 1;
    },
    createTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTransactionSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex(transaction => transaction.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTransactionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTransactionSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter(transaction => transaction.id !== action.payload);
      state.pagination.total -= 1;
    },
    deleteTransactionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchTransactionsStart,
  fetchTransactionsSuccess,
  fetchTransactionsFailure,
  setFilters,
  setPage,
  createTransactionStart,
  createTransactionSuccess,
  createTransactionFailure,
  updateTransactionStart,
  updateTransactionSuccess,
  updateTransactionFailure,
  deleteTransactionStart,
  deleteTransactionSuccess,
  deleteTransactionFailure,
  clearError
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
