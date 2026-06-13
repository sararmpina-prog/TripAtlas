import logoImg from '../assets/logo-white.png'; // Importa a imagem como um módulo!
import '../styles/Logo.css';

export default function Logo({ className = "logo-white" }) {
  return (
    <div className={`logo-container ${className}`}>
      {/* Usamos a variável logoImg aqui */}
      <img src={logoImg} alt="TripAtlas Logo" className="logo-img"/>
    </div>
  );
}