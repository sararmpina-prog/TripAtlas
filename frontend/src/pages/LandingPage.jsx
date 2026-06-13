import { Link } from 'react-router';
import ImageLayout from '../components/ImageLayout';
import '../styles/global.css';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <ImageLayout bgImageClass="bg-landing" hasOverlay={false}>
      <div className="landing-center">
        <h1 className="heading-light text-center main-title">
          Plan Less.<br />Experience More.
        </h1>
        <p className="p-white text-center subtitle">
          Your AI-powered travel companion for unforgettable journeys
        </p>
        
        {/* Altere o link/tag conforme use react-router-dom */}
        <Link to="/login" className="btn-base btn-orange">
          Login
        </Link>
        
        <p className="p-white text-center account-prompt">
          Don’t have an account? <Link to="/register" className="link-highlight">Sign up here</Link>
        </p>
      </div>
    </ImageLayout>
  );
}
