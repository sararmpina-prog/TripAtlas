import WelcomeCard from "../components/WelcomeCard";
import { useNavigate } from "react-router";
import "../styles/Login.css";
import "../styles/LoginForm.css"

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="login-page">

      {/* CARD CENTRAL */}
      <WelcomeCard>
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
      </WelcomeCard>

    </div>
  );
}

export default Welcome;