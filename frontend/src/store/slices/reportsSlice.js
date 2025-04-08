import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const generateReport = createAsyncThunk(
  'reports/generateReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchIncomeExpenseReport = createAsyncThunk(
  'reports/fetchIncomeExpenseReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/income-expense', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchNetWorthReport = createAsyncThunk(
  'reports/fetchNetWorthReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/net-worth', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchCategorySpendingReport = createAsyncThunk(
  'reports/fetchCategorySpendingReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/category-spending', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  reports: [],
  currentReport: null,
  incomeExpenseData: null,
  netWorthData: null,
  categorySpendingData: null,
  loading: false,
  error: null,
  success: false,
};

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.error = null;
    },
    clearReportsSuccess: (state) => {
      state.success = false;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reports';
      })
      
      // Generate report
      .addCase(generateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        state.reports.push(action.payload);
        state.success = true;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to generate report';
        state.success = false;
      })
      
      // Fetch income expense report
      .addCase(fetchIncomeExpenseReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomeExpenseReport.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeExpenseData = action.payload;
      })
      .addCase(fetchIncomeExpenseReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch income expense report';
      })
      
      // Fetch net worth report
      .addCase(fetchNetWorthReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNetWorthReport.fulfilled, (state, action) => {
        state.loading = false;
        state.netWorthData = action.payload;
      })
      .addCase(fetchNetWorthReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch net worth report';
      })
      
      // Fetch category spending report
      .addCase(fetchCategorySpendingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorySpendingReport.fulfilled, (state, action) => {
        state.loading = false;
        state.categorySpendingData = action.payload;
      })
      .addCase(fetchCategorySpendingReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch category spending report';
      })
  },
});

export const { clearReportsError, clearReportsSuccess, setCurrentReport } = reportsSlice.actions;

export default reportsSlice.reducer;
