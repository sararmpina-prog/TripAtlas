import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import ImageLayout from "../components/ImageLayout";
import { getStoredUser } from "../authStorage";
import "../styles/Login.css";

function LoginSuccess() {
  const navigate = useNavigate();

  const user = getStoredUser();

  const firstName = user?.first_name || "Traveler";

  return (
    <ImageLayout bgImageClass="bg-login">
      <InfoCard className="auth-card success-card">
        <h2>Hi {firstName}!</h2>
        <p className="success-lead">What would you like to do today?</p>

        <div className="success-actions">
          <button
            type="button"
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard")}
          >
            PLAN A NEW TRIP
          </button>

          <button
            type="button"
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard")}
          >
            VIEW MY TRIPS
          </button>
        </div>
      </InfoCard>
    </ImageLayout>
  );
}

export default LoginSuccess;