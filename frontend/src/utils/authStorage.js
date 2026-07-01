export function saveAuthSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getStoredToken() {
  return localStorage.getItem("token");
}

export function getStoredUser() {
  const serializedUser = localStorage.getItem("user");
  return serializedUser ? JSON.parse(serializedUser) : null;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}