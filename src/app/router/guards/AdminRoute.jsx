import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";

export default function AdminRoute({ children }) {
  const { user, isAdmin, hasPermission, loading } = useAuth();
  const canAccessAdmin = isAdmin || hasPermission("accessAdminConsole");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-200">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
