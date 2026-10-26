import { useEffect, useState } from "react";
import { getHabits } from "../services/api";
import { AlertCircle, Quote } from "lucide-react";

export default function Profile() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // fallback
    }

    async function fetchData() {
      try {
        setError(null);
        const data = await getHabits();
        setHabits(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton" style={{ width: 140, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 240, height: 16 }} />
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="flex items-center gap-4">
            <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)' }} />
            <div>
              <div className="skeleton" style={{ width: 160, height: 20, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 200, height: 14 }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="skeleton" style={{ width: 180, height: 16, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: '85%', height: 16 }} />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 400 }}>
        <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
        <p className="font-medium" style={{ fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 font-medium"
          style={{
            backgroundColor: 'var(--color-navy)',
            color: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-body)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Derived
  const totalHabits = habits.length;

  const bestHabit = habits.reduce((max, h) =>
    (h.currentStreak || 0) > (max.currentStreak || 0) ? h : max,
    {}
  );

  const mostCompleted = habits.reduce((max, h) =>
    (h.totalCompleted || 0) > (max.totalCompleted || 0) ? h : max,
    {}
  );

  const allStreaksZero = habits.length === 0 || habits.every(h => (h.currentStreak || 0) === 0);

  const displayName = user?.username || user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 24,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="font-semibold"
          style={{
            fontSize: 'var(--text-page-title)',
            lineHeight: 'var(--lh-title)',
            color: 'var(--color-text)',
          }}
        >
          Profile
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', marginTop: 4 }}>
          Your habit summary and account info.
        </p>
      </div>

      {/* User overview */}
      <div style={cardStyle} className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="flex items-center justify-center font-semibold flex-shrink-0"
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            fontSize: 'var(--text-page-title)',
          }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="font-semibold truncate"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)' }}
          >
            {displayName}
          </h2>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 2 }}>
            {user?.email || "No email set"}
          </p>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 6 }}>
            Building positive daily momentum through consistent small wins.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div style={cardStyle}>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Total habits
          </span>
          <p className="tabular-nums font-semibold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}>
            {totalHabits}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            Habits created
          </span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Best streak habit
          </span>
          <p
            className="font-semibold truncate capitalize"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}
            title={bestHabit.title || undefined}
          >
            {allStreaksZero ? "\u2014" : (bestHabit.title || "\u2014")}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            {allStreaksZero ? "Not enough data yet" : `${bestHabit.currentStreak || 0} day streak`}
          </span>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Most practiced
          </span>
          <p
            className="font-semibold truncate capitalize"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}
            title={mostCompleted.title || undefined}
          >
            {(mostCompleted.totalCompleted || 0) === 0 ? "\u2014" : (mostCompleted.title || "\u2014")}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            {(mostCompleted.totalCompleted || 0) === 0 ? "Not enough data yet" : `${mostCompleted.totalCompleted} completions`}
          </span>
        </div>
      </div>

      {/* Philosophy of calm consistency quote card */}
      <div
        style={{
          ...cardStyle,
          borderLeft: '3px solid var(--color-accent)',
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <Quote className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          <h2
            className="font-medium"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)' }}
          >
            Philosophy of calm consistency
          </h2>
        </div>
        <p
          className="italic"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-text)',
            lineHeight: 'var(--lh-body)',
            maxWidth: '640px',
          }}
        >
          “Small habits build monumental results. Focus on executing today's tasks without worrying about tomorrow, and let compounding momentum do the rest.”
        </p>
      </div>
    </div>
  );
}
