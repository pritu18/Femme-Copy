
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log for debugging
    console.log("Protected route check:", { user, loading, path: location.pathname });
  }, [user, loading, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-femme-beige to-femme-pink-light">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-femme-burgundy mx-auto mb-4" />
          <p className="text-femme-burgundy">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with a return path
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
