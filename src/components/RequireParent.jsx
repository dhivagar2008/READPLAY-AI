import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isGoogleConfigured } from "../lib/auth.js";

export function RequireParent({ children }) {
  const location = useLocation();
  if (isGoogleConfigured() && !getCurrentUser()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
