import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";

interface PublicOnlyRouteProps {
  children: ReactNode;
}

export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
};
