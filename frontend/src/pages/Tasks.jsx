import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetTasksQuery, useUpdateTaskMutation, useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../store/api/tasksApi';
import { useGetProjectsQuery } from '../store/api/projectsApi';
import { setSearchTerm } from '../store/slices/uiSlice';
// Removed drag and drop imports for simpler implementation
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import Layout from '../components/layout/Layout.jsx';

const Tasks = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // API queries
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
    error: tasksErrorDetails
  } = useGetTasksQuery();

  const {
    data: projectsData,
    isLoading: projectsLoading
  } = useGetProjectsQuery();

  const [updateTask] = useUpdateTaskMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Ensure we have arrays
  const tasks = Array.isArray(tasksData)
    ? tasksData
    : Array.isArray(tasksData?.tasks)
      ? tasksData.tasks
      : [];



  const projects = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.projects)
      ? projectsData.projects
      : [];

  // Filter tasks - Only show personal tasks (assigned to user OR created by user)
  const filteredTasks = tasks.filter(task => {
    if (!task || typeof task !== 'object') return false;

    // Personal filter - only show tasks relevant to current user
    const isAssignedToMe = task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
    const isCreatedByMe = task.createdBy?._id === user?._id || task.createdBy === user?._id;
    const isPersonalTask = isAssignedToMe || isCreatedByMe;

    if (!isPersonalTask) return false;

    // Search filter
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Project filter - check both task.project and task.projectId
    const taskProjectId = task.project?._id || task.projectId?._id || task.projectId;
    const matchesProject = selectedProject === 'all' || taskProjectId === selectedProject;

    // Priority filter
    const matchesPriority = selectedPriority === 'all' ||
                           (task.priority === selectedPriority);

    return matchesSearch && matchesProject && matchesPriority;
  });

  // Group tasks by status
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };



  // Get task statistics
  const getTaskStats = () => {
    return {
      total: filteredTasks.length,
      todo: tasksByStatus.todo.length,
      inProgress: tasksByStatus['in-progress'].length,
      completed: tasksByStatus.completed.length
    };
  };

  const stats = getTaskStats();

  // Handle search
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

    // Handle status change
  const handleStatusChange = async (taskId, newStatus, task) => {
    // Check if current user is the one who created/assigned the task
    const isTaskCreator = task?.createdBy?._id === user?._id || task?.createdBy === user?._id;

    if (!isTaskCreator) {
      alert('Only the person who assigned this task can change its status.');
      return;
    }

    try {
      await updateTask({ taskId, status: newStatus }).unwrap();
    } catch (error) {
      alert('Failed to update task status. Please try again.');
    }
  };

  // Handle task edit
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // Handle task click/view
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  // Handle task delete
  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await deleteTask(task._id).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };







  if (tasksError) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <p className="mt-1 text-sm text-red-700">{tasksErrorDetails?.data?.message || 'Something went wrong'}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-2">Tasks assigned to you or created by you</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
            <div className="text-sm text-gray-600">To Do</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              {/* Project Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Project:</span>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title || project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board with Drag & Drop */}
      {tasksLoading ? (
        <div className="flex space-x-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex-1 min-w-80">
              <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {/* To Do Column */}
          <div className="flex-1 min-w-80">
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-full min-h-96">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">To Do</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                      {tasksByStatus.todo.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Add task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {tasksByStatus.todo.length > 0 ? (
                  tasksByStatus.todo.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onClick={handleTaskClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm text-gray-500">No to do tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div className="flex-1 min-w-80">
            <div className="rounded-lg border-2 border-dashed border-blue-300 bg-gray-50 h-full min-h-96">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">In Progress</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                      {tasksByStatus['in-progress'].length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Add task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {tasksByStatus['in-progress'].length > 0 ? (
                  tasksByStatus['in-progress'].map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onClick={handleTaskClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm text-gray-500">No in progress tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completed Column */}
          <div className="flex-1 min-w-80">
            <div className="rounded-lg border-2 border-dashed border-green-300 bg-gray-50 h-full min-h-96">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">Completed</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                      {tasksByStatus.completed.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Add task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {tasksByStatus.completed.length > 0 ? (
                  tasksByStatus.completed.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onClick={handleTaskClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm text-gray-500">No completed tasks</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedProjectId={selectedProject !== 'all' ? selectedProject : null}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showDetailModal}
        task={selectedTask}
        projectId={selectedTask?.projectId?._id || selectedTask?.projectId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </Layout>
  );
};

export default Tasks;
