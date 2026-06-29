import { getStoredToken } from "../utils/authStorage";
import ErrorPage from "../pages/ErrorPage";

function ProtectedRoute({ children }) {
  const token = getStoredToken();

  const isValid = token && token !== "null" && token !== "undefined";

  // Se tentar entrar sem sessão válida, em vez de saltar, mostra o ecrã 403
  if (!isValid) {
    return <ErrorPage code="403" message="Access Denied" />;
  }

  return children;
}

export default ProtectedRoute;
