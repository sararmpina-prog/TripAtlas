import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import ImageLayout from "../components/ImageLayout";
import InfoCard from "../components/InfoCard";
import PasswordField from "../components/PasswordField";
import { loginUser } from "../api";
import { saveAuthSession } from "../authStorage";
import "../styles/Login.css";
import "../styles/LoginForm.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);


  //  useEffect(() => {
  //   const token =
  //     localStorage.getItem("token") ||
  //     sessionStorage.getItem("token");

  //   if (token) {
  //     navigate("/dashboard");
  //   }
  // }, [navigate]);


  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,

   onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.user;

      saveAuthSession({ token, user, rememberMe });

      navigate("/login/success");
    },

    onError: (err) => {
      setError(err.message);
    },
  });

  console.log("isPending:", isPending);

  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    console.log("Cliquei Login");
    console.log("SUBMIT OK");
    console.log("antes da função mutate os dados são", email, password)
    mutate({
      email,
      password,
    });
  }

  return (
    <ImageLayout bgImageClass="bg-login">
      <div className="auth-split auth-split-login">
        <section className="auth-side-panel">
          <h2>Don&apos;t have an account yet?</h2>
          <p className="auth-side-copy">Sign up here:</p>

          <Link to="/register" className="register-btn">
            Register
          </Link>
        </section>

        <InfoCard className="auth-card login-card">
          <h2>Welcome Back!</h2>
          <p>Your travel plans are waiting for you</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordField
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="auth-submit"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </InfoCard>
      </div>
    </ImageLayout>
  );
}

export default Login;