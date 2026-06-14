import { Link } from 'react-router';
import ImageLayout from '../components/ImageLayout';
import '../styles/LandingPage.css';

export default function LandingPage() {
  return (
    <ImageLayout bgImageClass="bg-landing" hasOverlay={false}>
      <div className="landing-center">

        {/* Bloco de Texto (Top/Centro) */}
        <div className="landing-top-content">
          <h1 className="heading-light text-center">
            Plan Less.<br />
            Experience More.
          </h1>
          <p className="subtitle subtitle-light text-center">
            Your AI-powered travel companion for unforgettable journeys
          </p>
        </div>
        {/* Bloco de Ações (Fundo) */}
        <div className="landing-bottom-container">
          <div className="btn-container">
            <Link to="/login" className="btn-base btn-orange">
              Login
            </Link>
          </div>
          <p className="p-white text-center account-prompt">
            Don’t have an account? <Link to="/register" className="link-highlight">Sign up here</Link>
          </p>
        </div>
      </div>
    </ImageLayout>
  );
}
