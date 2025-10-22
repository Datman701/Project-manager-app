import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdateProjectMutation } from '../../store/api/projectsApi';

const EditProjectModal = ({ isOpen, onClose, project }) => {
  const dispatch = useDispatch();
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  // Extract the actual project data (handle nested structure)
  const actualProject = project?.project || project;

  console.log('EditProjectModal received project:', project);
  console.log('EditProjectModal actual project:', actualProject);

  const [formData, setFormData] = useState({
    name: actualProject?.name || actualProject?.title || '',
    description: actualProject?.description || '',
    priority: actualProject?.priority || 'medium',
    status: actualProject?.status || 'active',
    deadline: actualProject?.deadline || actualProject?.dueDate ?
      new Date(actualProject.deadline || actualProject.dueDate).toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});

  // Update form data when project prop changes
  useState(() => {
    if (actualProject) {
      setFormData({
        name: actualProject.name || actualProject.title || '',
        description: actualProject.description || '',
        priority: actualProject.priority || 'medium',
        status: actualProject.status || 'active',
        deadline: actualProject.deadline || actualProject.dueDate ?
          new Date(actualProject.deadline || actualProject.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [actualProject]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const projectData = {
        ...formData,
        deadline: formData.deadline || null
      };

      // Map frontend field names to backend expected names
      const updateData = {
        id: actualProject._id,  // Use actualProject._id instead of project._id
        name: projectData.name,  // Backend will handle name -> title mapping
        description: projectData.description,
        status: projectData.status,
        priority: projectData.priority,
        deadline: projectData.deadline  // Backend will handle deadline -> dueDate mapping
      };

      console.log('Sending update data:', updateData);
      console.log('Project ID being used:', actualProject._id);
      await updateProject(updateData).unwrap();

      // Close modal on success
      onClose();

      // You could add a success notification here
      console.log('Project updated successfully');

    } catch (error) {
      console.error('Failed to update project:', error);
      setErrors({
        submit: error?.data?.message || 'Failed to update project. Please try again.'
      });
    }
  };

  const handleClose = () => {
    // Reset form to original project data
    if (actualProject) {
      setFormData({
        name: actualProject.name || actualProject.title || '',
        description: actualProject.description || '',
        priority: actualProject.priority || 'medium',
        status: actualProject.status || 'active',
        deadline: actualProject.deadline || actualProject.dueDate ?
          new Date(actualProject.deadline || actualProject.dueDate).toISOString().split('T')[0] : ''
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen || !actualProject) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Project</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your project"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="edit-priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700 mb-1">
              Deadline (Optional)
            </label>
            <input
              type="date"
              id="edit-deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.deadline ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading && (
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {isLoading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
