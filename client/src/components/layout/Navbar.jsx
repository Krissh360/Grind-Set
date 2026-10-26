import { useEffect, useState } from "react";

export default function Navbar() {
  const [userName, setUserName] = useState("User");

  const formatFirstName = (rawName) => {
    if (!rawName) return "User";
    const cleaned = rawName.split(" ")[0].replace(/[0-9_.-]+$/g, "");
    if (!cleaned) return rawName.split(" ")[0];
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.username || parsed.name) setUserName(formatFirstName(parsed.username || parsed.name));
      }
    } catch (e) {
      // fallback
    }

    const handleUserUpdated = () => {
      const updated = JSON.parse(localStorage.getItem("user") || "{}");
      setUserName(formatFirstName(updated.username || updated.name));
    };
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, []);

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header
      className="h-16 px-8 flex items-center justify-between select-none"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Date — plain muted text, no chip */}
      <span
        className="hidden sm:block font-medium"
        style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}
      >
        {todayFormatted}
      </span>

      {/* Spacer for mobile when date is hidden */}
      <span className="sm:hidden" />

      {/* Profile pill */}
      <div
        className="flex items-center gap-2.5 px-3 py-1.5 font-semibold"
        style={{
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: 'var(--text-caption)',
        }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center font-semibold"
          style={{
            backgroundColor: 'var(--color-navy)',
            color: 'var(--color-surface)',
            fontSize: '10px',
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <span>{userName}</span>
      </div>
    </header>
  );
}
