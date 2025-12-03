import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./studygroups.css";
import api from "./services/api";

export default function StudyGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    setLoading(true);
    try {
      const data = await api.getAllGroups();
      setGroups(data || []);
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
              <p>No groups found</p>
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
          <ul className="event-list">
            <li>
              <span className="event-dot blue"></span>
              <div>
                <strong>Calculus Study Session</strong>
                <p>Today, 3:00 PM</p>
              </div>
            </li>
            <li>
              <span className="event-dot purple"></span>
              <div>
                <strong>Chemistry Lab Prep</strong>
                <p>Tomorrow, 2:00 AM</p>
              </div>
            </li>
            <li>
              <span className="event-dot green"></span>
              <div>
                <strong>International Mixer</strong>
                <p>Friday, 7:00 AM</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <h3>Suggested Study Groups</h3>
          <div className="suggested-list">
            <div className="suggested-card">
              <div className="suggested-icon red">P</div>
              <div>
                <strong>Physics Study Circle</strong>
                <p>4 members</p>
              </div>
            </div>
            <div className="suggested-card">
              <div className="suggested-icon green">P</div>
              <div>
                <strong>Programming Bootcamp</strong>
                <p>12 members</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
