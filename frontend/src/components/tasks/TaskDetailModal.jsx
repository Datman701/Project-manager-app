import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProjectsQuery, useGetProjectByIdQuery } from '../../store/api/projectsApi';
import { useUpdateTaskMutation, useDeleteTaskMutation } from '../../store/api/tasksApi';
import { validateTaskForm, buildProjectMembers } from '../../utils/taskHelpers';
import TaskDetailView from './TaskDetailView';
import TaskEditForm from './TaskEditForm';

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
  const { data: currentProjectData } = useGetProjectByIdQuery(projectId, {
    skip: !projectId || !isOpen
  });
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
  const projectMembers = buildProjectMembers(currentProject);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      const assignedToValue = task.assignedTo?._id || task.assignedTo || '';

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
    const newErrors = validateTaskForm(formData);
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
            <TaskEditForm
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              projects={projects}
              projectMembers={projectMembers}
              currentProject={currentProject}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <TaskDetailView
              task={task}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
