import { Link } from "react-router";
import InfoCard from "../components/InfoCard";
import ImageLayout from "../components/ImageLayout";
import { getStoredUser } from "../auth/authStorage";
import "../styles/LoginSuccess.css";

function LoginSuccess() {

  const user = getStoredUser();

  const firstName = user?.first_name || "Traveler";

  return (
    <ImageLayout bgImageClass="bg-login-success">
      <InfoCard>
        <h3 className="heading-dark">Hi {firstName}!</h3>
        <p className="subtitle subtitle-dark">What would you like to do today?</p>

        <div className="success-actions">
          <Link to="/dashboard" className="btn-base btn-orange">
            Plan a new trip
          </Link>

        {/* ------- AINDA FALTA LINK PARA VER TRIPS BY USER ID -------- */}

          <Link to="/dashboard" className="btn-base btn-orange">
            View my trips
          </Link>
        </div>
      </InfoCard>
    </ImageLayout>
  );
}

export default LoginSuccess;