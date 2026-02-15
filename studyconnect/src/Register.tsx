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
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ukUniversities = [
    "University of Aberdeen",
    "Abertay University",
    "Aberystwyth University",
    "Anglia Ruskin University",
    "University of the Arts London",
    "Aston University",
    "Bangor University",
    "University of Bath",
    "Bath Spa University",
    "University of Bedfordshire",
    "University of Birmingham",
    "Birmingham City University",
    "University of Bolton",
    "Bournemouth University",
    "University of Bradford",
    "University of Brighton",
    "University of Bristol",
    "Brunel University London",
    "University of Buckingham",
    "Buckinghamshire New University",
    "University of Cambridge",
    "Canterbury Christ Church University",
    "Cardiff Metropolitan University",
    "Cardiff University",
    "University of Central Lancashire",
    "University of Chester",
    "University of Chichester",
    "City, University of London",
    "Coventry University",
    "Cranfield University",
    "University of Cumbria",
    "De Montfort University",
    "University of Derby",
    "University of Dundee",
    "Durham University",
    "University of East Anglia",
    "University of East London",
    "Edge Hill University",
    "University of Edinburgh",
    "Edinburgh Napier University",
    "University of Essex",
    "University of Exeter",
    "Falmouth University",
    "University of Glasgow",
    "Glasgow Caledonian University",
    "University of Gloucestershire",
    "Goldsmiths, University of London",
    "University of Greenwich",
    "Heriot-Watt University",
    "University of Hertfordshire",
    "University of the Highlands and Islands",
    "University of Huddersfield",
    "University of Hull",
    "Imperial College London",
    "Keele University",
    "University of Kent",
    "King's College London",
    "Kingston University",
    "Lancaster University",
    "University of Leeds",
    "Leeds Beckett University",
    "University of Leicester",
    "University of Lincoln",
    "University of Liverpool",
    "Liverpool Hope University",
    "Liverpool John Moores University",
    "University of London",
    "London Metropolitan University",
    "London South Bank University",
    "Loughborough University",
    "University of Manchester",
    "Manchester Metropolitan University",
    "Middlesex University",
    "Newcastle University",
    "Northumbria University",
    "University of Nottingham",
    "Nottingham Trent University",
    "Open University",
    "University of Oxford",
    "Oxford Brookes University",
    "University of Plymouth",
    "University of Portsmouth",
    "Queen Margaret University",
    "Queen Mary University of London",
    "Queen's University Belfast",
    "University of Reading",
    "Robert Gordon University",
    "University of Roehampton",
    "Royal Holloway, University of London",
    "University of Salford",
    "University of Sheffield",
    "Sheffield Hallam University",
    "SOAS University of London",
    "University of South Wales",
    "University of Southampton",
    "University of St Andrews",
    "Staffordshire University",
    "University of Stirling",
    "University of Strathclyde",
    "University of Suffolk",
    "University of Sunderland",
    "University of Surrey",
    "University of Sussex",
    "Swansea University",
    "Teesside University",
    "Ulster University",
    "University College London",
    "University of Warwick",
    "University of West London",
    "University of the West of England",
    "University of the West of Scotland",
    "University of Westminster",
    "University of Winchester",
    "University of Wolverhampton",
    "University of Worcester",
    "University of York",
    "York St John University"
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.register({ email, password, name, year, course, institution });
      if (res.token) {
        localStorage.setItem("token", res.token);
        navigate("/profile");
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

            <label>Date of Birth</label>
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

            <label>Institution</label>
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', background: 'white', color: institution ? '#1F2937' : '#9CA3AF' }}
            >
              <option value="">Select your university</option>
              {ukUniversities.map((uni) => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>

            <button type="submit">Register</button>
          </form>

          {error && <div style={{ color: "#c00", marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
