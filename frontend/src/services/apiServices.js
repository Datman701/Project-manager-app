import api from './api.js';

// Auth API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    // Since you're using cookies, just clear local storage
    localStorage.removeItem('user');
    return { message: 'Logged out successfully' };
  }
};

// Projects API calls
export const projectsAPI = {
  // Get all projects for logged-in user
  getProjects: async () => {
    const response = await api.get('/project/getprojects');
    return response.data;
  },

  // Get single project by ID
  getProject: async (projectId) => {
    const response = await api.get(`/project/getproject/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/project/createproject', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.patch(`/project/updateproject/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/project/deleteproject/${projectId}`);
    return response.data;
  },

  // Get project members
  getMembers: async (projectId) => {
    const response = await api.get(`/project/getmembers/${projectId}`);
    return response.data;
  },

  // Add member to project
  addMember: async (projectId, userData) => {
    const response = await api.post(`/project/addmember/${projectId}`, userData);
    return response.data;
  },

  // Remove member from project
  removeMember: async (projectId, userData) => {
    const response = await api.delete(`/project/deletemember/${projectId}`, { data: userData });
    return response.data;
  }
};

// Tasks API calls
export const tasksAPI = {
  // Get all tasks (you might want to filter by project)
  getTasks: async () => {
    const response = await api.get('/task/gettasks');
    return response.data;
  },

  // Get single task by ID
  getTask: async (taskId) => {
    const response = await api.get(`/task/gettaskbyid/${taskId}`);
    return response.data;
  },

  // Create new task
  createTask: async (projectId, taskData) => {
    const response = await api.post(`/task/createtask/${projectId}`, taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    const response = await api.patch(`/task/updatetask/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/task/deleteTask/${taskId}`);
    return response.data;
  }
};
