import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/budgets');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/budgets', budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budgetData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  budgets: [],
  loading: false,
  error: null,
  success: false,
};

// Slice
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetsError: (state) => {
      state.error = null;
    },
    clearBudgetsSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch budgets';
      })
      
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.push(action.payload);
        state.success = true;
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create budget';
        state.success = false;
      })
      
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update budget';
        state.success = false;
      })
      
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete budget';
        state.success = false;
      })
  },
});

export const { clearBudgetsError, clearBudgetsSuccess } = budgetsSlice.actions;

export default budgetsSlice.reducer;
