import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Toast notifications
  toasts: [],

  // Modal states
  modals: {
    createProject: false,
    editProject: false,
    createTask: false,
    editTask: false,
    confirmDelete: false,
    addMember: false,
  },

  // Loading states for UI components
  loading: {
    pageLoad: false,
    buttonAction: false,
  },

  // Sidebar state
  sidebarOpen: true,

  // Search and filter states
  searchTerm: '',
  filter: 'all',

  // Theme (for future use)
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toast actions
    addToast: (state, action) => {
      const { message, type = 'info', duration = 5000 } = action.payload;
      const id = Date.now() + Math.random();

      state.toasts.push({
        id,
        message,
        type,
        duration,
        timestamp: Date.now(),
      });
    },

    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },

    clearToasts: (state) => {
      state.toasts = [];
    },

    // Modal actions
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },

    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Loading actions
    setLoading: (state, action) => {
      const { type, value } = action.payload;
      if (state.loading.hasOwnProperty(type)) {
        state.loading[type] = value;
      }
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // Search and filter actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },

    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    clearSearchAndFilter: (state) => {
      state.searchTerm = '';
      state.filter = 'all';
    },

    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  toggleSidebar,
  setSidebarOpen,
  setSearchTerm,
  setFilter,
  clearSearchAndFilter,
  setTheme,
  toggleTheme,
} = uiSlice.actions;

// Selectors
export const selectToasts = (state) => state.ui.toasts;
export const selectModals = (state) => state.ui.modals;
export const selectLoading = (state) => state.ui.loading;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSearchTerm = (state) => state.ui.searchTerm;
export const selectFilter = (state) => state.ui.filter;
export const selectTheme = (state) => state.ui.theme;

// Individual modal selectors
export const selectIsModalOpen = (modalName) => (state) =>
  state.ui.modals[modalName] || false;

// Toast helper actions (to be used in components)
export const showSuccessToast = (message, duration) =>
  addToast({ message, type: 'success', duration });

export const showErrorToast = (message, duration) =>
  addToast({ message, type: 'error', duration });

export const showWarningToast = (message, duration) =>
  addToast({ message, type: 'warning', duration });

export const showInfoToast = (message, duration) =>
  addToast({ message, type: 'info', duration });

export default uiSlice.reducer;
