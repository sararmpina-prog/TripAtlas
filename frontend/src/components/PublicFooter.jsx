import { FaEnvelope } from 'react-icons/fa';
import logoFooter from '../assets/logo-azure-footer.png';
import '../styles/Footer.css';

export default function PublicFooter() {
  const adminEmail = "support@tripatlas.com"; 
  const emailSubject = encodeURIComponent("TripAtlas - General Inquiry");
  const emailBody = encodeURIComponent("Hi TripAtlas Team,\n\nI would like to get more information about the platform.\n\nMy contact details: ");

  return (
    <footer className="public-footer">
      
      {/* SECÇÃO DE CIMA */}
      <div className="public-footer-top">
        <div className="footer-top-container">
          
          {/* Área 1: Logo */}
          <div>
            <img src={logoFooter} alt="TripAtlas Logo" className="footer-logo-img" />
          </div>
          
          {/* Área 2: Descrição rica */}
          <div className="footer-area-description">
            <p>
              TripAtlas is an intelligent travel platform designed to simplify your adventures. 
              Organize flights, manage accommodation reserves, and discover personalized local suggestions 
              integrated directly into your automated AI Travel Journal.
            </p>
          </div>
          
          {/* Área 3: Botão de Contacto Dinâmico */}
          <div className="footer-area-contact">
            <span>For more information:</span>
            <a 
              href={`mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`} 
              className="btn-base btn-light footer-contact-btn"
            >
              <FaEnvelope size={13} />
              <div className="contact-btn-text">
                <strong>Contact Us</strong>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* SECÇÃO DE BAIXO */}
      <div className="public-footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} TripAtlas &bull; All rights reserved</p>
        </div>
      </div>

    </footer>
  );
}
