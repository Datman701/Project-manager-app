import { useState } from 'react';
import { useSelector } from 'react-redux';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onClick, isDragging = false, project }) => {
  const { user } = useSelector((state) => state.auth);
  const [isHovered, setIsHovered] = useState(false);

  // Check if current user can edit/delete this task
  const canModifyTask = () => {
    if (!user || !task) return false;

    // User can edit/delete if they are:
    // 1. The task creator
    // 2. The project owner
    const isTaskCreator = task.createdBy?._id === user._id || task.createdBy === user._id;

    // Check project owner - either from project prop or from task.projectId.createdBy
    let isProjectOwner = false;
    if (project) {
      isProjectOwner = project.createdBy === user._id || project.createdBy?._id === user._id;
    } else if (task.projectId?.createdBy) {
      isProjectOwner = task.projectId.createdBy === user._id || task.projectId.createdBy._id === user._id;
    }

    return isTaskCreator || isProjectOwner;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600 bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600 bg-orange-50' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600 bg-yellow-50' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-600 bg-blue-50' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-600 bg-gray-50' };
    }
  };

  const dueDate = formatDueDate(task.dueDate);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${getPriorityColor(task.priority)} border-l-4 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(task)}
    >
      {/* Header with Project and Priority */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`}></div>
          {(task.projectId || task.project) && (
            <span className="text-xs text-blue-600 font-medium truncate">
              {(task.projectId?.title || task.projectId?.name || task.project?.title || task.project?.name)}
            </span>
          )}
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {task.priority || 'Medium'}
          </span>
        </div>

        {isHovered && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            {canModifyTask() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(task);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canModifyTask() && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(task);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Metadata */}
      <div className="space-y-2 mb-3">
        {/* Assignee */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Assigned to:</span>
          {task.assignedTo ? (
            <span className="text-xs font-medium text-gray-700">
              {task.assignedTo.name || task.assignedTo.email?.split('@')[0]}
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Unassigned
            </span>
          )}
        </div>

        {/* Task Creator */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Assigned by:</span>
          {task.createdBy ? (
            <span className="text-xs font-medium text-gray-600">
              {task.createdBy.name || task.createdBy.email?.split('@')[0]}
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Unknown
            </span>
          )}
        </div>
      </div>

      {/* Due Date */}
      {dueDate && (
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center space-x-1 text-xs">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`font-medium ${dueDate.color}`}>
              {dueDate.text}
            </span>
          </div>
        </div>
      )}



      {/* Status Change Buttons (only show on hover for non-current status) */}
      {isHovered && onStatusChange && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex space-x-2">
            {task.status !== 'todo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task._id, 'todo', task);
                }}
                className="flex-1 text-xs py-1 px-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                To Do
              </button>
            )}
            {task.status !== 'in-progress' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task._id, 'in-progress', task);
                }}
                className="flex-1 text-xs py-1 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                In Progress
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task._id, 'completed', task);
                }}
                className="flex-1 text-xs py-1 px-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
