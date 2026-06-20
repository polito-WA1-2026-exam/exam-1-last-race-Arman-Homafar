import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status-message">Checking session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
