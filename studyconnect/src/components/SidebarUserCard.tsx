import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { SettingsButton, SettingsPanel } from "./AccessibilitySettings";

export default function SidebarUserCard() {
  const [user, setUser] = useState<{ name?: string; course?: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        if (me && me.id) setUser(me);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const name = user?.name || "User";
  const course = user?.course || "";
  const initial = (name?.trim()?.charAt(0) || "U").toUpperCase();

  return (
    <>
      <div 
        className="user-card" 
        onClick={() => navigate("/profile")}
        style={{ cursor: "pointer" }}
        role="button"
        tabIndex={0}
        aria-label={`View profile for ${name}`}
        onKeyDown={(e) => e.key === 'Enter' && navigate("/profile")}
      >
        <div className="avatar" aria-hidden="true">{initial}</div>
        <div className="user-info">
          <strong>{name}</strong>
          {course && <p>{course}</p>}
        </div>
      </div>
      
      <SettingsButton onClick={() => setShowSettings(true)} />
      
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}
