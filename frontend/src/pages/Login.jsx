import { Link } from "react-router";
import WelcomeCard from "../components/WelcomeCard";
import "../styles/Login.css";
import "../styles/LoginForm.css";

function Login() {
  return (
    <div className="login-page">

      {/* COLUNA ESQUERDA */}
      <section className="login-register-side">
        <h1>Don't have an account yet?</h1>

        <p>Sign up here:</p>

        <Link to="/register">
          <button className="register-btn">
            Register
          </button>
        </Link>
      </section>

      {/* CARD LOGIN */}
      <WelcomeCard>
        <h2>Welcome Back!</h2>
        <p>Your travel plans are waiting for you</p>

        <form className="login-form">

          <input
            type="email"
            placeholder="Email"
          />

          <input
            type="password"
            placeholder="Password"
          />

          {/* OPTIONS ROW */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit">
            Login
          </button>

        </form>
      </WelcomeCard>

    </div>
  );
}

export default Login;