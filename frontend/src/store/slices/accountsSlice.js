import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  summary: { total: 0, byType: {} },
  loading: false,
  error: null
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    fetchAccountsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAccountsSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchAccountsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAccountSummaryStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAccountSummarySuccess: (state, action) => {
      state.loading = false;
      state.summary = action.payload;
    },
    fetchAccountSummaryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createAccountStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createAccountSuccess: (state, action) => {
      state.loading = false;
      state.items.push(action.payload);
    },
    createAccountFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateAccountStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateAccountSuccess: (state, action) => {
      state.loading = false;
      const index = state.items.findIndex(account => account.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateAccountFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteAccountStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteAccountSuccess: (state, action) => {
      state.loading = false;
      state.items = state.items.filter(account => account.id !== action.payload);
    },
    deleteAccountFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchAccountsStart,
  fetchAccountsSuccess,
  fetchAccountsFailure,
  fetchAccountSummaryStart,
  fetchAccountSummarySuccess,
  fetchAccountSummaryFailure,
  createAccountStart,
  createAccountSuccess,
  createAccountFailure,
  updateAccountStart,
  updateAccountSuccess,
  updateAccountFailure,
  deleteAccountStart,
  deleteAccountSuccess,
  deleteAccountFailure,
  clearError
} = accountsSlice.actions;

export default accountsSlice.reducer;
