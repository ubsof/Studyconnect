import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // fake login just to test routing
    if (email && password) {
      navigate("/dashboard");
    }
  }

  return (
    <div className="page">
      <div className="login-layout">
        {/* Removed the "div" text */}
        
        {/* logo + StudyConnect */}
        <div className="brand-row">
          <div className="brand-logo">
            <span className="cap">🎓</span>
          </div>
          <span className="brand-name">StudyConnect</span>
        </div>

        <div className="brand-underline" />

        {/* card */}
        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Value"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Value"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Sign In</button>
          </form>

          <a className="forgot-link">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
