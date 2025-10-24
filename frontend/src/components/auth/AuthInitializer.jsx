import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from '../../store/api/authApi.js';
import { initializeAuth } from '../../store/slices/authSlice.js';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  // Try to get current user on app initialization
  const { data: userData, error, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (!isLoading) {
      if (userData && userData.user) {
        // User is authenticated
        dispatch(initializeAuth({ user: userData.user }));
      } else {
        // User is not authenticated or error occurred
        dispatch(initializeAuth({ user: null }));
      }
    }
  }, [userData, error, isLoading, dispatch]);

  // This component doesn't render anything
  return null;
};

export default AuthInitializer;
