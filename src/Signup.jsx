
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingUser = JSON.parse(
      localStorage.getItem("pennywise_user") || "null"
    );

    if (
      existingUser &&
      existingUser.email === email.trim().toLowerCase()
    ) {
      setError("An account with this email already exists. Please sign in.");
      return;
    }

    const user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    localStorage.setItem("pennywise_user", JSON.stringify(user));
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration">
        <div className="auth-brand">PennyWise<span>.</span></div>
        <div className="auth-message">
          <p className="auth-eyebrow">START YOUR JOURNEY</p>
          <h1>Build better money habits, one step at a time.</h1>
          <p>
            Create your account and start organizing your spending,
            budgets, and savings goals.
          </p>
          <div className="auth-highlight">
            <span>✓</span>
            Your financial journey starts here.
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-form" onSubmit={handleSignup}>
          <div className="auth-mobile-brand">PennyWise<span>.</span></div>
          <p className="auth-eyebrow">CREATE AN ACCOUNT</p>
          <h2>Join PennyWise</h2>
          <p className="auth-subtitle">
            Fill in your details to get started.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label htmlFor="signup-confirm">Confirm password</label>
          <input
            id="signup-confirm"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />

          <button className="auth-submit" type="submit">
            Create Account <span>→</span>
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
