export function saveAuthSession({ token, user, rememberMe = false }) {
  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const fallbackStorage = rememberMe ? sessionStorage : localStorage;

  fallbackStorage.removeItem("token");
  fallbackStorage.removeItem("user");

  targetStorage.setItem("token", token);
  targetStorage.setItem("user", JSON.stringify(user));
}

export function getStoredToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export function getStoredUser() {
  const serializedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  return serializedUser ? JSON.parse(serializedUser) : null;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}