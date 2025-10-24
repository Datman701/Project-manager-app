/**
 * Utility functions for the application
 */

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If less than 7 days, show relative time
  if (diffDays < 7) {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Otherwise show full date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get relative time (e.g., "2 days ago")
export const getRelativeTime = (date) => {
  if (!date) return '';

  const now = new Date();
  const dateObj = new Date(date);
  const diffTime = now - dateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Get task status color
export const getStatusColor = (status) => {
  const colors = {
    'todo': 'var(--gray-500)',
    'in-progress': 'var(--warning-500)',
    'done': 'var(--success-500)'
  };
  return colors[status] || colors.todo;
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'var(--success-500)',
    'medium': 'var(--warning-500)',
    'high': 'var(--error-500)'
  };
  return colors[priority] || colors.medium;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random color for avatars
export const getRandomColor = () => {
  const colors = [
    'var(--primary-500)',
    'var(--success-500)',
    'var(--warning-500)',
    'var(--error-500)',
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f59e0b', // amber
    '#84cc16', // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Calculate project progress percentage
export const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(task => task.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Sort tasks by priority and due date
export const sortTasks = (tasks, sortBy = 'dueDate') => {
  if (!tasks) return [];

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  return [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === 'status') {
      const statusOrder = { 'todo': 1, 'in-progress': 2, 'done': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });
};
