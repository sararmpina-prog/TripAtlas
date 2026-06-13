import WelcomeCard from "../components/WelcomeCard";
import { useNavigate } from "react-router";
import "../styles/Login.css";

function LoginSuccess() {
  const navigate = useNavigate();

  const user = JSON.parse(
  localStorage.getItem("user") ||
  sessionStorage.getItem("user")
  );

  const firstName = user?.first_name || "Traveler";

  return (
    <div className="login-page">


      <section className="login-register-side">
    
       
      </section>

      {/* CARD CENTRAL */}
      <WelcomeCard>
        <h2>Hi {firstName}!</h2>

        <p>Your travel plans are waiting for you</p>

        <div className="login-form">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            PLAN A NEW TRIP
          </button>

           <button
          className="register-btn"
          onClick={() => navigate("/dashboard")}
        >
          VIEW MY TRIPS
        </button>

        </div>
      </WelcomeCard>

    </div>
  );
}

export default LoginSuccess;