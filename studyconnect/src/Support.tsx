import { Link } from "react-router-dom";
import "./support.css";
import SidebarUserCard from "./components/SidebarUserCard";

export default function Support() {
  return (
    <div className="support-layout">
      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/support" className="nav-item active">Support</Link>
        </nav>

        <SidebarUserCard />
      </aside>

      {/* MAIN CONTENT */}
      <main className="support-content">
        <div className="header">
          <h1>Support</h1>
          <p>Access helpful resources for your academic journey</p>
        </div>

        <div className="support-cards">
          <a 
            href="https://www.gla.ac.uk/myglasgow/students/wellbeing/academicsupport/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="support-card"
          >
            <div className="support-icon">📚</div>
            <h3>Academic Support</h3>
            <p>Get help with your studies, find tutoring, and access academic resources</p>
            <span className="external-link">Visit Resource →</span>
          </a>

          <a 
            href="https://www.gla.ac.uk/myglasgow/students/learning/study/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="support-card"
          >
            <div className="support-icon">✏️</div>
            <h3>Learning & Study</h3>
            <p>Discover study tips, learning strategies, and skills development resources</p>
            <span className="external-link">Visit Resource →</span>
          </a>
        </div>
      </main>
    </div>
  );
}
