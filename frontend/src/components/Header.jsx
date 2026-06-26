import { clearAuthSession, getStoredUser } from "../auth/authStorage";
import Logo from "./Logo";
import "../styles/Header.css";

function Header() {
  const user = getStoredUser();

  function logout() {
    clearAuthSession();

    window.location.href = "/login";
  }

  return (
    <header className="app-header">
      <Logo /> 

      <div className="user-info">
        <span>
          Hello {user?.first_name}
        </span>

        <button onClick={logout} className="btn-base btn-white">
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;