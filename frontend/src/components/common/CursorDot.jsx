import { useEffect, useState } from "react";
import { usePreferences } from "../../context/PreferencesContext";

function CursorDot() {
  const { prefs } = usePreferences();
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    if (prefs.cursorStyle !== "none") return;
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [prefs.cursorStyle]);

  if (prefs.cursorStyle !== "none") return null;

  return (
    <div
      className="fixed w-3 h-3 rounded-full pointer-events-none z-[9999] transition-transform duration-75"
      style={{
        left: pos.x - 6,
        top: pos.y - 6,
        background: "var(--accent)",
      }}
    />
  );
}

export default CursorDot;