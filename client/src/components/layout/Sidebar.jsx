import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  User,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode from DOM or localStorage
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("themeUpdated"));
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Habits", path: "/habits", icon: CheckSquare },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
    {/* Backdrop — mobile drawer only */}
    <div
      onClick={onClose}
      aria-hidden="true"
      className={`md:hidden fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    />
    <aside
      className={`fixed md:relative inset-y-0 left-0 z-40 w-64 max-w-[80vw] flex-shrink-0 p-5 flex flex-col justify-between select-none overflow-y-auto transition-all duration-200 ease-out ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:-ml-64"
      }`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div>
        {/* Top Branding */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div
            className="w-8 h-8 flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <img src="/flame-logo.png" alt="Grind Set" className="w-8 h-8" />
          </div>
          <span
            className="font-semibold tracking-tight block"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)' }}
          >
            Grind Set
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--color-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-navy)' : 'var(--color-muted)',
                  borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  transition: 'color 150ms ease-out, background-color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-subtle)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-muted)';
                  }
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                    strokeWidth: 1.5,
                  }}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Theme Toggle Switch */}
      <div
        className="pt-4 px-2 flex items-center justify-between"
        style={{
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-muted)',
        }}
      >
        <span className="font-medium">Theme</span>
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle dark/light mode"
          className="flex items-center gap-1.5 px-2.5 py-1.5 font-medium"
          style={{
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: 'var(--text-caption)',
          }}
        >
          {isDark ? (
            <>
              <Moon className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span>Light</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
