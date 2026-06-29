// src/components/PrivateFooter.jsx
import '../styles/Footer.css';

export default function PrivateFooter() {
  return (
    <footer className="private-footer">
      <p>&copy; {new Date().getFullYear()} TripAtlas &bull; All rights reserved</p>
    </footer>
  );
}
