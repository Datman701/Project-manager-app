import { useSelector, useDispatch } from 'react-redux';
import {
  addToast,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast
} from '../store/slices/uiSlice.js';

// Custom hook for toast notifications
export const useToast = () => {
  const dispatch = useDispatch();

  return {
    success: (message, duration = 5000) => {
      dispatch(addToast({ message, type: 'success', duration }));
    },
    error: (message, duration = 5000) => {
      dispatch(addToast({ message, type: 'error', duration }));
    },
    warning: (message, duration = 5000) => {
      dispatch(addToast({ message, type: 'warning', duration }));
    },
    info: (message, duration = 5000) => {
      dispatch(addToast({ message, type: 'info', duration }));
    },
  };
};

// Custom hook for authentication state
export const useAuth = () => {
  return useSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error,
  }));
};

// Custom hook for projects state
export const useProjects = () => {
  return useSelector((state) => ({
    projects: state.projects.projects,
    currentProject: state.projects.currentProject,
    loading: state.projects.loading,
    error: state.projects.error,
    filters: state.projects.filters,
  }));
};

// Custom hook for tasks state
export const useTasks = () => {
  return useSelector((state) => ({
    tasks: state.tasks.tasks,
    currentTask: state.tasks.currentTask,
    loading: state.tasks.loading,
    error: state.tasks.error,
    filters: state.tasks.filters,
  }));
};

// Custom hook for UI state
export const useUI = () => {
  return useSelector((state) => ({
    toasts: state.ui.toasts,
    modals: state.ui.modals,
    loading: state.ui.loading,
    sidebarOpen: state.ui.sidebarOpen,
    theme: state.ui.theme,
  }));
};
