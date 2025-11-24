import "./profile.css";

export default function ProfilePage() {
  return (
    <div className="profile-layout">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar-left">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <a className="nav-item">Dashboard</a>
          <a className="nav-item">Study Groups</a>
          <a className="nav-item">Create Group</a>
          <a className="nav-item active">Profile</a>
        </nav>

        <div className="user-card">
          <div className="avatar"></div>
          <div className="user-info">
            <strong>Tony</strong>
            <p>Computer Science</p>
          </div>
        </div>
      </aside>

      {/* PROFILE MAIN CONTENT */}
      <main className="profile-content">

        <h1 className="welcome">Welcome back, Tony!</h1>
        <p className="subtitle">Ready to connect and learn today?</p>

        <div className="profile-card">

          <div className="profile-avatar"></div>

          <h2 className="profile-name">Anthony</h2>

          <p className="profile-line"><strong>Year:</strong> 4th</p>
          <p className="profile-line"><strong>Course:</strong> Computing Science</p>

          <textarea
            className="about-box"
            placeholder='"About me……"'
          ></textarea>

          <p className="profile-line"><strong>Hobby:</strong></p>
          <p className="profile-line"><strong>Language:</strong></p>
          <p className="profile-line"><strong>Nationality:</strong></p>
          <p className="profile-line"><strong>Fun Fact about me:</strong></p>

        </div>
      </main>

    </div>
  );
}
