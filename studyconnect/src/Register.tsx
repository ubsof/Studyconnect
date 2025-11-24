import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [dob, setDob] = useState("");
  const [course, setCourse] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // currently just logs and navigates back to login for demo
    console.log({ name, year, dob, course });
    navigate("/login");
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
        </div>
      </div>
    </div>
  );
}
