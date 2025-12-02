import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import api from "./services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/dashboard");
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="page">
      <div className="login-layout">
        <div className="brand-row">
          <div className="brand-logo">
            <span className="cap">🎓</span>
          </div>
          <span className="brand-name">StudyConnect</span>
        </div>

        <div className="brand-underline" />

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Sign In</button>
          </form>

          {error && <div style={{ color: "#c00", marginTop: 8 }}>{error}</div>}
          <a className="forgot-link">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
