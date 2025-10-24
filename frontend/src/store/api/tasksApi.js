import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/task`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    // Get all tasks
    getTasks: builder.query({
      query: () => '/gettasks',
      providesTags: ['Task'],
    }),

    // Get tasks by project
    getTasksByProject: builder.query({
      query: (projectId) => `/gettasks/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Task', id: `project-${projectId}` },
        'Task',
      ],
    }),

    // Get single task
    getTask: builder.query({
      query: (taskId) => `/gettaskbyid/${taskId}`,
      providesTags: (result, error, taskId) => [
        { type: 'Task', id: taskId },
      ],
    }),

    // Create task
    createTask: builder.mutation({
      query: ({ projectId, ...taskData }) => ({
        url: `/createtask/${projectId}`,
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Task', id: `project-${projectId}` },
        'Task',
      ],
    }),

    // Update task
    updateTask: builder.mutation({
      query: ({ taskId, ...taskData }) => ({
        url: `/updatetask/${taskId}`,
        method: 'PATCH',
        body: taskData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Task',
      ],
    }),

    // Delete task
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/deleteTask/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    // Quick status update (with immediate cache invalidation)
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/updatetask/${taskId}`,
        method: 'PATCH',
        body: { status },
      }),
      // Invalidate all task caches immediately to trigger refetch
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTasksByProjectQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
} = tasksApi;
