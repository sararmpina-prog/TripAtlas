import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import ImageLayout from "../components/ImageLayout";
import { getStoredUser } from "../auth/authStorage";
import "../styles/Login.css";

function LoginSuccess() {
  const navigate = useNavigate();

  const user = getStoredUser();

  const firstName = user?.first_name || "Traveler";

  return (
    <ImageLayout bgImageClass="bg-login-success">
      <InfoCard>
        <h3>Hi {firstName}!</h3>
        <p className="success-lead">What would you like to do today?</p>

        <div className="success-actions">
          <button
            type="button"
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard")}
          >
            Plan a new trip
          </button>

          <button
            type="button"
            className="btn-base btn-orange"
            onClick={() => navigate("/dashboard")}
          >
            View my trips
          </button>
        </div>
      </InfoCard>
    </ImageLayout>
  );
}

export default LoginSuccess;