// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import CreateGroup from "./CreateGroup";
import Register from "./Register";
import StudyGroups from "./StudyGroups";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/studygroups" element={<StudyGroups />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/creategroup" element={<CreateGroup />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

