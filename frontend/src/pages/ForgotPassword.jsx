import { Link } from "react-router";
import ImageLayout from "../components/ImageLayout";
import InfoCard from "../components/InfoCard";
import "../styles/Login.css";

export default function ForgotPassword() {
  return (
    <ImageLayout bgImageClass="bg-login-success">
      <InfoCard>
        <h3 className="heading-dark">Reset your password</h3>
        <p className="subtitle subtitle-dark">Please contact admin support for assistance.</p>
        <Link to="/login" className="btn-base btn-orange">
          Back to login
        </Link>
      </InfoCard>
    </ImageLayout>
  );
}