import { Link } from "react-router";
import InfoCard from "../components/InfoCard";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import WelcomeCard from "../components/WelcomeCard";
import { loginUser } from "../api";
import { FaEye, FaEyeSlash  } from "react-icons/fa6";
import "../styles/Login.css";
import "../styles/LoginForm.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


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


      if (rememberMe) {
        localStorage.setItem("token", token);
      
        localStorage.setItem("user", JSON.stringify(user));
  

        localStorage.setItem("teste", "sou persistente");

        console.log("LOCAL STORAGE");
        console.log(localStorage.getItem("teste"));

        console.log("TOKEN GUARDADO:");
        console.log(localStorage.getItem("token"));

      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        sessionStorage.setItem("teste", "sou temporario");

        console.log("SESSION STORAGE");
        console.log(sessionStorage.getItem("teste"));

        
      }

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
        <h2>Don't have an account yet?</h2>

        <p>Sign up here:</p>

        <Link to="/register">
          <button type="button" className="register-btn">
            Register
          </button>
        </Link>
      </section>

      {/* CARD LOGIN */}
      <InfoCard>
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

         <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

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
          >
            {isPending ? "Logging in..." : "Login"}
          </button>

        </form>
      </InfoCard>

    </div>
  );
}

export default Login;