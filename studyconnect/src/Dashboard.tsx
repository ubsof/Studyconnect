import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./dashboard.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for notification from URL params
    const status = searchParams.get('status');
    const groupName = searchParams.get('group');
    
    if (status === 'accepted' && groupName) {
      setNotification({ message: `You've been accepted to ${decodeURIComponent(groupName)}!`, type: 'success' });
      setTimeout(() => setNotification(null), 5000);
      // Clear the URL params
      setSearchParams({});
    } else if (status === 'rejected' && groupName) {
      setNotification({ message: `Your request to join ${decodeURIComponent(groupName)} was rejected.`, type: 'error' });
      setTimeout(() => setNotification(null), 5000);
      // Clear the URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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
        const currentGroups = Array.isArray(mg) ? mg : [];
        setMyGroups(currentGroups);
        
        // Check if we have more groups than before (newly accepted)
        const storedIds = JSON.parse(localStorage.getItem('approvedGroupIds') || '[]');
        const currentIds = currentGroups.map((g: any) => g.id);
        
        // Find all new groups
        const newGroupIds = currentIds.filter((id: number) => !storedIds.includes(id));
        
        if (newGroupIds.length > 0) {
          // Get the last new group (most recently added to the list)
          const newGroupId = newGroupIds[newGroupIds.length - 1];
          const newGroup = currentGroups.find((g: any) => g.id === newGroupId);
          
          if (newGroup) {
            setNotification({ 
              message: `You've been accepted to ${newGroup.subject}!`, 
              type: 'success' 
            });
            setTimeout(() => setNotification(null), 5000);
          }
        }
        
        // Store current state
        localStorage.setItem('approvedGroupsCount', currentGroups.length.toString());
        localStorage.setItem('approvedGroupIds', JSON.stringify(currentIds));
      } catch (err) {
        setMyGroups([]);
      }
    })();
  }, []);

  return (
    <div className="dashboard-container">

      {/* NOTIFICATION POPUP */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '16px 24px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#D1FAE5' : '#FEE2E2',
          color: notification.type === 'success' ? '#059669' : '#DC2626',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.type === 'success' ? '✓ ' : '✗ '}
          {notification.message}
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item active">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Support</Link>
        </nav>
        <SidebarUserCard />
      </aside>

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
          </div>
          <div className="study-group-cards">
            {myGroups.length === 0 ? (
              <div className="study-group-card-empty">No groups joined yet</div>
            ) : (
              myGroups.map((g) => (
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
                    <p className="group-date">📅 {g.date || "N/A"}</p>
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
          {myGroups.length === 0 ? <p>No events scheduled</p> : (
            <div className="event-list">
              {myGroups.map((g, idx) => (
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

        <div className="suggested-groups">
          <h3>Suggested Study Groups</h3>
          {suggested.length === 0 ? <p>No suggestions yet</p> : (
            <div className="event-list">
              {suggested.slice(0, 4).map((g, idx) => (
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

      </div>

    </div>
  );
}
