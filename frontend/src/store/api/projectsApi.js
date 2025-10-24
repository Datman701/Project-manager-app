import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const projectsApi = createApi({
  reducerPath: 'projectsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/project`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Project', 'Member'],
  endpoints: (builder) => ({
    // Get all projects
    getProjects: builder.query({
      query: () => '/getprojects',
      providesTags: ['Project'],
    }),

    // Get single project
    getProjectById: builder.query({
      query: (projectId) => `/getproject/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Project', id: projectId },
      ],
    }),

    // Create project
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/createproject',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),

    // Update project
    updateProject: builder.mutation({
      query: ({ id, ...projectData }) => ({
        url: `/updateproject/${id}`,
        method: 'PATCH',
        body: projectData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        'Project',
      ],
    }),

    // Delete project
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/deleteproject/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Get project members
    getMembers: builder.query({
      query: (projectId) => `/getmembers/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: 'Member', id: projectId },
      ],
    }),

    // Add member to project
    addMember: builder.mutation({
      query: ({ projectId, userData }) => ({
        url: `/addmember/${projectId}`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Member', id: projectId },
        { type: 'Project', id: projectId },
      ],
    }),

    // Remove member from project
    removeMember: builder.mutation({
      query: ({ projectId, userData }) => ({
        url: `/deletemember/${projectId}`,
        method: 'DELETE',
        body: userData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Member', id: projectId },
        { type: 'Project', id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = projectsApi;
