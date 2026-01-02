import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./managegroup.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

export default function ManageGroup() {
  const { groupId } = useParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [groupId]);

  async function loadRequests() {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGroupRequests(Number(groupId));
      if (Array.isArray(data)) {
        setRequests(data);
      } else if (data && data.error) {
        setRequests([]);
        setError(String(data.error));
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error(err);
      setRequests([]);
      setError("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: number) {
    try {
      await api.updateRequest(requestId, "approved");
      alert("Request approved!");
      loadRequests();
    } catch (err) {
      alert("Failed to approve request");
    }
  }

  async function handleReject(requestId: number) {
    try {
      await api.updateRequest(requestId, "rejected");
      alert("Request rejected");
      loadRequests();
    } catch (err) {
      alert("Failed to reject request");
    }
  }

  function handleViewProfile(userId: number, userName: string, userEmail: string, userYear: string, userCourse: string) {
    const savedProfile = localStorage.getItem(`profile_${userId}`);
    let profileData = { aboutMe: "", hobby: "", language: "", nationality: "", funFact: "" };
    
    if (savedProfile) {
      try {
        profileData = JSON.parse(savedProfile);
      } catch (e) {
        console.error("Failed to parse profile data");
      }
    }
    
    setSelectedProfile({
      name: userName,
      email: userEmail,
      year: userYear,
      course: userCourse,
      ...profileData
    });
    setShowProfileModal(true);
  }

  return (
    <div className="manage-layout">
      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Support</Link>
        </nav>

        <SidebarUserCard />
      </aside>

      {/* MAIN CONTENT */}
      <main className="manage-content">
        <div className="header">
          <h1>Manage Group Requests</h1>
          <p>Review and approve join requests for your study group</p>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {!loading && error && (
          <div className="empty">{error}</div>
        )}
        {!loading && !error && (
          <div className="requests-container">
            {requests.length === 0 ? (
              <p className="empty">No pending requests</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="request-card">
                  <div className="request-avatar">
                    {(req.user?.name?.charAt(0).toUpperCase()) || "U"}
                  </div>
                  <div className="request-info">
                    <h3>{req.user?.name || "Unknown"}</h3>
                    <p className="request-email">{req.user?.email || "-"}</p>
                    <p className="request-details">
                      <strong>Year:</strong> {req.user?.year || "N/A"} | <strong>Course:</strong> {req.user?.course || "N/A"}
                    </p>
                    <p className="request-time">Requested: {req.joinedAt ? new Date(req.joinedAt).toLocaleString() : "-"}</p>
                  </div>
                  <div className="request-actions">
                    <button onClick={() => handleViewProfile(req.user?.id, req.user?.name, req.user?.email, req.user?.year, req.user?.course)} className="view-profile-button">
                      View Profile
                    </button>
                    <button onClick={() => handleApprove(req.id)} className="approve-button">
                      Approve
                    </button>
                    <button onClick={() => handleReject(req.id)} className="reject-button">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE MODAL */}
        {showProfileModal && selectedProfile && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>User Profile</h2>
                <button className="modal-close" onClick={() => setShowProfileModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="profile-modal-avatar">
                  {selectedProfile.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h3 className="profile-modal-name">{selectedProfile.name}</h3>
                <div className="profile-modal-field">
                  <strong>Email:</strong> {selectedProfile.email}
                </div>
                <div className="profile-modal-field">
                  <strong>Year:</strong> {selectedProfile.year || "N/A"}
                </div>
                <div className="profile-modal-field">
                  <strong>Course:</strong> {selectedProfile.course || "N/A"}
                </div>
                {selectedProfile.aboutMe && (
                  <div className="profile-modal-field">
                    <strong>About:</strong>
                    <p className="profile-modal-text">{selectedProfile.aboutMe}</p>
                  </div>
                )}
                {selectedProfile.hobby && (
                  <div className="profile-modal-field">
                    <strong>Hobby:</strong> {selectedProfile.hobby}
                  </div>
                )}
                {selectedProfile.language && (
                  <div className="profile-modal-field">
                    <strong>Language:</strong> {selectedProfile.language}
                  </div>
                )}
                {selectedProfile.nationality && (
                  <div className="profile-modal-field">
                    <strong>Nationality:</strong> {selectedProfile.nationality}
                  </div>
                )}
                {selectedProfile.funFact && (
                  <div className="profile-modal-field">
                    <strong>Fun Fact:</strong> {selectedProfile.funFact}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
