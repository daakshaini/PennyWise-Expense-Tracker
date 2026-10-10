
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const savedUser = JSON.parse(
      localStorage.getItem("pennywise_user") || "null"
    );

    if (!savedUser) {
      setError("Account not found. Please sign up first.");
      return;
    }

    if (
      savedUser.email === email.trim().toLowerCase() &&
      savedUser.password === password
    ) {
      localStorage.setItem("pennywise_logged_in", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-brand">PennyWise<span>.</span></div>
        <div className="auth-message">
          <p className="auth-eyebrow">YOUR MONEY, YOUR FUTURE</p>
          <h1>Make your money work smarter.</h1>
          <p>
            Track spending, plan budgets, and build better financial habits
            with PennyWise.
          </p>
          <div className="auth-highlight">
            <span>↗</span>
            Small steps today. Stronger savings tomorrow.
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-mobile-brand">PennyWise<span>.</span></div>
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p className="auth-subtitle">
            Enter your details to continue to your dashboard.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-submit" type="submit">
            Sign In <span>→</span>
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
