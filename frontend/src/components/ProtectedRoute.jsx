import { Navigate } from "react-router";
<<<<<<< HEAD
import { getStoredToken } from "../auth/authStorage";
=======
import { getStoredToken } from "../utils/authStorage";
>>>>>>> frontend-limpo

function ProtectedRoute({ children }) {
  const token = getStoredToken();

  const isValid = token && token !== "null" && token !== "undefined";

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;