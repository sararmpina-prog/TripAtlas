import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import WelcomeCard from "../components/WelcomeCard";
import { loginUser } from "../api";

import "../styles/Login.css";
import "../styles/LoginForm.css";

function Login() {
  const navigate = useNavigate();
  


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,

    onSuccess: (response) => {
      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

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
    <div className="login-page">

      <section className="login-register-side">
        <h1>Don't have an account yet?</h1>

        <p>Sign up here:</p>

        <Link to="/register">
          <button type="button" className="register-btn">
            Register
          </button>
        </Link>
      </section>

      <WelcomeCard>
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
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
          >
            {isPending ? "Logging in..." : "Login"}
          </button>

        </form>
      </WelcomeCard>

    </div>
  );
}

export default Login;