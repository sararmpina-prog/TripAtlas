import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import ImageLayout from "../components/ImageLayout";
import "../styles/Login.css";

function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <ImageLayout bgImageClass="bg-register-success">
      <InfoCard>
        <h3 className="heading-dark">You're All Set!</h3>
        <p className="subtitle-dark">Your account has been created successfully.</p>

        <p className="subtitle subtitle-dark">
          Let&apos;s start planning your next unforgettable journey.
        </p>

        <button
          type="button"
          className="btn-base btn-orange"
          onClick={() => navigate("/dashboard")}
        >
          Create your first trip
        </button>
      </InfoCard>
    </ImageLayout>
  );
}

export default RegisterSuccess;