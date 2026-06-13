import { Navigate } from "react-router";
import { getStoredToken } from "../authStorage";

function ProtectedRoute({ children }) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;