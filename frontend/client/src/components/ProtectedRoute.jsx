import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole = null }) {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user/home'} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (token) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/user/home'} replace />;
  }

  return children;
}
