import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  incomeCategories: [],
  expenseCategories: [],
  loading: false,
  error: null,
  success: false,
};

// Slice
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
    clearCategoriesSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.incomeCategories = action.payload.filter(cat => cat.type === 'income');
        state.expenseCategories = action.payload.filter(cat => cat.type === 'expense');
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch categories';
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
        if (action.payload.type === 'income') {
          state.incomeCategories.push(action.payload);
        } else if (action.payload.type === 'expense') {
          state.expenseCategories.push(action.payload);
        }
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create category';
        state.success = false;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        
        // Update in type-specific arrays
        if (action.payload.type === 'income') {
          const incomeIndex = state.incomeCategories.findIndex(cat => cat.id === action.payload.id);
          if (incomeIndex !== -1) {
            state.incomeCategories[incomeIndex] = action.payload;
          } else {
            state.incomeCategories.push(action.payload);
            state.expenseCategories = state.expenseCategories.filter(cat => cat.id !== action.payload.id);
          }
        } else if (action.payload.type === 'expense') {
          const expenseIndex = state.expenseCategories.findIndex(cat => cat.id === action.payload.id);
          if (expenseIndex !== -1) {
            state.expenseCategories[expenseIndex] = action.payload;
          } else {
            state.expenseCategories.push(action.payload);
            state.incomeCategories = state.incomeCategories.filter(cat => cat.id !== action.payload.id);
          }
        }
        
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update category';
        state.success = false;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        state.incomeCategories = state.incomeCategories.filter(cat => cat.id !== action.payload);
        state.expenseCategories = state.expenseCategories.filter(cat => cat.id !== action.payload);
        state.success = true;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete category';
        state.success = false;
      });
  },
});

export const { clearCategoriesError, clearCategoriesSuccess } = categoriesSlice.actions;

export default categoriesSlice.reducer;
