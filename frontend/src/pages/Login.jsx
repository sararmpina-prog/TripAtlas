import { Link } from "react-router";
import WelcomeCard from "../components/WelcomeCard";


function Login() {
  return (
    <div>

      <section>
        <h1>Don't have an account yet?</h1>

        <p>Sign up here:</p>

        <Link to="/register">
          <button>
            Register
          </button>
            </Link>
        </section>

      <WelcomeCard>
        <h2>Welcome Back!</h2>

        <p>Your travel plans are waiting for you</p>

        <form>
          <input
            type="email"
            placeholder="Email"
          />

          <input
            type="password"
            placeholder="Password"
          />

        
        <div>
            <label>
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