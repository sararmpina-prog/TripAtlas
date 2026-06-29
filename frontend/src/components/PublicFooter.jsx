// src/components/PublicFooter.jsx
import { FaEnvelope } from 'react-icons/fa';
import '../styles/Footer.css';

export default function PublicFooter() {
  const adminEmail = "support@tripatlas.com"; // email fictício para demonstração apenas
  const emailSubject = encodeURIComponent("TripAtlas - General Inquiry");
  const emailBody = encodeURIComponent("Hi TripAtlas Team,\n\nI would like to get more information about the platform.\n\nMy contact details: ");

  return (
    <footer className="public-footer">
      <div className="public-footer-content">
        <div className="public-footer-info">
          <h4>TripAtlas</h4>
          <p>Your AI-powered travel companion for unforgettable journeys. Plan less, experience more.</p>
        </div>
        
        <div className="public-footer-elements">
          <a 
            href={`mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`} 
            className="btn-base btn-light footer-contact-btn"
          >
            <FaEnvelope size={14} /> Contact Support
          </a>
              <div className="public-footer-copyright">
                <p>&copy; {new Date().getFullYear()} TripAtlas &bull; All rights reserved</p>
              </div>
        </div>
      </div>
    </footer>
  );
}
