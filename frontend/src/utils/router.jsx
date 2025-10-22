import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Projects from '../pages/Projects.jsx';
import ProjectDetail from '../pages/ProjectDetail.jsx';
import Tasks from '../pages/Tasks.jsx';
import Profile from '../pages/Profile.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },

      // Protected routes
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/projects',
        element: (
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        )
      },
      {
        path: '/projects/:projectId',
        element: (
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        )
      },
      {
        path: '/tasks',
        element: (
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },

      // Catch all route
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);
