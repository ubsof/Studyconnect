import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./dashboard.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function Dashboard() {
  const [, setEvents] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [createdGroups, setCreatedGroups] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  // Edit modal state
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    subject: '',
    smallDesc: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    typeOfStudy: '',
    scheduleType: '',
    language: '',
    location: ''
  });
  
  // Member notifications (for group updates)
  const [memberNotifications, setMemberNotifications] = useState<any[]>([]);
  
  // Group members for edit modal
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  // View-only modal state (for joined groups)
  const [viewingGroup, setViewingGroup] = useState<any>(null);
  const [viewGroupMembers, setViewGroupMembers] = useState<any[]>([]);

  // Profile modal state
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

      // Get current user ID
      try {
        const userRes = await api.me();
        if (userRes && userRes.id) {
          setCurrentUserId(userRes.id);
        }
      } catch (err) {}

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

      // Fetch groups created by me
      try {
        const created = await api.getCreatedGroups();
        setCreatedGroups(Array.isArray(created) ? created : []);
      } catch (err) {
        setCreatedGroups([]);
      }

      // Fetch pending requests for groups I created
      try {
        const requests = await api.getAllPendingRequests();
        setPendingRequests(Array.isArray(requests) ? requests : []);
      } catch (err) {
        setPendingRequests([]);
      }

      // Fetch member notifications (group updates)
      try {
        const notifs = await api.getNotifications();
        setMemberNotifications(Array.isArray(notifs) ? notifs.filter((n: any) => !n.read) : []);
      } catch (err) {
        setMemberNotifications([]);
      }
    })();
  }, []);

  // Handle opening edit modal
  const handleEditGroup = async (group: any) => {
    setEditingGroup(group);
    setEditForm({
      subject: group.subject || '',
      smallDesc: group.smallDesc || '',
      description: group.description || '',
      date: group.date || '',
      startTime: group.startTime ? new Date(group.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      endTime: group.endTime ? new Date(group.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
      capacity: group.capacity?.toString() || '',
      typeOfStudy: group.typeOfStudy || '',
      scheduleType: group.scheduleType || '',
      language: group.language || '',
      location: group.location || ''
    });
    
    // Fetch group members
    try {
      const members = await api.getGroupMembers(group.id);
      setGroupMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      setGroupMembers([]);
    }

    // Load chat messages
    loadChatMessages(group.id);
  };

  // Handle opening view-only modal for joined groups
  const handleViewGroup = async (group: any) => {
    setViewingGroup(group);
    try {
      const members = await api.getGroupMembers(group.id);
      setViewGroupMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      setViewGroupMembers([]);
    }
    // Load chat messages
    loadChatMessages(group.id);
  };

  // Load chat messages for a group
  const loadChatMessages = async (groupId: number) => {
    setChatLoading(true);
    try {
      const msgs = await api.getGroupMessages(groupId);
      setChatMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      setChatMessages([]);
    }
    setChatLoading(false);
  };

  // Send a chat message
  const handleSendMessage = async (groupId: number) => {
    if (!chatInput.trim()) return;
    try {
      const msg = await api.sendGroupMessage(groupId, chatInput.trim());
      if (msg && msg.id) {
        setChatMessages(prev => [...prev, msg]);
      }
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  // Handle viewing a member's profile
  const handleViewMemberProfile = async (userId: number) => {
    try {
      const profile = await api.getUserProfile(userId);
      // Also try to get extra profile info from localStorage
      const savedProfile = localStorage.getItem(`profile_${userId}`);
      let extraData = { aboutMe: "", hobby: "", language: "", nationality: "", funFact: "" };
      if (savedProfile) {
        try { extraData = JSON.parse(savedProfile); } catch {}
      }
      setSelectedProfile({ ...profile, ...extraData });
      setShowProfileModal(true);
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  // Handle saving group changes
  const handleSaveGroup = async () => {
    if (!editingGroup) return;
    try {
      // Combine date with start/end times for proper datetime storage
      const formData = { ...editForm };
      if (editForm.date && editForm.startTime) {
        formData.startTime = `${editForm.date}T${editForm.startTime}`;
      }
      if (editForm.date && editForm.endTime) {
        formData.endTime = `${editForm.date}T${editForm.endTime}`;
      }
      await api.updateGroup(editingGroup.id, formData);
      setNotification({ message: 'Group updated successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
      setEditingGroup(null);
      // Refresh created groups
      const created = await api.getCreatedGroups();
      setCreatedGroups(Array.isArray(created) ? created : []);
    } catch (err) {
      setNotification({ message: 'Failed to update group', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle kicking a member from the group
  const handleKickMember = async (memberId: number, memberName: string) => {
    if (!editingGroup) return;
    if (!confirm(`Are you sure you want to remove ${memberName} from the group?`)) return;
    
    try {
      await api.kickMember(editingGroup.id, memberId);
      setGroupMembers(prev => prev.filter(m => m.id !== memberId));
      setNotification({ message: `${memberName} has been removed from the group`, type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({ message: 'Failed to remove member', type: 'error' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Handle dismissing member notification
  const handleDismissNotification = async (notifId: number) => {
    await api.markNotificationRead(notifId);
    setMemberNotifications(prev => prev.filter(n => n.id !== notifId));
  };

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
          <Link to="/dashboard" className="nav-item active">Homepage</Link>
          <Link to="/studygroups" className="nav-item">Find Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Study Group</Link>
          <Link to="/helpforum" className="nav-item">Help Forum</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Support</Link>
        </nav>
        <SidebarUserCard />
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* NOTIFICATION BELL */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
          <button 
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            aria-label={`Notifications${(pendingRequests.length + memberNotifications.filter(n => n.type === 'forum_answer').length) > 0 ? `, ${pendingRequests.length + memberNotifications.filter(n => n.type === 'forum_answer').length} notifications` : ''}`}
            aria-expanded={showNotificationDropdown}
            aria-haspopup="true"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: (pendingRequests.length + memberNotifications.filter(n => n.type === 'forum_answer').length) > 0 ? '#FEF3C7' : '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none'
            }}
          >
            <span style={{ fontSize: '20px' }}>🔔</span>
            {(pendingRequests.length + memberNotifications.filter(n => n.type === 'forum_answer').length) > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {pendingRequests.length + memberNotifications.filter(n => n.type === 'forum_answer').length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotificationDropdown && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '320px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '16px',
              maxHeight: '450px',
              overflowY: 'auto'
            }}>
              {/* Forum Answers Section */}
              {memberNotifications.filter(n => n.type === 'forum_answer').length > 0 && (
                <>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💬 Forum Replies
                  </h4>
                  {memberNotifications.filter(n => n.type === 'forum_answer').map((notif) => (
                    <div key={notif.id} style={{
                      padding: '12px',
                      background: '#EFF6FF',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      borderLeft: '3px solid #3B82F6'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1F2937' }}>
                        {notif.message}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to="/helpforum"
                          onClick={async () => {
                            await api.markNotificationRead(notif.id);
                            setMemberNotifications(prev => prev.filter(n => n.id !== notif.id));
                            setShowNotificationDropdown(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            textAlign: 'center',
                            textDecoration: 'none',
                            fontSize: '13px'
                          }}
                        >
                          View Question
                        </Link>
                        <button
                          onClick={async () => {
                            await api.markNotificationRead(notif.id);
                            setMemberNotifications(prev => prev.filter(n => n.id !== notif.id));
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#E5E7EB',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '13px'
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length > 0 && (
                    <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '16px 0' }} />
                  )}
                </>
              )}

              {/* Join Requests Section */}
              <h4 style={{ margin: '0 0 12px 0', color: '#1F2937' }}>Join Requests</h4>
              {pendingRequests.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>No pending requests</p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} style={{
                    padding: '12px',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1F2937' }}>
                      {req.user?.name || 'Unknown User'}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6B7280' }}>
                      wants to join <strong>{req.group?.subject || 'your group'}</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          await api.updateRequest(req.id, 'approved');
                          setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          await api.updateRequest(req.id, 'rejected');
                          setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
            {createdGroups.length === 0 && myGroups.length === 0 ? (
              <div className="study-group-card-empty">No groups joined yet</div>
            ) : (
              <>
                {/* CREATED GROUPS - Show first with special styling */}
                {createdGroups.map((g) => (
                  <div 
                    key={g.id} 
                    className="study-group-card-detailed" 
                    onClick={() => handleEditGroup(g)}
                    style={{
                      border: '2px solid #8B5CF6',
                      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        background: '#8B5CF6',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        👑 Owner
                      </span>
                      <span style={{
                        background: '#3B82F6',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}>
                        ✏️ Edit
                      </span>
                    </div>
                    <div className="card-header">
                      <div className="card-left">
                        <div className="group-icon-small" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>{g.subject?.charAt(0).toUpperCase() || "G"}</div>
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
                ))}

                {/* JOINED GROUPS - Filter out created ones */}
                {myGroups
                  .filter(g => !createdGroups.some(cg => cg.id === g.id))
                  .map((g) => (
                  <div key={g.id} className="study-group-card-detailed" 
                    onClick={() => handleViewGroup(g)}
                    style={{
                      border: '1px solid #E5E7EB',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.01)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#10B981',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      ✓ Member
                    </div>
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
                ))}
              </>
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
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      📅 {g.date || 'No date'} • 🕐 {g.startTime ? new Date(g.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </div>
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

      {/* EDIT GROUP MODAL */}
      {editingGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#1F2937' }}>Edit Group</h2>
              <button 
                onClick={() => { setEditingGroup(null); setChatMessages([]); setChatInput(''); }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Subject/Title</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Short Description</label>
                <input
                  type="text"
                  value={editForm.smallDesc}
                  onChange={(e) => setEditForm({ ...editForm, smallDesc: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Capacity</label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Start Time</label>
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>End Time</label>
                  <input
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Type of Study</label>
                  <select
                    value={editForm.typeOfStudy}
                    onChange={(e) => setEditForm({ ...editForm, typeOfStudy: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  >
                    <option value="">Select type of study</option>
                    <option value="exam-revision">Exam revision</option>
                    <option value="assignment">Assignment</option>
                    <option value="lecture-revision">Lecture revision</option>
                    <option value="lab-revision">Lab revision</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#374151' }}>Language</label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* GROUP MEMBERS SECTION */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
                  Group Members ({groupMembers.length})
                </h3>
                {groupMembers.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>No members yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {groupMembers.map((member) => (
                      <div key={member.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        background: member.role === 'admin' ? '#F5F3FF' : '#F9FAFB',
                        borderRadius: '8px',
                        border: member.role === 'admin' ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleViewMemberProfile(member.id)}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: member.role === 'admin' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : '#3B82F6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500, color: '#1F2937' }}>
                            {member.name || 'Unknown'}
                            {member.role === 'admin' && (
                              <span style={{
                                marginLeft: '8px',
                                background: '#8B5CF6',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '10px',
                                fontWeight: 600
                              }}>
                                Owner
                              </span>
                            )}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                            {member.course || 'No course'} • {member.year || 'No year'}
                          </p>
                        </div>
                        {/* Kick button - only show for non-admin members */}
                        {member.role !== 'admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleKickMember(member.id, member.name); }}
                            style={{
                              background: '#FEE2E2',
                              color: '#DC2626',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GROUP CHAT SECTION */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
                  💬 Group Chat
                </h3>
                <div style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {/* Messages area */}
                  <div style={{
                    height: '250px',
                    overflowY: 'auto',
                    padding: '12px',
                    background: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {chatLoading ? (
                      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Loading messages...</p>
                    ) : chatMessages.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', marginTop: '40px' }}>No messages yet. Start the conversation!</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.userId === currentUserId ? 'flex-end' : 'flex-start'
                        }}>
                          <span style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>
                            {msg.user?.name || 'Unknown'}
                          </span>
                          <div style={{
                            background: msg.userId === currentUserId ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : '#E5E7EB',
                            color: msg.userId === currentUserId ? 'white' : '#1F2937',
                            padding: '8px 14px',
                            borderRadius: '16px',
                            maxWidth: '75%',
                            fontSize: '14px',
                            wordBreak: 'break-word'
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>
                            {new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Message input */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '10px 12px',
                    borderTop: '1px solid #E5E7EB',
                    background: 'white'
                  }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(editingGroup.id); }}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: '1px solid #D1D5DB',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => handleSendMessage(editingGroup.id)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => { setEditingGroup(null); setChatMessages([]); setChatInput(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: 'white',
                    color: '#374151',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGroup}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW GROUP MODAL (for joined groups - read-only) */}
      {viewingGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#1F2937' }}>Group Details</h2>
              <button 
                onClick={() => { setViewingGroup(null); setChatMessages([]); setChatInput(''); }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}
              >
                ×
              </button>
            </div>

            {/* Group Info - Read Only */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '22px'
              }}>
                {viewingGroup.subject?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#1F2937', fontSize: '20px' }}>{viewingGroup.subject}</h3>
                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>
                  {viewingGroup._count?.userGroups || 0}/{viewingGroup.capacity || 0} members
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#4B5563', fontSize: '14px' }}>{viewingGroup.smallDesc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>Date</span>
                  <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>📅 {viewingGroup.date || 'N/A'}</span>
                </div>
                <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>Time</span>
                  <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>⏰ {viewingGroup.startTime ? new Date(viewingGroup.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                </div>
                <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>Location</span>
                  <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>📍 {viewingGroup.location || 'N/A'}</span>
                </div>
                <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block' }}>Language</span>
                  <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>🌐 {viewingGroup.language || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* GROUP MEMBERS - Clickable for profile */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
                Group Members ({viewGroupMembers.length})
              </h3>
              {viewGroupMembers.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: '14px' }}>No members</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {viewGroupMembers.map((member) => (
                    <div key={member.id} 
                      onClick={() => handleViewMemberProfile(member.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        background: member.role === 'admin' ? '#F5F3FF' : '#F9FAFB',
                        borderRadius: '8px',
                        border: member.role === 'admin' ? '1px solid #8B5CF6' : '1px solid #E5E7EB',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = member.role === 'admin' ? '#EDE9FE' : '#F3F4F6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = member.role === 'admin' ? '#F5F3FF' : '#F9FAFB'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: member.role === 'admin' ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : '#3B82F6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, color: '#1F2937' }}>
                          {member.name || 'Unknown'}
                          {member.role === 'admin' && (
                            <span style={{
                              marginLeft: '8px',
                              background: '#8B5CF6',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: 600
                            }}>
                              Owner
                            </span>
                          )}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7280' }}>
                          {member.course || 'No course'} • {member.year || 'No year'}
                        </p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>View Profile →</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GROUP CHAT SECTION */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '16px' }}>
                💬 Group Chat
              </h3>
              <div style={{
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Messages area */}
                <div style={{
                  height: '250px',
                  overflowY: 'auto',
                  padding: '12px',
                  background: '#FAFAFA',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {chatLoading ? (
                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Loading messages...</p>
                  ) : chatMessages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', marginTop: '40px' }}>No messages yet. Start the conversation!</p>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.userId === currentUserId ? 'flex-end' : 'flex-start'
                      }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>
                          {msg.user?.name || 'Unknown'}
                        </span>
                        <div style={{
                          background: msg.userId === currentUserId ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : '#E5E7EB',
                          color: msg.userId === currentUserId ? 'white' : '#1F2937',
                          padding: '8px 14px',
                          borderRadius: '16px',
                          maxWidth: '75%',
                          fontSize: '14px',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>
                          {new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {/* Message input */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  padding: '10px 12px',
                  borderTop: '1px solid #E5E7EB',
                  background: 'white'
                }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(viewingGroup.id); }}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '20px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage(viewingGroup.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '20px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => { setViewingGroup(null); setChatMessages([]); setChatInput(''); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && selectedProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}
        onClick={() => setShowProfileModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '420px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#1F2937' }}>User Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}
              >
                ×
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '32px',
                margin: '0 auto 12px'
              }}>
                {selectedProfile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 style={{ margin: '0 0 4px', color: '#1F2937', fontSize: '20px' }}>{selectedProfile.name || 'Unknown'}</h3>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>{selectedProfile.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Year</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>{selectedProfile.year || 'N/A'}</span>
              </div>
              <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Course</span>
                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>{selectedProfile.course || 'N/A'}</span>
              </div>
              {selectedProfile.institution && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Institution</span>
                  <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>{selectedProfile.institution}</span>
                </div>
              )}
              {selectedProfile.aboutMe && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>About</span>
                  <span style={{ fontSize: '14px', color: '#1F2937' }}>{selectedProfile.aboutMe}</span>
                </div>
              )}
              {selectedProfile.hobby && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Hobby</span>
                  <span style={{ fontSize: '14px', color: '#1F2937' }}>{selectedProfile.hobby}</span>
                </div>
              )}
              {selectedProfile.language && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Language</span>
                  <span style={{ fontSize: '14px', color: '#1F2937' }}>{selectedProfile.language}</span>
                </div>
              )}
              {selectedProfile.nationality && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Nationality</span>
                  <span style={{ fontSize: '14px', color: '#1F2937' }}>{selectedProfile.nationality}</span>
                </div>
              )}
              {selectedProfile.funFact && (
                <div style={{ background: '#F9FAFB', padding: '12px 16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '2px' }}>Fun Fact</span>
                  <span style={{ fontSize: '14px', color: '#1F2937' }}>{selectedProfile.funFact}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEMBER NOTIFICATIONS - Group Update Alerts */}
      {memberNotifications.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {memberNotifications.map((notif) => (
            <div key={notif.id} style={{
              background: '#EFF6FF',
              border: '1px solid #3B82F6',
              borderRadius: '12px',
              padding: '16px',
              maxWidth: '350px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}></span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, color: '#1E40AF', fontWeight: 500 }}>{notif.message}</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDismissNotification(notif.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
