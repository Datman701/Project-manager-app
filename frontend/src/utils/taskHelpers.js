// Task utility functions

export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-50 border-green-200';
    case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
];

export const validateTaskForm = (formData) => {
  const errors = {};

  if (!formData.title.trim()) {
    errors.title = 'Task title is required';
  } else if (formData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!formData.description.trim()) {
    errors.description = 'Task description is required';
  } else if (formData.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (formData.dueDate) {
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.dueDate = 'Due date cannot be in the past';
    }
  }

  return errors;
};

export const buildProjectMembers = (currentProject) => {
  const projectMembers = [];

  if (!currentProject) return projectMembers;

  // Add project owner
  if (currentProject.createdBy) {
    projectMembers.push({
      _id: currentProject.createdBy._id,
      name: currentProject.createdBy.name,
      email: currentProject.createdBy.email,
      isOwner: true
    });
  }

  // Add project members (filter out duplicates)
  if (currentProject.members) {
    currentProject.members.forEach(member => {
      const isAlreadyAdded = projectMembers.some(existing =>
        existing._id === member._id || existing.email === member.email
      );
      if (!isAlreadyAdded) {
        projectMembers.push({
          _id: member._id,
          name: member.name,
          email: member.email,
          isOwner: false
        });
      }
    });
  }

  return projectMembers;
};
