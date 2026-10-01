import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Skeleton';
import StatePanel from './StatePanel';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && !isAdmin) {
    return <StatePanel tone="error" title="Admin access only" message="Your account doesn't have permission to view this page." actionLabel="Back to home" actionTo="/" />;
  }
  return children;
}
