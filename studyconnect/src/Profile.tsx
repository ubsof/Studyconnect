import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./profile.css";
import api from "./services/api";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: number; email: string; name?: string; year?: string; course?: string } | null>(null);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.me();
        if (res && res.id) setUser(res);
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

  return (
    <div className="profile-layout">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar-left">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item active">Profile</Link>
        </nav>

        <div className="user-card">
          <div className="avatar"></div>
          <div className="user-info">
            <strong>{displayName}</strong>
            <p>{displayCourse}</p>
          </div>
        </div>
      </aside>

      {/* PROFILE MAIN CONTENT */}
      <main className="profile-content">

        <h1 className="welcome">Welcome back, {displayName}!</h1>
        <p className="subtitle">Ready to connect and learn today?</p>

        <div className="profile-card">

          <div className="profile-avatar"></div>

          <h2 className="profile-name">{displayName}</h2>

          <p className="profile-line"><strong>Email:</strong> {user?.email || "-"}</p>
          <p className="profile-line"><strong>Year:</strong> {displayYear}</p>
          <p className="profile-line"><strong>Course:</strong> {displayCourse}</p>

          <textarea
            className="about-box"
            placeholder='"About me……"'
          ></textarea>

          <p className="profile-line"><strong>Hobby:</strong></p>
          <p className="profile-line"><strong>Language:</strong></p>
          <p className="profile-line"><strong>Nationality:</strong></p>
          <p className="profile-line"><strong>Fun Fact about me:</strong></p>

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
