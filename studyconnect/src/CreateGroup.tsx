import "./creategroup.css";

export default function CreateGroup() {
  return (
    <div className="create-layout">

      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <a className="nav-item">Dashboard</a>
          <a className="nav-item">Study Groups</a>
          <a className="nav-item active">Create Group</a>
          <a className="nav-item">Profile</a>
        </nav>

        <div className="user-card">
          <div className="avatar"></div>
          <div>
            <strong>Tony</strong>
            <p>Computer Science</p>
          </div>
        </div>
      </aside>

      {/* MAIN CREATE GROUP CONTENT */}
      <main className="main-content">

        <div className="header">
          <h1>Create Study Group</h1>
        </div>

        <div className="form-container">

          <form className="form-section">

            {/* SUBJECT */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Subject <span className="required">*</span></label>
              <input type="text" />
            </div>

            {/* SMALL DESCRIPTION */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Small Description <span className="required">*</span></label>
              <input type="text" />
            </div>

            {/* FULL DESCRIPTION */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Description <span className="required">*</span></label>
              <textarea rows={3}></textarea>
            </div>

            {/* START TIME */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Start Time <span className="required">*</span></label>
              <input type="time" />
            </div>

            {/* END TIME */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>End Time <span className="required">*</span></label>
              <input type="time" />
            </div>

            {/* MEMBER COUNT */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>How many members <span className="required">*</span></label>
              <input type="number" />
            </div>

            {/* TYPE OF STUDY */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Type of study <span className="required">*</span></label>
              <input type="text" />
            </div>

            {/* LANGUAGE */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Language <span className="required">*</span></label>
              <input type="text" />
            </div>

            {/* LOCATION */}
            <div className="form-row">
              <div className="icon-box">🧪</div>
              <label>Location <span className="required">*</span></label>
              <input type="text" />
            </div>

          </form>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="right-sidebar">

        <div className="panel">
          <h3>Upcoming Events</h3>
          <p>No events scheduled</p>
        </div>

        <div className="panel">
          <h3>Suggested Study Groups</h3>
          <p>No suggestions yet</p>
        </div>

      </aside>
    </div>
  );
}
