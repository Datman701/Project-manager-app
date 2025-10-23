import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProjectByIdQuery, useDeleteProjectMutation } from '../store/api/projectsApi';
import { useGetTasksByProjectQuery, useDeleteTaskMutation } from '../store/api/tasksApi';
import EditProjectModal from '../components/projects/EditProjectModal';
import MemberManagementModal from '../components/projects/MemberManagementModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import Layout from '../components/layout/Layout';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDeleteModal, setShowTaskDeleteModal] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErrorDetails
  } = useGetProjectByIdQuery(projectId);

  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks
  } = useGetTasksByProjectQuery(projectId, {
    skip: !projectId // Skip the query if projectId is undefined
  });

  // Ensure tasks is always an array
  const allTasks = Array.isArray(tasksData)
    ? tasksData
    : Array.isArray(tasksData?.tasks)
      ? tasksData.tasks
      : [];

  // Filter tasks by status
  const tasks = taskStatusFilter === 'all'
    ? allTasks
    : allTasks.filter(task => task.status === taskStatusFilter);

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-yellow-500';
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
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateProgress = () => {
    if (!Array.isArray(allTasks) || allTasks.length === 0) return 0;
    const completedTasks = allTasks.filter(task => task && task.status === 'completed').length;
    return Math.round((completedTasks / allTasks.length) * 100);
  };

  const getTaskStats = () => {
    if (!Array.isArray(tasks)) {
      return { total: 0, completed: 0, inProgress: 0, todo: 0 };
    }

    return {
      total: tasks.length,
      completed: tasks.filter(t => t && t.status === 'completed').length,
      inProgress: tasks.filter(t => t && t.status === 'in-progress').length,
      todo: tasks.filter(t => t && t.status === 'todo').length
    };
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId).unwrap();
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  const handleDeleteTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDeleteModal(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await deleteTask(selectedTask._id).unwrap();
      setShowTaskDeleteModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (projectLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-8 w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (projectError) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Project not found</h3>
          <p className="text-red-700 mb-4">
            {projectErrorDetails?.data?.message || 'The project you\'re looking for doesn\'t exist or you don\'t have access to it.'}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress();
  const taskStats = getTaskStats();

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">

        {/* Project Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            {(() => {
              const actualProject = project?.project || project;
              return (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {actualProject?.title || actualProject?.name || 'Unknown Project'}
                    </h1>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(actualProject?.status)} text-white`}>
                      {getStatusText(actualProject?.status)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(actualProject?.priority || 'medium')}`}>
                      {actualProject?.priority ? actualProject.priority.charAt(0).toUpperCase() + actualProject.priority.slice(1) : 'Medium'} Priority
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg mb-4">{actualProject?.description || 'No description available'}</p>

                  {/* Project Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {actualProject?.createdAt ?
                        new Date(actualProject.createdAt).toLocaleDateString() :
                        actualProject?._id ?
                          new Date(parseInt(actualProject._id.substring(0, 8), 16) * 1000).toLocaleDateString() :
                          'Unknown'
                      }
                    </div>
                    {(actualProject?.dueDate || actualProject?.deadline) && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Due {new Date(actualProject.dueDate || actualProject.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {(() => {
                        // Count unique members: owner + non-duplicate members
                        const uniqueMembers = actualProject?.members?.filter(member =>
                          member._id !== actualProject?.createdBy?._id &&
                          member.email !== actualProject?.createdBy?.email
                        ) || [];
                        return (uniqueMembers.length + (actualProject?.createdBy ? 1 : 0));
                      })()} members
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMembersModal(true)}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Members
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Project
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-400 text-red-800 rounded-lg hover:bg-red-50 hover:border-red-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
              <div className="text-sm text-gray-600">To Do</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex justify-between">
            {[
              { key: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { key: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
              { key: 'members', label: 'Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
              { key: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Tasks */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
                {tasksLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500">{task.status.replace('-', ' ')}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 5 && (
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all {tasks.length} tasks
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a task for this project.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {taskStatusFilter === 'all' ? 'All Tasks' :
                   taskStatusFilter === 'in-progress' ? 'In Progress Tasks' :
                   taskStatusFilter.charAt(0).toUpperCase() + taskStatusFilter.slice(1) + ' Tasks'}
                  <span className="ml-2 text-sm text-gray-500">({tasks.length})</span>
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Task
                  </button>
                </div>
              </div>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status === 'in-progress' ? 'In Progress' :
                               task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            {task.dueDate && (
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                            {task.assignedTo && (
                              <span>Assigned to: {task.assignedTo.name || task.assignedTo.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTaskClick(task)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
                  <button
                    onClick={() => setShowCreateTaskModal(true)}
                    className="mt-3 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (() => {
            // Extract the actual project data
            const actualProject = project?.project || project;

            // Filter out the owner from members list to avoid duplication
            const filteredMembers = actualProject?.members?.filter(member =>
              member._id !== actualProject?.createdBy?._id &&
              member.email !== actualProject?.createdBy?.email
            ) || [];

            return (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
                  <button
                    onClick={() => setShowMembersModal(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Member
                  </button>
                </div>

                {/* Display current members */}
                <div className="space-y-3">
                  {/* Project Creator */}
                  {actualProject?.createdBy && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white mr-3">
                          {(actualProject.createdBy.name || actualProject.createdBy.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{actualProject.createdBy.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{actualProject.createdBy.email}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Owner
                      </span>
                    </div>
                  )}

                  {/* Project Members (excluding owner) */}
                  {filteredMembers.length > 0 && filteredMembers.map((member, index) => (
                    <div key={member._id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-sm font-medium text-white mr-3">
                          {(member.name || member.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          Member
                        </span>
                        {/* Show delete button only for project owners */}
                        {user && actualProject?.createdBy && user._id === actualProject.createdBy._id && (
                          <button
                            onClick={() => {
                              // We can reuse the same modal functionality
                              setShowMembersModal(true);
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors"
                            title="Remove member (opens member management)"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* No additional members message */}
                  {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No additional members yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Add members using the button above.</p>
                  </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
              <div className="text-center py-8 text-gray-500">
                Project settings will be implemented in the edit functionality
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
            {(() => {
              // Extract the actual project data
              const actualProject = project?.project || project;

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project Name</label>
                    <div className="mt-1 text-sm text-gray-900 font-medium">
                      {actualProject?.title || actualProject?.name || 'Unknown Project'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(actualProject?.status || 'active')} text-white`}>
                        {getStatusText(actualProject?.status || 'active')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(actualProject?.priority || 'medium')}`}>
                        {actualProject?.priority ? actualProject.priority.charAt(0).toUpperCase() + actualProject.priority.slice(1) : 'Medium'} Priority
                      </span>
                    </div>
                  </div>
                  {(actualProject?.dueDate || actualProject?.deadline) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deadline</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {new Date(actualProject.dueDate || actualProject.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {actualProject?.createdAt ?
                        new Date(actualProject.createdAt).toLocaleDateString() :
                        actualProject?._id ?
                          new Date(parseInt(actualProject._id.substring(0, 8), 16) * 1000).toLocaleDateString() :
                          'Unknown'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {actualProject?.updatedAt ?
                        new Date(actualProject.updatedAt).toLocaleDateString() :
                        actualProject?.createdAt ?
                          new Date(actualProject.createdAt).toLocaleDateString() :
                          actualProject?._id ?
                            new Date(parseInt(actualProject._id.substring(0, 8), 16) * 1000).toLocaleDateString() :
                            'Unknown'
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            {(() => {
              // Extract the actual project data
              const actualProject = project?.project || project;

              // Filter out the owner from members list to avoid duplication
              const filteredMembers = actualProject?.members?.filter(member =>
                member._id !== actualProject?.createdBy?._id &&
                member.email !== actualProject?.createdBy?.email
              ) || [];

              return (
                <div className="space-y-3">
                  {/* Project Creator */}
                  {actualProject?.createdBy && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white mr-3">
                          {(actualProject.createdBy.name || actualProject.createdBy.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{actualProject.createdBy.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{actualProject.createdBy.email}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Owner
                      </span>
                    </div>
                  )}

                  {/* Project Members (excluding owner) */}
                  {filteredMembers.length > 0 && filteredMembers.map((member, index) => (
                <div key={member._id || index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-sm font-medium text-white mr-3">
                      {(member.name || member.email)?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    Member
                  </span>
                </div>
              ))}

                  {/* No members message */}
                  {filteredMembers.length === 0 && !actualProject?.createdBy && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No members assigned</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Project</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to delete "{(() => {
                      const actualProject = project?.project || project;
                      return actualProject?.title || actualProject?.name || 'this project';
                    })()}"? This action cannot be undone and will delete all associated tasks.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isDeleting && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Management Modal */}
      <MemberManagementModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        project={project}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        selectedProjectId={projectId}
      />

      {/* Task Detail/Edit Modal */}
      <TaskDetailModal
        isOpen={showTaskDetailModal}
        onClose={() => {
          setShowTaskDetailModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        projectId={projectId}
      />

      {/* Task Delete Confirmation Modal */}
      {showTaskDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Task</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to delete "{selectedTask?.title || 'this task'}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowTaskDeleteModal(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={isDeletingTask}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isDeletingTask && (
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {isDeletingTask ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;
