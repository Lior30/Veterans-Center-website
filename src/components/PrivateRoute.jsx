// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Admin check: match email
  const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default PrivateRoute;
