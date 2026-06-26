import { Navigate } from "react-router";
import { getStoredToken } from "../utils/authStorage";

function ProtectedRoute({ children }) {
  const token = getStoredToken();

  const isValid = token && token !== "null" && token !== "undefined";

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;