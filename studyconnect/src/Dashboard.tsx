import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import api from "./services/api";

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);

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
            <div className="study-group-card">No groups joined yet</div>
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
