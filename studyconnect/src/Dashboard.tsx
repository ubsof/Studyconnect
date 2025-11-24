import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">

      {/* LEFT SIDEBAR */}
      <div className="left-sidebar">
        <h2>StudyConnect</h2>

        <nav>
          <ul>
            <li><a className="active">Dashboard</a></li>
            <li><a>Study Groups</a></li>
            <li><a>Create Group</a></li>
            <li><a>Profile</a></li>
          </ul>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        <div className="dashboard-header">
          <h2>Welcome back, Tony!</h2>
          <p>Ready to connect and learn today?</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <div className="action-card">
            <div>
              <h3>Create Study Group</h3>
              <p>Start a new group</p>
            </div>
          </div>

          <div className="action-card">
            <div>
              <h3>Find Groups</h3>
              <p>Join existing groups</p>
            </div>
          </div>
        </div>

        {/* STUDY GROUPS */}
        <div className="my-study-groups">
          <h3>My Study Groups</h3>
          <div className="study-group-cards">
            <div className="study-group-card">
              No groups joined yet
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR */}
      <div className="right-sidebar">

        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          <p>No events scheduled</p>
        </div>

        <div className="suggested-groups">
          <h3>Suggested Study Groups</h3>
          <p>No suggestions yet</p>
        </div>

      </div>

    </div>
  );
}
