import { Link } from "react-router";
import InfoCard from "../components/InfoCard";
import ImageLayout from "../components/ImageLayout";
import { getStoredToken, getStoredUser } from '../auth/authStorage';

function RegisterSuccess() {

  return (
    <ImageLayout bgImageClass="bg-register-success">
      <InfoCard>
        <h3 className="heading-dark">You're All Set!</h3>

        <p className="heading-dark">Your account has been created successfully.</p>
        <p className="subtitle subtitle-dark">
          Let&apos;s start planning your next unforgettable journey.
        </p>

        <Link to="/dashboard" className="btn-base btn-orange">
          Create your first trip
        </Link>
      </InfoCard>
    </ImageLayout>
  );
}

export default RegisterSuccess;