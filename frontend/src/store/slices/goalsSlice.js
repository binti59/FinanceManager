import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/goals');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await api.post('/goals', goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/goals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const contributeToGoal = createAsyncThunk(
  'goals/contributeToGoal',
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/goals/${id}/contribute`, { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  goals: [],
  loading: false,
  error: null,
  success: false,
};

// Slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalsError: (state) => {
      state.error = null;
    },
    clearGoalsSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch goals';
      })
      
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
        state.success = true;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create goal';
        state.success = false;
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update goal';
        state.success = false;
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter(goal => goal.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete goal';
        state.success = false;
      })
      
      // Contribute to goal
      .addCase(contributeToGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(contributeToGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex(goal => goal.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(contributeToGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to contribute to goal';
        state.success = false;
      });
  },
});

export const { clearGoalsError, clearGoalsSuccess } = goalsSlice.actions;

export default goalsSlice.reducer;
