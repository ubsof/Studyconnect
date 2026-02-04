import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./creategroup.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [smallDesc, setSmallDesc] = useState("");
  const [description] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [typeOfStudy, setTypeOfStudy] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation for required fields
    if (!subject.trim()) {
      setError("Subject is required");
      return;
    }
    if (!smallDesc.trim()) {
      setError("Description is required");
      return;
    }
    if (!date.trim()) {
      setError("Date is required");
      return;
    }
    if (!startTime.trim()) {
      setError("Start Time is required");
      return;
    }
    if (!capacity || capacity <= 0) {
      setError("How many members is required");
      return;
    }
    if (!location.trim()) {
      setError("Location is required");
      return;
    }

    try {
      const payload = {
        subject,
        smallDesc,
        description,
        date,
        startTime: `${date}T${startTime}:00.000Z`,
        endTime: `${date}T${endTime}:00.000Z`,
        capacity,
        typeOfStudy,
        scheduleType,
        language,
        location
      };
      const res = await api.createGroup(payload);
      if (res.group) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
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
          <Link to="/dashboard" className="nav-item">Homepage</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item active">Create Group</Link>
          <Link to="/helpforum" className="nav-item">Help Forum</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Wellbeing Support</Link>
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
              <div className="icon-box">📚</div>
              <label>Subject <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Calculus exam prep"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-row">
              <div className="icon-box">📝</div>
              <label>Description <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Short summary students will see"
                value={smallDesc}
                onChange={(e) => setSmallDesc(e.target.value)}
              />
            </div>

            {/* DATE */}
            <div className="form-row">
              <div className="icon-box">📅</div>
              <label>Date <span className="required">*</span></label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* START TIME */}
            <div className="form-row">
              <div className="icon-box">🕐</div>
              <label>Start Time <span className="required">*</span></label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            {/* END TIME */}
            <div className="form-row">
              <div className="icon-box">🕕</div>
              <label>End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>

            {/* MEMBER COUNT */}
            <div className="form-row">
              <div className="icon-box">👥</div>
              <label>How many members <span className="required">*</span></label>
              <input
                type="number"
                placeholder="Max members (e.g., 10)"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>

            {/* LOCATION */}
            <div className="form-row">
              <div className="icon-box">📍</div>
              <label>Location <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Library Room 201 or Zoom link"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* ADVANCED SETTINGS TOGGLE */}
            <div 
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                marginTop: '8px',
                cursor: 'pointer',
                color: '#6366F1',
                fontWeight: 500,
                fontSize: '14px',
                background: '#F5F3FF',
                borderRadius: '8px',
                border: '1px dashed #C7D2FE',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
              Advanced Settings
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9CA3AF' }}>
                {showAdvanced ? 'Click to hide' : 'Type of study, Schedule, Language'}
              </span>
            </div>

            {/* ADVANCED SETTINGS SECTION */}
            {showAdvanced && (
              <div className="advanced-section" style={{ 
                marginTop: '12px', 
                padding: '16px', 
                background: '#FAFAFA', 
                borderRadius: '12px',
                border: '1px solid #E5E7EB'
              }}>
                {/* TYPE OF STUDY */}
                <div className="form-row">
                  <div className="icon-box">🎯</div>
                  <label>Type of study</label>
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
                  <div className="icon-box">🔄</div>
                  <label>Schedule Type</label>
                  <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                    <option value="">Select schedule type</option>
                    <option value="one time">One time</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi weekly">Bi weekly</option>
                  </select>
                </div>

                {/* LANGUAGE */}
                <div className="form-row">
                  <div className="icon-box">🌐</div>
                  <label>Language</label>
                  <input
                    type="text"
                    placeholder="e.g., English"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button type="submit">Create Group</button>
              {error && <div style={{ color: '#c00', marginTop: 8 }}>{error}</div>}
              {success && <div style={{ color: '#059669', marginTop: 8, padding: '12px', background: '#D1FAE5', borderRadius: '8px', fontWeight: 600 }}>✓ Group created successfully! Redirecting...</div>}
            </div>
          </form>
        </div>
      </main>

    </div>
  );
}
