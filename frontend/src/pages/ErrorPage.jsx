import { Link } from 'react-router';
import ImageLayout from '../components/ImageLayout';
import InfoCard from '../components/InfoCard';
import '../styles/ErrorPage.css';
import { preloadBackgroundImage } from '../utils/preload';

export default function ErrorPage({ code = "404", message = "Page Not Found" }) {
  return (
    <ImageLayout bgImageClass="bg-landing" hasOverlay={false}>
      <div className="error-page-center">
        <InfoCard>
          <div className="error-content">
            <h1>
              {code}
            </h1>
            <h3 className="heading-dark">
              Oops! {message}
            </h3>
            <p className="subtitle subtitle-dark">
              {code === "403" 
                ? "You don't have permission to view this area. Please log in with a valid account."
                : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
              }
            </p>
            
            <Link
                to="/login"
                className="btn-base btn-orange"
                onMouseEnter={() => preloadBackgroundImage('login-img-mountains')}
                onTouchStart={() => preloadBackgroundImage('login-img-mountains')}
            >
              Return to Safety
            </Link>
          </div>
        </InfoCard>
      </div>
    </ImageLayout>
  );
}
