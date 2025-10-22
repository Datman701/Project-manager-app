import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProjectsQuery, useGetProjectByIdQuery } from '../../store/api/projectsApi';
import { useUpdateTaskMutation, useDeleteTaskMutation } from '../../store/api/tasksApi';

const TaskDetailModal = ({ isOpen, task, onClose, onEdit, onDelete, projectId }) => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API queries and mutations
  const { data: projectsData } = useGetProjectsQuery();
  console.log('TaskDetailModal - received projectId:', projectId);
  const { data: currentProjectData } = useGetProjectByIdQuery(projectId, {
    skip: !projectId || !isOpen
  });
  console.log('TaskDetailModal - currentProjectData:', currentProjectData);
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Handle projects data
  const projects = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.projects)
      ? projectsData.projects
      : [];

  // Get current project and its members for assignment
  const currentProject = currentProjectData?.project || currentProjectData;
  console.log('TaskDetailModal - currentProject:', currentProject);
  const projectMembers = [];

  if (currentProject) {
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
  }

  console.log('TaskDetailModal - projectMembers:', projectMembers);
  console.log('TaskDetailModal - formData.assignedTo:', formData.assignedTo);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      console.log('TaskDetailModal - task data:', task);
      console.log('TaskDetailModal - task.assignedTo:', task.assignedTo);
      console.log('TaskDetailModal - task.assignedTo._id:', task.assignedTo?._id);

      const assignedToValue = task.assignedTo?._id || task.assignedTo || '';
      console.log('TaskDetailModal - assignedToValue:', assignedToValue);

      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.projectId?._id || task.project?._id || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: assignedToValue
      });
    }
  }, [task]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare task data
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo || user._id
      };

      // Add due date if provided
      if (formData.dueDate) {
        taskData.dueDate = formData.dueDate;
      }

      await updateTask({
        taskId: task._id,
        ...taskData
      }).unwrap();

      setIsEditing(false);

      // Show success message (you could add a toast notification here)
      console.log('Task updated successfully!');

    } catch (error) {
      console.error('Failed to update task:', error);
      setErrors({
        submit: error?.data?.message || 'Failed to update task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task._id).unwrap();
        onClose();
        console.log('Task deleted successfully!');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'todo': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Status options
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  if (!isOpen || !task) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Task Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name || member.email} {member.isOwner ? '(Owner)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority, Status, and Due Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              </div>

              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Project</h4>
                  <p className="text-gray-900">{task.projectId?.title || task.projectId?.name || task.project?.title || task.project?.name || 'Unknown Project'}</p>
                </div>

                {/* Assignee */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {(task.assignedTo?.name || task.assignedTo?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-900">
                      {task.assignedTo?.name || task.assignedTo?.email || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Priority</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status === 'in-progress' ? 'In Progress' :
                     task.status?.charAt(0).toUpperCase() + task.status?.slice(1) || 'To Do'}
                  </span>
                </div>

                {/* Due Date */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Due Date</h4>
                  <p className="text-gray-900">{formatDate(task.dueDate)}</p>
                </div>

                {/* Created At */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                  <p className="text-gray-900">{formatDate(task.createdAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>

              {/* Activity Section - Placeholder */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Activity</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm italic">Activity tracking will be implemented in future updates.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
