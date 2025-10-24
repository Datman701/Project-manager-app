import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProjectCard = ({ project }) => {
  const { user } = useSelector((state) => state.auth);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'on-hold': return 'On Hold';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              to={`/projects/${project._id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {project.title || project.name}
            </Link>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </div>          {/* Status Badge */}
          <div className="flex items-center ml-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} text-white`}>
              {getStatusText(project.status)}
            </span>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(project.priority || 'medium')}`}>
            {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'} Priority
          </span>

          <div className="text-sm text-gray-500">
            Due: {formatDate(project.dueDate || project.deadline)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {project.tasks && (
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{project.tasks.filter(t => t.status === 'completed').length} completed</span>
              <span>{project.tasks.length} total tasks</span>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Team:</span>
            <div className="flex -space-x-1">
              {project.members && project.members.slice(0, 4).map((member, index) => (
                <div
                  key={member._id || index}
                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                  title={member.name || member.email}
                >
                  {(member.name || member.email)?.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.members && project.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-medium text-white">
                  +{project.members.length - 4}
                </div>
              )}
              {(!project.members || project.members.length === 0) && (
                <span className="text-xs text-gray-500">No members</span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="flex items-center space-x-2">
            <Link
              to={`/projects/${project._id}`}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
