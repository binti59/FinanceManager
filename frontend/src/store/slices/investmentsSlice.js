import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchInvestments = createAsyncThunk(
  'investments/fetchInvestments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/assets?type=investment');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createInvestment = createAsyncThunk(
  'investments/createInvestment',
  async (investmentData, { rejectWithValue }) => {
    try {
      const data = { ...investmentData, type: 'investment' };
      const response = await api.post('/assets', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateInvestment = createAsyncThunk(
  'investments/updateInvestment',
  async ({ id, investmentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assets/${id}`, investmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteInvestment = createAsyncThunk(
  'investments/deleteInvestment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/assets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  investments: [],
  loading: false,
  error: null,
  success: false,
  stats: {
    totalValue: 0,
    returns: 0,
    growth: 0
  }
};

// Slice
const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearInvestmentsError: (state) => {
      state.error = null;
    },
    clearInvestmentsSuccess: (state) => {
      state.success = false;
    },
    calculateInvestmentStats: (state) => {
      // Calculate total value
      state.stats.totalValue = state.investments.reduce(
        (total, investment) => total + parseFloat(investment.value || 0),
        0
      );
      
      // Other stats calculations would go here in a real implementation
      // This is a simplified version
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch investments
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = action.payload;
        // Calculate stats after fetching investments
        const totalValue = action.payload.reduce(
          (total, investment) => total + parseFloat(investment.value || 0),
          0
        );
        state.stats.totalValue = totalValue;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch investments';
      })
      
      // Create investment
      .addCase(createInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments.push(action.payload);
        state.success = true;
        // Update total value
        state.stats.totalValue += parseFloat(action.payload.value || 0);
      })
      .addCase(createInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create investment';
        state.success = false;
      })
      
      // Update investment
      .addCase(updateInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investments.findIndex(investment => investment.id === action.payload.id);
        if (index !== -1) {
          // Update total value by removing old value and adding new value
          state.stats.totalValue -= parseFloat(state.investments[index].value || 0);
          state.stats.totalValue += parseFloat(action.payload.value || 0);
          // Update the investment
          state.investments[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update investment';
        state.success = false;
      })
      
      // Delete investment
      .addCase(deleteInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.loading = false;
        // Find the investment to get its value before removing it
        const investment = state.investments.find(inv => inv.id === action.payload);
        if (investment) {
          // Update total value
          state.stats.totalValue -= parseFloat(investment.value || 0);
        }
        // Remove the investment
        state.investments = state.investments.filter(investment => investment.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete investment';
        state.success = false;
      })
  },
});

export const { clearInvestmentsError, clearInvestmentsSuccess, calculateInvestmentStats } = investmentsSlice.actions;

export default investmentsSlice.reducer;
