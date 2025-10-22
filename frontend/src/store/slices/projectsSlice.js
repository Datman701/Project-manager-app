import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  filters: {
    status: 'all', // all, active, completed, on-hold
    search: '',
  },
};

const projectsSlice = createSlice({
  name: 'projects',
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

    // Set projects
    setProjects: (state, action) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new project
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    // Update project
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
      }

      // Update current project if it's the same
      if (state.currentProject && state.currentProject._id === action.payload._id) {
        state.currentProject = { ...state.currentProject, ...action.payload };
      }
    },

    // Remove project
    removeProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);

      // Clear current project if it was deleted
      if (state.currentProject && state.currentProject._id === action.payload) {
        state.currentProject = null;
      }
    },

    // Set current project
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },

    // Clear current project
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },

    // Update project members
    updateProjectMembers: (state, action) => {
      const { projectId, members } = action.payload;

      // Update in projects array
      const projectIndex = state.projects.findIndex(p => p._id === projectId);
      if (projectIndex !== -1) {
        state.projects[projectIndex].members = members;
      }

      // Update current project if it's the same
      if (state.currentProject && state.currentProject._id === projectId) {
        state.currentProject.members = members;
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
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  clearCurrentProject,
  updateProjectMembers,
  setFilters,
  resetFilters,
} = projectsSlice.actions;

// Selectors
export const selectProjects = (state) => state.projects.projects;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export const selectProjectsFilters = (state) => state.projects.filters;

// Filtered projects selector
export const selectFilteredProjects = (state) => {
  const { projects, filters } = state.projects;
  let filtered = projects;

  // Filter by status
  if (filters.status !== 'all') {
    filtered = filtered.filter(project => project.status === filters.status);
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export default projectsSlice.reducer;
