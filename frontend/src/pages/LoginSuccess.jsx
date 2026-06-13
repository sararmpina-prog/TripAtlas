import InfoCard from "../components/InfoCard";
import { useNavigate } from "react-router";
import "../styles/Login.css";

function LoginSuccess() {
  const navigate = useNavigate();

  const firstName = "John"; // depois vens de API / auth

  return (
    <div className="login-page">


      <section className="login-register-side">
    
       
      </section>

      {/* CARD CENTRAL */}
      <InfoCard>
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
      </InfoCard>

    </div>
  );
}

export default LoginSuccess;