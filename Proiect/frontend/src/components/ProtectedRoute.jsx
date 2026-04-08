import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthLoading, isAuthenticated } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-slate-300">
        Se încarcă...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}