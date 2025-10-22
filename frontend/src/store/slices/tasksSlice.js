import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    status: 'all', // all, todo, in-progress, done
    priority: 'all', // all, low, medium, high
    assignedTo: 'all', // all, me, or userId
    search: '',
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set tasks
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new task
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },

    // Update task
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }

      // Update current task if it's the same
      if (state.currentTask && state.currentTask._id === action.payload._id) {
        state.currentTask = { ...state.currentTask, ...action.payload };
      }
    },

    // Remove task
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);

      // Clear current task if it was deleted
      if (state.currentTask && state.currentTask._id === action.payload) {
        state.currentTask = null;
      }
    },

    // Set current task
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },

    // Clear current task
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },

    // Quick status update
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        task.status = status;
      }

      // Update current task if it's the same
      if (state.currentTask && state.currentTask._id === taskId) {
        state.currentTask.status = status;
      }
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear tasks (when switching projects)
    clearTasks: (state) => {
      state.tasks = [];
      state.currentTask = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setCurrentTask,
  clearCurrentTask,
  updateTaskStatus,
  setFilters,
  resetFilters,
  clearTasks,
} = tasksSlice.actions;

// Selectors
export const selectTasks = (state) => state.tasks.tasks;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;
export const selectTasksFilters = (state) => state.tasks.filters;

// Filtered tasks selector
export const selectFilteredTasks = (state) => {
  const { tasks, filters } = state.tasks;
  const currentUser = state.auth.user;
  let filtered = tasks;

  // Filter by status
  if (filters.status !== 'all') {
    filtered = filtered.filter(task => task.status === filters.status);
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    filtered = filtered.filter(task => task.priority === filters.priority);
  }

  // Filter by assigned user
  if (filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'me' && currentUser) {
      filtered = filtered.filter(task => task.assignedTo._id === currentUser._id);
    } else {
      filtered = filtered.filter(task => task.assignedTo._id === filters.assignedTo);
    }
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

// Tasks by status selector
export const selectTasksByStatus = (state) => {
  const tasks = state.tasks.tasks;
  return {
    todo: tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    done: tasks.filter(task => task.status === 'done'),
  };
};

// My tasks selector
export const selectMyTasks = (state) => {
  const tasks = state.tasks.tasks;
  const currentUser = state.auth.user;

  if (!currentUser) return [];

  return tasks.filter(task => task.assignedTo._id === currentUser._id);
};

export default tasksSlice.reducer;
