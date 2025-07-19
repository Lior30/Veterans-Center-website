// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  if (user === undefined) {
    // Still loading – optionally show a loader here
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const email = user.email || '';
  const isAdmin = !email.endsWith('@veterans.com');

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
