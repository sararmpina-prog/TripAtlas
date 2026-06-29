import { Link } from "react-router";
import ImageLayout from "../components/ImageLayout";
import InfoCard from "../components/InfoCard";
import { preloadBackgroundImage } from '../utils/preload';
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {

  // Configuração do email temporário
  const adminEmail = "support@tripatlas.com"; // email fictício para demonstração apenas
  const emailSubject = encodeURIComponent("Password Reset Request");
  const emailBody = encodeURIComponent("Hi Support Team,\n\nI need assistance resetting my password.\n\nMy registered email/username is: ");

  return (
    <ImageLayout bgImageClass="bg-forgot-password" hasOverlay={true}>
      <InfoCard>
        <h3 className="heading-dark">Reset your password</h3>
        <p className="subtitle subtitle-dark">
          Automatic password reset is currently unavailable. <br />
          Please contact our support team directly to regain access.
        </p>

        {/* Botão de Contacto por Email */}
         <a 
          href={`mailto:${adminEmail}?subject=${emailSubject}&body=${emailBody}`} 
          className="btn-base btn-orange">
          Contact Support via Email
        </a>

        {/* Escape Link */}
        <div>
          <Link 
            to="/login" 
            className="back-login-link"
            onMouseEnter={() => preloadBackgroundImage('login-img-mountains')}
            onTouchStart={() => preloadBackgroundImage('login-img-mountains')}
          >
            Cancel and return to login
          </Link>
        </div>
      </InfoCard>
    </ImageLayout>
  );
}
