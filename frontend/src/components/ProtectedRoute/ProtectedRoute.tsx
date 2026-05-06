import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const loggedIn = !!localStorage.getItem("access");
  const offlineMode = !!localStorage.getItem("offlineMode");

  if (!loggedIn && !offlineMode) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
