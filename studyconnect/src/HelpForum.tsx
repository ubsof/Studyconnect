import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./helpforum.css";
import api from "./services/api";
import SidebarUserCard from "./components/SidebarUserCard";

interface Question {
  id: number;
  title: string;
  description: string;
  subject: string | null;
  imageUrl: string | null;
  userId: number;
  user: { id: number; name: string | null; email: string };
  answers: { id: number }[];
  createdAt: string;
}

interface Answer {
  id: number;
  content: string;
  userId: number;
  user: { id: number; name: string | null; email: string };
  createdAt: string;
}

interface QuestionDetail extends Omit<Question, 'answers'> {
  answers: Answer[];
}

export default function HelpForum() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDetail | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Create question form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Answer form
  const [newAnswer, setNewAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const user = await api.me();
      if (user?.id) setCurrentUserId(user.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const data = await api.getAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadQuestions();
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchQuestions(searchQuery);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function openQuestion(questionId: number) {
    try {
      const data = await api.getQuestion(questionId);
      setSelectedQuestion(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      alert("Please fill in title and description");
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newTitle);
      formData.append('description', newDescription);
      if (newSubject) formData.append('subject', newSubject);
      if (newImage) formData.append('image', newImage);

      await api.createQuestion(formData);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewSubject("");
      setNewImage(null);
      setImagePreview(null);
      loadQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to create question");
    } finally {
      setCreating(false);
    }
  }

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuestion || !newAnswer.trim()) return;

    setSubmittingAnswer(true);
    try {
      await api.addAnswer(selectedQuestion.id, newAnswer);
      setNewAnswer("");
      // Refresh the question to show new answer
      openQuestion(selectedQuestion.id);
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    } finally {
      setSubmittingAnswer(false);
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.deleteQuestion(questionId);
      setSelectedQuestion(null);
      loadQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete question");
    }
  }

  async function handleDeleteAnswer(answerId: number) {
    if (!confirm("Are you sure you want to delete this answer?")) return;
    try {
      await api.deleteAnswer(answerId);
      if (selectedQuestion) openQuestion(selectedQuestion.id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete answer");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="forum-layout">
      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar">
        <h2 className="brand">StudyConnect</h2>
        <nav className="nav">
          <Link to="/dashboard" className="nav-item">Homepage</Link>
          <Link to="/studygroups" className="nav-item">Study Groups</Link>
          <Link to="/creategroup" className="nav-item">Create Group</Link>
          <Link to="/helpforum" className="nav-item active">Help Forum</Link>
          <Link to="/profile" className="nav-item">Profile</Link>
          <Link to="/calendar" className="nav-item">Scholar Calendar</Link>
          <Link to="/support" className="nav-item">Wellbeing Support</Link>
        </nav>
        <SidebarUserCard />
      </aside>

      {/* MAIN CONTENT */}
      <main className="forum-content">
        <div className="forum-header">
          <div>
            <h1>Help Forum</h1>
            <p>Ask questions and help others with their studies</p>
          </div>
          <button className="ask-button" onClick={() => setShowCreateModal(true)}>
            ✏️ Ask a Question
          </button>
        </div>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>

        {/* QUESTIONS LIST */}
        {loading ? (
          <div className="loading">Loading questions...</div>
        ) : (
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <p>No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="question-card" onClick={() => openQuestion(q.id)}>
                  <div className="question-header">
                    <div className="question-avatar">
                      {q.user.name?.charAt(0).toUpperCase() || q.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="question-meta">
                      <span className="question-author">{q.user.name || q.user.email}</span>
                      <span className="question-date">{formatDate(q.createdAt)}</span>
                    </div>
                    {q.subject && <span className="question-subject">{q.subject}</span>}
                  </div>
                  <h3 className="question-title">{q.title}</h3>
                  <p className="question-preview">{q.description.substring(0, 150)}{q.description.length > 150 ? '...' : ''}</p>
                  {q.imageUrl && <span className="has-image">📷 Has image</span>}
                  <div className="question-footer">
                    <span className="answer-count">💬 {q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* QUESTION DETAIL MODAL */}
      {selectedQuestion && (
        <div className="modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="modal-content question-detail" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedQuestion(null)}>×</button>
            
            <div className="question-full">
              <div className="question-header">
                <div className="question-avatar large">
                  {selectedQuestion.user.name?.charAt(0).toUpperCase() || selectedQuestion.user.email.charAt(0).toUpperCase()}
                </div>
                <div className="question-meta">
                  <span className="question-author">{selectedQuestion.user.name || selectedQuestion.user.email}</span>
                  <span className="question-date">{formatDate(selectedQuestion.createdAt)}</span>
                </div>
                {selectedQuestion.subject && <span className="question-subject">{selectedQuestion.subject}</span>}
                {currentUserId === selectedQuestion.userId && (
                  <button className="delete-btn" onClick={() => handleDeleteQuestion(selectedQuestion.id)}>🗑️ Delete</button>
                )}
              </div>

              <h2>{selectedQuestion.title}</h2>
              <p className="question-description">{selectedQuestion.description}</p>

              {selectedQuestion.imageUrl && (
                <div className="question-image">
                  <img src={api.getImageUrl(selectedQuestion.imageUrl)} alt="Question attachment" />
                </div>
              )}
            </div>

            <div className="answers-section">
              <h3>Answers ({selectedQuestion.answers.length})</h3>
              
              {selectedQuestion.answers.length === 0 ? (
                <p className="no-answers">No answers yet. Be the first to help!</p>
              ) : (
                <div className="answers-list">
                  {selectedQuestion.answers.map((a) => (
                    <div key={a.id} className="answer-card">
                      <div className="answer-header">
                        <div className="answer-avatar">
                          {a.user.name?.charAt(0).toUpperCase() || a.user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="answer-meta">
                          <span className="answer-author">{a.user.name || a.user.email}</span>
                          <span className="answer-date">{formatDate(a.createdAt)}</span>
                        </div>
                        {currentUserId === a.userId && (
                          <button className="delete-btn small" onClick={() => handleDeleteAnswer(a.id)}>🗑️</button>
                        )}
                      </div>
                      <p className="answer-content">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ANSWER FORM */}
              <form onSubmit={handleSubmitAnswer} className="answer-form">
                <textarea
                  placeholder="Write your answer..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                />
                <button type="submit" disabled={submittingAnswer || !newAnswer.trim()}>
                  {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE QUESTION MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-question" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            <h2>Ask a Question</h2>
            
            <form onSubmit={handleCreateQuestion}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="What's your question?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Physics, Computer Science"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe your question in detail..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label>Attach Image (optional)</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="upload-label">
                    📷 {newImage ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" onClick={() => { setNewImage(null); setImagePreview(null); }}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={creating}>
                  {creating ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
