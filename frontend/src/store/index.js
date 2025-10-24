import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import slices
import authSlice from './slices/authSlice.js';
import projectsSlice from './slices/projectsSlice.js';
import tasksSlice from './slices/tasksSlice.js';
import uiSlice from './slices/uiSlice.js';

// Import RTK Query APIs
import { authApi } from './api/authApi.js';
import { projectsApi } from './api/projectsApi.js';
import { tasksApi } from './api/tasksApi.js';

export const store = configureStore({
  reducer: {
    // Slices
    auth: authSlice,
    projects: projectsSlice,
    tasks: tasksSlice,
    ui: uiSlice,

    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(authApi.middleware)
      .concat(projectsApi.middleware)
      .concat(tasksApi.middleware),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
