import { Link } from 'react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import ImageLayout from '../components/ImageLayout';
import PasswordField from '../components/PasswordField';
import { registerUser } from '../api';
import { saveAuthSession } from '../authStorage';
import '../styles/Register.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d+\s()-]+$/;

function validateRegisterForm(formData) {
  if (!formData.first_name) {
    return 'First name is required.';
  }

  if (!formData.surname) {
    return 'Surname is required.';
  }

  if (!emailPattern.test(formData.email)) {
    return 'Please enter a valid email address.';
  }

  if (formData.mobile_phone) {
    const digitsOnly = formData.mobile_phone.replace(/\D/g, '');

    if (!phonePattern.test(formData.mobile_phone) || digitsOnly.length < 9) {
      return 'Please enter a valid phone number.';
    }
  }

  if (formData.password.length < 6) {
    return 'Password must have at least 6 characters.';
  }

  return '';
}

function normalizeRegisterPayload(formData) {
  const normalizedPayload = {
    first_name: formData.first_name.trim(),
    surname: formData.surname.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
  };

  const mobilePhone = formData.mobile_phone.trim();

  if (mobilePhone) {
    normalizedPayload.mobile_phone = mobilePhone;
  }

  return normalizedPayload;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    email: '',
    mobile_phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.user;

      saveAuthSession({ token, user, rememberMe: true });

      navigate('/register/success');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const normalizedPayload = normalizeRegisterPayload(formData);
    const validationError = validateRegisterForm(normalizedPayload);

    if (validationError) {
      setError(validationError);
      return;
    }

    mutate(normalizedPayload);
  }

  return (
    <ImageLayout bgImageClass="bg-register">
      <div className="register-container">
        <div className="register-left">
          <h2 className="heading-light">Get Started!</h2>
          <p className="p-white register-side-copy">Already have<br />an account?</p>
          <Link to="/login" className="btn-base btn-orange register-side-cta">Login</Link>
        </div>

        <div className="register-right-card">
          <h2 className="heading-dark form-title">Create an Account</h2>
          <p className="form-subtitle">Start your adventure today</p>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  id="firstName"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  placeholder="Surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                id="phone"
                name="mobile_phone"
                placeholder="Phone number"
                value={formData.mobile_phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group password-group">
              <PasswordField
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                wrapperClassName="input-wrapper"
                toggleClassName="password-icon"
              />
            </div>

            {error && (
              <p className="register-error">
                {error}
              </p>
            )}

            <div className="form-actions">
              <button
                type="submit"
                disabled={isPending}
                className="btn-white btn-register-submit btn-base"
              >
                {isPending ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </ImageLayout>
  );
}
