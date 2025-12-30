import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./profile.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: number; email: string; name?: string; year?: string; course?: string } | null>(null);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aboutMe, setAboutMe] = useState("");
  const [hobby, setHobby] = useState("");
  const [language, setLanguage] = useState("");
  const [nationality, setNationality] = useState("");
  const [funFact, setFunFact] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.me();
        if (res && res.id) {
          setUser(res);
          // Load saved profile data
          const savedProfile = localStorage.getItem(`profile_${res.id}`);
          if (savedProfile) {
            const data = JSON.parse(savedProfile);
            setAboutMe(data.aboutMe || "");
            setHobby(data.hobby || "");
            setLanguage(data.language || "");
            setNationality(data.nationality || "");
            setFunFact(data.funFact || "");
          }
        }
        else setError(res?.error || "Not authenticated");
      } catch (e) {
        setError("Failed to load profile");
      }

      try {
        const groups = await api.getCreatedGroups();
        setCreatedGroups(groups || []);
      } catch (e) {
        console.error("Failed to load created groups");
      }
    })();
  }, []);

  const displayName = user?.name || "User";
  const displayYear = user?.year || "-";
  const displayCourse = user?.course || "-";

  function handleLogout() {
    try {
      localStorage.removeItem("token");
    } catch {}
    navigate("/login");
  }

  async function handleSave() {
    try {
      // Store profile data in localStorage for now
      const profileData = { aboutMe, hobby, language, nationality, funFact };
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileData));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError("Failed to save profile");
    }
  }

  return (
    <div className="profile-layout">

      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item active">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Support</Link>
        </nav>

        <SidebarUserCard />
      </aside>

      {/* PROFILE MAIN CONTENT */}
      <main className="profile-content">

        <div className="logout-header">
          <div>
            <h1 className="welcome">Welcome back, {displayName}!</h1>
            <p className="subtitle">Ready to connect and learn today?</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>Log Out</button>
        </div>

        <div className="profile-card">

          <div className="profile-avatar"></div>

          <h2 className="profile-name">{displayName}</h2>

          <p className="profile-line"><strong>Email:</strong> {user?.email || "-"}</p>
          <p className="profile-line"><strong>Year:</strong> {displayYear}</p>
          <p className="profile-line"><strong>Course:</strong> {displayCourse}</p>

          <textarea
            className="about-box"
            placeholder='"About me……"'
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          ></textarea>

          <div className="profile-field">
            <strong>Hobby:</strong>
            <input
              type="text"
              className="profile-input"
              placeholder="e.g., Reading, Gaming, Sports"
              value={hobby}
              onChange={(e) => setHobby(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <strong>Language:</strong>
            <input
              type="text"
              className="profile-input"
              placeholder="e.g., English, Spanish"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <strong>Nationality:</strong>
            <input
              type="text"
              className="profile-input"
              placeholder="e.g., British, American"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <strong>Fun Fact about me:</strong>
            <input
              type="text"
              className="profile-input"
              placeholder="Share something interesting about yourself"
              value={funFact}
              onChange={(e) => setFunFact(e.target.value)}
            />
          </div>

          <button className="save-button" onClick={handleSave}>Save Profile</button>
          {saveSuccess && <div style={{ color: '#059669', marginTop: 8, padding: '12px', background: '#D1FAE5', borderRadius: '8px', fontWeight: 600 }}>✓ Profile saved successfully!</div>}
          {error && <div style={{ color: "#c00", marginTop: 8 }}>{error}</div>}
        </div>

        {/* CREATED GROUPS SECTION */}
        <div className="created-groups-section">
          <h2 className="section-title">Groups You Created</h2>
          {createdGroups.length === 0 ? (
            <p className="empty-message">You haven't created any groups yet</p>
          ) : (
            <div className="groups-grid">
              {createdGroups.map((group) => (
                <Link 
                  key={group.id} 
                  to={`/manage-group/${group.id}`}
                  className="group-item"
                >
                  <div className="group-icon">
                    {group.subject?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div className="group-details">
                    <h3>{group.subject}</h3>
                    <p className="group-desc">{group.smallDesc}</p>
                    <p className="group-members">{group._count?.userGroups || 0} members</p>
                  </div>
                  <div className="manage-badge">Manage →</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
