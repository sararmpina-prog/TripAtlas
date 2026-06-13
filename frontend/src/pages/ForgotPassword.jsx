import { Link } from "react-router";
import ImageLayout from "../components/ImageLayout";
import InfoCard from "../components/InfoCard";
import "../styles/Login.css";

export default function ForgotPassword() {
  return (
    <ImageLayout bgImageClass="bg-login">
      <InfoCard className="auth-card success-card forgot-card">
        <h2>Reset your password</h2>
        <p>Recovery flow not implemented yet. For this delivery, this page acts as the route target for the auth journey.</p>
        <Link to="/login" className="register-btn">
          Back to login
        </Link>
      </InfoCard>
    </ImageLayout>
  );
}