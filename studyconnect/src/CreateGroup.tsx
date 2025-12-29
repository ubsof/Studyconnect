import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./creategroup.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [smallDesc, setSmallDesc] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [typeOfStudy, setTypeOfStudy] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        subject,
        smallDesc,
        description,
        startTime: `1970-01-01T${startTime}:00.000Z`,
        endTime: `1970-01-01T${endTime}:00.000Z`,
        capacity,
        typeOfStudy,
        scheduleType,
        language,
        location,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean)
      };
      const res = await api.createGroup(payload);
      if (res.group) {
        navigate("/dashboard");
      } else {
        setError(res.error || "Could not create group");
      }
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="create-layout">

      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item active">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
        </nav>

        <SidebarUserCard />
      </aside>

      {/* MAIN CREATE GROUP CONTENT */}
      <main className="main-content">

        <div className="header">
          <h1>Create Study Group</h1>
        </div>

        <div className="form-container">

          <form className="form-section" onSubmit={handleSubmit}>

            {/* SUBJECT */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Subject <span className="required">*</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            {/* DESCRIPTION */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Description <span className="required">*</span></label>
              <input type="text" value={smallDesc} onChange={(e) => setSmallDesc(e.target.value)} />
            </div>

            {/* START TIME */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Start Time <span className="required">*</span></label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            {/* END TIME */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>End Time <span className="required">*</span></label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>

            {/* MEMBER COUNT */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>How many members <span className="required">*</span></label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>

            {/* TYPE OF STUDY */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Type of study <span className="required">*</span></label>
              <select value={typeOfStudy} onChange={(e) => setTypeOfStudy(e.target.value)}>
                <option value="">Select type of study</option>
                <option value="Exam revision">Exam revision</option>
                <option value="Assignment">Assignment</option>
                <option value="Lecture revision">Lecture revision</option>
                <option value="Lab revision">Lab revision</option>
              </select>
            </div>

            {/* SCHEDULE TYPE */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Schedule Type <span className="required">*</span></label>
              <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                <option value="">Select schedule type</option>
                <option value="one time">One time</option>
                <option value="weekly">Weekly</option>
                <option value="bi weekly">Bi weekly</option>
              </select>
            </div>

            {/* LANGUAGE */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Language <span className="required">*</span></label>
              <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>

            {/* LOCATION */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Location <span className="required">*</span></label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="icon-box">🏷️</div>
              <label>Tags (comma separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="math, python, physics" />
            </div>
            <div style={{ marginTop: 12 }}>
              <button type="submit">Create Group</button>
              {error && <div style={{ color: '#c00', marginTop: 8 }}>{error}</div>}
            </div>
          </form>
        </div>
      </main>

    </div>
  );
}
