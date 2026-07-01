import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import ImageLayout from "../components/ImageLayout";
import InfoCard from "../components/InfoCard";
import PasswordField from "../components/PasswordField";
import { loginUser } from "../api";
import { saveAuthSession } from "../utils/authStorage";
import { preloadBackgroundImage } from '../utils/preload';
import { useToast } from "../context/ToastContext";
import SubmitButton from "../components/SubmitButton";
import {
  getLoginErrorState,
  hasValidationErrors,
  normalizeLoginPayload,
  validateLoginForm,
} from "../validators/authValidator";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validação: O botão acende se ambos os campos tiverem texto digitado
  const hasChanges = email.trim() !== "" && password.trim() !== "";

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,

   onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.user;

      saveAuthSession({ token, user, rememberMe });

      // Toast de sucesso que vai nascer já dentro do Dashboard
      toast(`Welcome back, ${user?.first_name || 'traveler'}!`, 'success');

      navigate("/dashboard");
    },

    onError: (err) => {
      const nextErrorState = getLoginErrorState(err);
      setFieldErrors(nextErrorState.fieldErrors);
      setFormError(nextErrorState.formError);
    },
  });

  console.log("isPending:", isPending);

  function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setFieldErrors({});

    const validationError = validateLoginForm({ email, password, rememberMe });

    if (hasValidationErrors(validationError)) {
      setFieldErrors(validationError);
      return;
    }

    console.log("Cliquei Login");
    console.log("SUBMIT OK");
    console.log("antes da função mutate os dados são", email, password)
    mutate(normalizeLoginPayload({ email, password, rememberMe }));
  }

  return (
    <ImageLayout bgImageClass="bg-login" hasOverlay={false}>
      <div className="auth-split auth-split-login">
        <section className="auth-side-panel">
          <h2>Don't have an account yet?</h2>
          <h4>Sign up here:</h4>

          <Link 
            to="/register" 
            className="btn-base btn-light"
            onMouseEnter={() => preloadBackgroundImage('register-img-greece')}
            onTouchStart={() => preloadBackgroundImage('register-img-greece')}
          >
            Register
          </Link>
        </section>

        <InfoCard className="login-card">
          <h3 className="heading-dark">Welcome Back!</h3>
          <p className="subtitle subtitle-dark">Your travel plans are waiting for you</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-field">
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    email: "",
                  }));
                  setFormError("");
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                className={fieldErrors.email ? "auth-input-error" : undefined}
              />

              {fieldErrors.email && (
                <p className="auth-form-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="auth-form-field">
              <PasswordField
                name="password"
                placeholder="Password *"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    password: "",
                  }));
                  setFormError("");
                }}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                inputClassName={fieldErrors.password ? "auth-input-error" : undefined}
              />

              {fieldErrors.password && (
                <p className="auth-form-error">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="auth-inline-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link 
                to="/forgot-password"
                onMouseEnter={() => preloadBackgroundImage('forgotPassword-img-mountains')}
                onTouchStart={() => preloadBackgroundImage('forgotPassword-img-mountains')}
              >
                Forgot password?
                
              </Link>
            </div>

            {formError && (
              <p className="auth-form-error">
                {formError}
              </p>
            )}

            {/* SUBMIT BUTTON REUTILIZÁVEL */}
            <SubmitButton 
              isPending={isPending} 
              hasChanges={hasChanges} 
              label="Login"
              pendingLabel="Logging in..."
              className="btn-base btn-light auth-submit"
            />
          </form>
        </InfoCard>
      </div>
    </ImageLayout>
  );
}

export default Login;