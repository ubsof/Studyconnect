import { useEffect, useState } from "react";
import api from "../services/api";

export default function SidebarUserCard() {
  const [user, setUser] = useState<{ name?: string; course?: string } | null>(null);

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
    <div className="user-card">
      <div className="avatar" aria-label={name}>{initial}</div>
      <div className="user-info">
        <strong>{name}</strong>
        {course && <p>{course}</p>}
      </div>
    </div>
  );
}
