import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export function AdminRoute() {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) return <LoadingSpinner fullscreen label="Checking session..." />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
