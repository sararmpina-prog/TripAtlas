import { clearAuthSession, getStoredUser } from "../utils/authStorage";
import Logo from "./Logo";
import { FaUser } from "react-icons/fa";
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

        <button onClick={logout} className="btn-base btn-user">
          <FaUser size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;