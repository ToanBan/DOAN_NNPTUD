import React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/authContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const isUserUser = user?.role === "user";

  if (isUserUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
  
export default ProtectedRoute;