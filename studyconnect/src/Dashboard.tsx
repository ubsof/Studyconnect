import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const ev = await api.upcomingEvents();
        setEvents(ev || []);
      } catch (err) {
        setEvents([]);
      }

      try {
        const sg = await api.suggested();
        setSuggested(sg || []);
      } catch (err) {
        setSuggested([]);
      }

      try {
        const mg = await api.getMyGroups();
        setMyGroups(Array.isArray(mg) ? mg : []);
      } catch (err) {
        setMyGroups([]);
      }
    })();
  }, []);

  return (
    <div className="dashboard-container">

      {/* LEFT SIDEBAR */}
      <div className="left-sidebar">
        <h2>StudyConnect</h2>

        <nav>
          <ul>
            <li><Link to="/dashboard" className="active">Dashboard</Link></li>
            <li><Link to="/studygroups">Study Groups</Link></li>
            <li><Link to="/creategroup">Create Group</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </nav>
        <SidebarUserCard />
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        <div className="dashboard-header">
          <h2>Welcome back!</h2>
          <p>Ready to connect and learn today?</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <div className="action-card">
            <div>
              <h3>Create Study Group</h3>
              <p>Start a new group</p>
            </div>
            <Link to="/creategroup" className="action-button">Create</Link>
          </div>

          <div className="action-card">
            <div>
              <h3>Find Groups</h3>
              <p>Join existing groups</p>
            </div>
            <Link to="/studygroups" className="action-button">Browse</Link>
          </div>
        </div>

        {/* STUDY GROUPS */}
        <div className="my-study-groups">
          <div className="my-groups-header">
            <h3>My Study Groups</h3>
            <Link to="/studygroups" className="view-all-link">View All</Link>
          </div>
          <div className="study-group-cards">
            {myGroups.length === 0 ? (
              <div className="study-group-card-empty">No groups joined yet</div>
            ) : (
              myGroups.slice(0, 3).map((g) => (
                <div key={g.id} className="study-group-card-detailed">
                  <div className="card-header">
                    <div className="card-left">
                      <div className="group-icon-small">{g.subject?.charAt(0).toUpperCase() || "G"}</div>
                      <div className="group-title-section">
                        <strong className="group-title">{g.subject}</strong>
                        <p className="member-count">{g._count?.userGroups || 0}/{g.capacity || 0} members</p>
                      </div>
                    </div>
                    <span className="active-badge">Active</span>
                  </div>
                  <div className="card-body">
                    <p className="group-desc">{g.smallDesc}</p>
                    <p className="group-time">⏰ {new Date(g.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="group-location">📍 Location: {g.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR */}
      <div className="right-sidebar">

        <div className="upcoming-events">
          <h3>Upcoming Events</h3>
          {events.length === 0 ? <p>No events scheduled</p> : (
            <ul>
              {events.map(ev => (
                <li key={ev.id}>{ev.title} — {new Date(ev.startTime).toLocaleString()}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="suggested-groups">
          <h3>Suggested Study Groups</h3>
          {suggested.length === 0 ? <p>No suggestions yet</p> : (
            <ul>
              {suggested.map(g => (
                <li key={g.id}>{g.subject} — {g.smallDesc}</li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
