import { formatDate, getPriorityColor, getStatusColor } from '../../utils/taskHelpers';

const TaskDetailView = ({ task, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {/* Task Title */}
      <div>
        <h4 className="text-xl font-semibold text-gray-900">{task.title}</h4>
      </div>

      {/* Task Description */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
        <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
      </div>

      {/* Task Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Priority</h5>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
          </span>
        </div>

        {/* Status */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Status</h5>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status === 'in-progress' ? 'In Progress' :
             task.status === 'todo' ? 'To Do' :
             task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : 'To Do'}
          </span>
        </div>

        {/* Due Date */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Due Date</h5>
          <p className="text-gray-600">{formatDate(task.dueDate)}</p>
        </div>

        {/* Assigned To */}
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h5>
          <p className="text-gray-600">
            {task.assignedTo?.name || task.assignedTo?.email || 'Unassigned'}
          </p>
        </div>
      </div>

      {/* Project */}
      {task.projectId && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Project</h5>
          <p className="text-gray-600">{task.projectId.title || task.projectId.name || 'Unknown Project'}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {formatDate(task.createdAt)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(task.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;
