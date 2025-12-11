import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./studygroups.css";
import api from "./services/api";

export default function StudyGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
    loadEvents();
    loadSuggested();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const data = await api.getAllGroups();
      setGroups(data || []);
      setEmptyMessage((data || []).length === 0 ? "Match not found" : null);
    } catch (err) {
      console.error(err);
      setEmptyMessage("Match not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadGroups();
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchGroups(searchQuery);
      setGroups(data || []);
      setEmptyMessage((data || []).length === 0 ? "Match not found" : null);
    } catch (err) {
      console.error(err);
      setEmptyMessage("Match not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(groupId: number) {
    try {
      await api.joinGroup(groupId);
      alert("Successfully joined group!");
    } catch (err) {
      alert("Failed to join group");
    }
  }

  async function loadEvents() {
    try {
      const data = await api.upcomingEvents();
      setEvents(data || []);
    } catch (err) {
      setEvents([]);
    }
  }

  async function loadSuggested() {
    try {
      const data = await api.suggested();
      setSuggestedGroups(data || []);
    } catch (err) {
      setSuggestedGroups([]);
    }
  }

  const eventColors = ["#3b82f6", "#8b5cf6", "#10b981"];

  return (
    <div className="studygroups-layout">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar-left">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item active">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
        </nav>

        <div className="user-card">
          <div className="avatar"></div>
          <div className="user-info">
            <strong>Tony</strong>
            <p>Computer Science</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="studygroups-content">
        <div className="header">
          <h1>Study Groups</h1>
          <p>Find and join study groups that match your interests</p>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search groups, events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>

        {/* FILTER TAGS */}
        <div className="filter-tags">
          <span className="tag">Maths</span>
          <span className="tag">Computing</span>
          <span className="tag">physics</span>
          <span className="tag">English</span>
          <span className="tag">engineering</span>
          <span className="tag">Network</span>
          <span className="tag">Computing</span>
        </div>

        {/* GROUPS GRID */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="groups-grid">
            {groups.length === 0 ? (
              <p className="empty">{emptyMessage || "No groups found"}</p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="group-card">
                  <div className="group-icon">
                    {group.subject?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <h3 className="group-title">{group.subject}</h3>
                  <p className="group-members">{group._count?.userGroups || 0} members</p>
                  <p className="group-description">{group.smallDesc}</p>
                  <p className="group-detail"><strong>Location:</strong> {group.location || "N/A"}</p>
                  <p className="group-detail">
                    <strong>Time:</strong> {new Date(group.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(group.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="group-detail"><strong>Language:</strong> {group.language || "Any"}</p>
                  <p className="group-detail"><strong>Type of Study:</strong> {group.typeOfStudy}</p>
                  <button onClick={() => handleJoin(group.id)} className="join-button">
                    Join Group
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar-right">
        <div className="sidebar-section">
          <h3>Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="muted">No upcoming events</p>
          ) : (
            <ul className="event-list">
              {events.map((ev: any, idx: number) => (
                <li key={ev.id}>
                  <span
                    className="event-dot"
                    style={{ background: eventColors[idx % eventColors.length] }}
                  ></span>
                  <div>
                    <strong>{ev.title}</strong>
                    <p>{new Date(ev.startTime).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Suggested Study Groups</h3>
          {suggestedGroups.length === 0 ? (
            <p className="muted">No suggestions yet</p>
          ) : (
            <div className="suggested-list">
              {suggestedGroups.map((g: any, idx: number) => (
                <div className="suggested-card" key={g.id}>
                  <div className={`suggested-icon ${idx % 2 === 0 ? "red" : "green"}`}>
                    {g.subject?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong>{g.subject}</strong>
                    <p>{g._count?.userGroups || 0} members</p>
                    <p className="muted">{g.smallDesc}</p>
                  </div>
                  <button className="join-button" onClick={() => handleJoin(g.id)}>
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
