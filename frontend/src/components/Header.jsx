// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { clearAuthSession, getStoredUser } from "../utils/authStorage";
import Logo from "./Logo";
import { FaUser, FaSignOutAlt, FaUserEdit } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import "../styles/Header.css";

function Header() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation(); // Deteta a rota atual
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    clearAuthSession();
    navigate("/login");
  }

  // Verifica se o utilizador já está na página de editar perfil
  const isAtProfile = location.pathname === "/profile/edit";

  return (
    <header className="app-header">
      <Logo /> 

      <div className="user-container" ref={menuRef}>
        <div className="user-info">
          <span>Hello, {user?.first_name}</span>
          
          <button 
            onClick={() => setIsMenuOpen((prev) => !prev)} 
            className={`btn-base btn-user ${isMenuOpen ? "active" : ""}`}
            title="User Options"
          >
            <FaUser size={20} />
          </button>
        </div>

        <div className={`user-dropdown-menu ${isMenuOpen ? "is-open" : ""}`}>
          {isAtProfile ? (
            /* Se estiver no perfil, mostra a opção de voltar ao Dashboard */
            <Link 
              to="/dashboard" 
              className="dropdown-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <LuLayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
          ) : (
            /* Se estiver no Dashboard, mostra a opção de ir para o Perfil */
            <Link 
              to="/profile/edit" 
              className="dropdown-item"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUserEdit size={16} />
              <span>Edit Profile</span>
            </Link>
          )}
          
          <button onClick={logout} className="dropdown-item btn-logout">
            <FaSignOutAlt size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
