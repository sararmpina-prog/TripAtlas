import { Link } from 'react-router';
import ImageLayout from '../components/ImageLayout';
import '../styles/Register.css';

export default function Register() {
  return (
    <ImageLayout bgImageClass="bg-register">
      <div className="register-container">
        
        {/* Lado Esquerdo - Chamada para Login */}
        <div className="register-left">
          <h2 className="heading-light">Get Started!</h2>
          <p className="p-white">Already have an account?</p>
          <Link to="/login" className="btn-base btn-orange">Login</Link>
        </div>

        {/* Lado Direito - Formulário em Card Branco */}
        <div className="register-right-card">
          <h2 className="heading-dark form-title">Create an Account</h2>
          <p className="form-subtitle">Start your adventure today</p>
          
          <form className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input type="text" id="surname" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input type="tel" id="phone" />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input type="password" id="password" />
                <span className="password-icon">👁️</span>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-white btn-register-submit">
                Register
              </button>
            </div>
          </form>
        </div>

      </div>
    </ImageLayout>
  );
}
