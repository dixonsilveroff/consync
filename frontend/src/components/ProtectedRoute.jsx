import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Props:
// - children: React node
// - roles: optional array of allowed roles (case-insensitive)
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles && roles.length > 0) {
    const allowed = roles.map(r => r.toLowerCase());
    const userRole = (user.role || "").toLowerCase();
    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
