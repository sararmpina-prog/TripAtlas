import { Link, useNavigate } from "react-router";
import InfoCard from "../components/InfoCard";
import ImageLayout from "../components/ImageLayout";
import { getStoredUser, getStoredToken } from "../auth/authStorage";
import "../styles/LoginSuccess.css";

function LoginSuccess() {

  const navigate = useNavigate(); 
  const user = getStoredUser();

  const firstName = user?.first_name || "Traveler"; // Traveler é um fallback caso o nome do usuário não esteja disponível / haja uma falha

  return (
    <ImageLayout bgImageClass="bg-login-success">
      <InfoCard>
        <h3 className="heading-dark">Hi {firstName}!</h3>
        <p className="subtitle subtitle-dark">What would you like to do today?</p>

        <div className="success-actions">
          <button 
            type="button" 
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard", { state: { forcePlaceholder: true } })} // Força a exibição do placeholder para criar uma nova viagem
          >
            Plan a new trip
          </button>

          <button 
            type="button" 
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard", { state: { forcePlaceholder: false } })} // 💡 Carrega normalmente
          >
            View my trips
          </button>
        </div>
      </InfoCard>
    </ImageLayout>
  );
}

export default LoginSuccess;