import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import api from "./services/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [dob, setDob] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.register({ email, password, name, year, course });
      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/dashboard");
      } else {
        setError(res.error || "Registration failed");
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
            <label>Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Year</label>
            <input
              type="text"
              placeholder="e.g. 4th"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />

            <label>When you born</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <label>What course</label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />

            <button type="submit">Register</button>
          </form>

          {error && <div style={{ color: "#c00", marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
