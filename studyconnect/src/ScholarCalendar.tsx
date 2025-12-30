import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./scholarcalendar.css";
import SidebarUserCard from "./components/SidebarUserCard";

interface DayNote {
  [date: string]: string;
}

export default function ScholarCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<DayNote>({});
  const [editText, setEditText] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("scholarCalendarNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: DayNote) => {
    setNotes(updatedNotes);
    localStorage.setItem("scholarCalendarNotes", JSON.stringify(updatedNotes));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    setSelectedDate(dateKey);
    setEditText(notes[dateKey] || "");
    setShowModal(true);
  };

  const handleSaveNote = () => {
    if (selectedDate) {
      const updatedNotes = { ...notes };
      if (editText.trim()) {
        updatedNotes[selectedDate] = editText;
      } else {
        delete updatedNotes[selectedDate];
      }
      saveNotes(updatedNotes);
    }
    setShowModal(false);
    setSelectedDate(null);
    setEditText("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setEditText("");
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
      const hasNote = notes[dateKey];
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? "today" : ""} ${hasNote ? "has-note" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {hasNote && <div className="note-indicator">📝</div>}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return "";
    const parts = selectedDate.split("-");
    const month = monthNames[parseInt(parts[1]) - 1];
    return `${month} ${parts[2]}, ${parts[0]}`;
  };

  return (
    <div className="calendar-layout">
      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>

        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item active">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Support</Link>
        </nav>

        <SidebarUserCard />
      </aside>

      {/* MAIN CONTENT */}
      <main className="calendar-content">
        <div className="header">
          <h1>Scholar Calendar</h1>
          <p>Plan your study schedule and track important dates</p>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="nav-button">←</button>
            <h2 className="month-year">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="nav-button">→</button>
          </div>

          <div className="calendar-grid">
            <div className="weekday-header">Sun</div>
            <div className="weekday-header">Mon</div>
            <div className="weekday-header">Tue</div>
            <div className="weekday-header">Wed</div>
            <div className="weekday-header">Thu</div>
            <div className="weekday-header">Fri</div>
            <div className="weekday-header">Sat</div>
            {renderCalendar()}
          </div>
        </div>
      </main>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getSelectedDateDisplay()}</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <textarea
                className="note-textarea"
                placeholder="Add notes, reminders, or tasks for this day..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCloseModal}>Cancel</button>
              <button className="save-button" onClick={handleSaveNote}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
