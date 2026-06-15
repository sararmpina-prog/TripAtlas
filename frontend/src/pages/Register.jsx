import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ImageLayout from '../components/ImageLayout';
import PasswordField from '../components/PasswordField';
import { registerUser } from '../api';
import { saveAuthSession } from '../auth/authStorage';
import {
  getRegisterErrorState,
  hasValidationErrors,
  normalizeRegisterPayload,
  validateRegisterForm,
} from '../auth/authValidation';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    email: '',
    mobile_phone: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.user;

      saveAuthSession({ token, user, rememberMe: true });

      navigate('/register/success');
    },
    onError: (err) => {
      const nextErrorState = getRegisterErrorState(err);
      setFieldErrors(nextErrorState.fieldErrors);
      setFormError(nextErrorState.formError);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
    setFormError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFieldErrors({});

    const normalizedPayload = normalizeRegisterPayload(formData);
    const validationError = validateRegisterForm(normalizedPayload);

    if (hasValidationErrors(validationError)) {
      setFieldErrors(validationError);
      return;
    }

    mutate(normalizedPayload);
  }

  return (
    <ImageLayout bgImageClass="bg-register" hasOverlay={false}>
      <div className="register-split-container">

        {/* Metade Esquerda (Imagem e Info) */}
        <div className="register-left-side">
          <div className="left-content-wrapper">
            <h2>Get Started!</h2>
            <h4>Already have<br />an account?</h4>
            <Link to="/login" className="btn-base btn-light">Login</Link>
          </div>
        </div>

        {/* Metade Direita (Formulário) */}
        <div className="register-right-side">
          <div className="right-content-wrapper">
            <h3 className="heading-light">Create an Account</h3>
            <p className="subtitle subtitle-light">Start your adventure today</p>

            <form className="auth-form register-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form-row">
                <div className="auth-form-field">
                  <input
                    type="text"
                    id="firstName"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(fieldErrors.first_name)}
                    className={fieldErrors.first_name ? 'auth-input-error' : undefined}
                  />
                  {fieldErrors.first_name && (
                    <p className="auth-form-error">
                      {fieldErrors.first_name}
                    </p>
                  )}
                </div>

                <div className="auth-form-field">
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    placeholder="Surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(fieldErrors.surname)}
                    className={fieldErrors.surname ? 'auth-input-error' : undefined}
                  />
                  {fieldErrors.surname && (
                    <p className="auth-form-error">
                      {fieldErrors.surname}
                    </p>
                  )}
                </div>
              </div>

              <div className="auth-form-field">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={fieldErrors.email ? 'auth-input-error' : undefined}
                />
                {fieldErrors.email && (
                  <p className="auth-form-error">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="auth-form-field">
                <input
                  type="tel"
                  id="phone"
                  name="mobile_phone"
                  placeholder="Phone number"
                  value={formData.mobile_phone}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.mobile_phone)}
                  className={fieldErrors.mobile_phone ? 'auth-input-error' : undefined}
                />
                {fieldErrors.mobile_phone && (
                  <p className="auth-form-error">
                    {fieldErrors.mobile_phone}
                  </p>
                )}
              </div>

              <div className="auth-form-field">
                <PasswordField
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  inputClassName={fieldErrors.password ? 'auth-input-error' : undefined}
                />
                {fieldErrors.password && (
                  <p className="auth-form-error">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {formError && (
                <p className="auth-form-error">
                  {formError}
                </p>
              )}

              <div className="auth-form-actions">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-base btn-orange"
                >
                  {isPending ? 'Creating account...' : 'Register'}
                </button>
              </div>
            </form>
        </div>
      </div>
      </div>
    </ImageLayout>
  );
}
