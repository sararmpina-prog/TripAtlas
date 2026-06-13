import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import ImageLayout from "../components/ImageLayout";
import "../styles/Login.css";

function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <ImageLayout bgImageClass="bg-register">
      <InfoCard className="auth-card success-card">
        <h2>You're All Set!</h2>
        <p>Your account has been created successfully.</p>

        <p className="success-highlight">
          Let&apos;s start planning your next unforgettable journey.
        </p>

        <button
          type="button"
          className="btn-base btn-orange"
          onClick={() => navigate("/dashboard")}
        >
          CREATE YOUR FIRST TRIP
        </button>
      </InfoCard>
    </ImageLayout>
  );
}

export default RegisterSuccess;