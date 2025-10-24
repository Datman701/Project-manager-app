import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProjectsQuery, useGetProjectByIdQuery } from '../../store/api/projectsApi';
import { useCreateTaskMutation } from '../../store/api/tasksApi';
import { validateTaskForm, buildProjectMembers } from '../../utils/taskHelpers';
import TaskForm from './TaskForm';

const CreateTaskModal = ({ isOpen, onClose, selectedProjectId = null }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: selectedProjectId || '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    assignedTo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API queries
  const { data: projectsData } = useGetProjectsQuery();
  const { data: currentProjectData } = useGetProjectByIdQuery(formData.project, {
    skip: !formData.project || !isOpen
  });
  const [createTask] = useCreateTaskMutation();

  // Handle projects data
  const projects = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.projects)
      ? projectsData.projects
      : [];

  // Get current project members for assignment
  const currentProject = currentProjectData?.project || currentProjectData;
  const projectMembers = buildProjectMembers(currentProject);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        project: selectedProjectId || '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: user?._id || ''
      });
      setErrors({});
    }
  }, [isOpen, selectedProjectId, user]);

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
    const newErrors = validateTaskForm(formData);

    // Additional validation for project selection in create mode
    if (!formData.project) {
      newErrors.project = 'Please select a project';
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
        projectId: formData.project,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo || user._id
      };

      // Add due date if provided
      if (formData.dueDate) {
        taskData.dueDate = formData.dueDate;
      }

      await createTask(taskData).unwrap();
      onClose();

    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({
        submit: error?.data?.message || 'Failed to create task. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
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

        {/* Content */}
        <div className="px-6 py-4">
          <TaskForm
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            projects={projects}
            projectMembers={projectMembers}
            currentProject={currentProject}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitText="Create Task"
            isCreating={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
