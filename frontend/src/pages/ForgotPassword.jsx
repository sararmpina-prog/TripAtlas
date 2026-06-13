import { Link } from "react-router";
import InfoCard from "../components/InfoCard";
import "../styles/Login.css";

export default function ForgotPassword() {
  return (
    <div className="login-page">
      <InfoCard>
        <h2>Reset your password</h2>
        <p>Recovery flow not implemented yet. Use this page as the route target until the backend flow is connected.</p>
        <Link to="/login" className="register-btn">
          Back to login
        </Link>
      </InfoCard>
    </div>
  );
}