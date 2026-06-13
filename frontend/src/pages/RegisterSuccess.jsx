import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import "../styles/Global.css";
import "../styles/ImageLayout.css";
import "../styles/Login.css";
import "../styles/LoginForm.css"

function RegisterSuccess() {
  const navigate = useNavigate();

  return (
    <div className="login-page">

      {/* CARD CENTRAL */}
      <InfoCard>
        <h2>You're All Set!</h2>

        <p>Your account has been created successfully.</p>

        <strong>
          Let's start planning your next unforgettable journey.
        </strong>

        <button
          className="btn-orange"
          onClick={() => navigate("/dashboard")}
        >
          CREATE YOUR FIRST TRIP
        </button>
      </InfoCard>

    </div>
  );
}

export default RegisterSuccess;