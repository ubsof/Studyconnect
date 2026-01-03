import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./studygroups.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function StudyGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [setEvents] = useState<any[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
    loadEvents();
    loadSuggested();
    loadMyGroups();
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
      alert("Join request sent! Wait for admin approval.");
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

  async function loadMyGroups() {
    try {
      const data = await api.getMyGroups();
      setMyGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setMyGroups([]);
    }
  }

  // const eventColors = ["#3b82f6", "#8b5cf6", "#10b981"];

  return (
    <div className="studygroups-layout">
      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Homepage</Link>
          <Link to="/studygroups" className="nav-item active">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Wellbeing Support</Link>
        </nav>

        <SidebarUserCard />
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
                  <p className="group-members">{group._count?.userGroups || 0}/{group.capacity || 0} members</p>
                  <p className="group-description">{group.smallDesc}</p>
                  <p className="group-detail"><strong>Date:</strong> {group.date || "N/A"}</p>
                  <p className="group-detail"><strong>Location:</strong> {group.location || "N/A"}</p>
                  <p className="group-detail">
                    <strong>Time:</strong> {new Date(group.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(group.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="group-detail"><strong>Language:</strong> {group.language || "Any"}</p>
                  <p className="group-detail"><strong>Type of Study:</strong> {group.typeOfStudy}</p>
                  <p className="group-detail"><strong>Schedule Type:</strong> {group.scheduleType}</p>
                  <button onClick={() => handleJoin(group.id)} className="join-button">
                    Request to Join
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
          {myGroups.length === 0 ? (
            <p className="muted">No upcoming events</p>
          ) : (
            <div className="event-list">
              {myGroups.map((g: any, idx: number) => (
                <div key={g.id} className="event-item">
                  <div className="event-icon" style={{ background: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][idx % 5] }}>
                    {g.subject?.charAt(0).toUpperCase() || "E"}
                  </div>
                  <div className="event-info">
                    <strong>{g.subject}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Suggested Study Groups</h3>
          {suggestedGroups.length === 0 ? (
            <p className="muted">No suggestions yet</p>
          ) : (
            <div className="event-list">
              {suggestedGroups.slice(0, 4).map((g: any, idx: number) => (
                <div key={g.id} className="event-item">
                  <div className="event-icon" style={{ background: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][idx % 5] }}>
                    {g.subject?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="event-info">
                    <strong>{g.subject}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
