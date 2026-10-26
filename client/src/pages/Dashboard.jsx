import { useEffect, useState } from "react";
import {
  getHabits,
  addHabit,
  completeHabit,
} from "../services/api";
import {
  Check,
  Plus,
  Flame,
  MoreHorizontal,
  AlertCircle,
  Quote,
} from "lucide-react";

const motivationQuotes = [
  "Small steps still move you forward.",
  "Consistency turns intention into identity.",
  "Start where you are and make today count.",
  "Progress is built in the moments nobody sees.",
  "You do not need perfect conditions to make progress.",
  "A focused day is made one choice at a time.",
  "Keep the promise you made to your future self.",
  "Momentum begins with one completed action.",
  "Your habits are votes for the person you are becoming.",
  "Make it simple enough to repeat.",
  "The work gets lighter when the rhythm becomes yours.",
  "Do the next right thing, then do it again tomorrow.",
  "Discipline is self-respect in motion.",
  "A little progress is still progress worth keeping.",
  "Build a routine that makes your best days easier.",
  "You are closer than you think when you keep showing up.",
  "Let today's effort compound quietly.",
  "The habit grows every time you return to it.",
  "Progress does not need an audience.",
  "Choose the action that future you will thank you for.",
  "Your pace is valid. Your direction matters.",
  "Make room for progress, not perfection.",
  "Every repetition makes the path more familiar.",
  "The best time to reinforce a good habit is today.",
  "You can be patient and still be persistent.",
  "Tiny wins are how meaningful change gets built.",
  "Keep going; consistency is creating the result.",
  "One grounded choice can change the shape of your day.",
  "Your future routine starts with this moment.",
  "Show up gently, then give your effort room to grow.",
];

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toDateString();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setError(null);
      const data = await getHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load habits.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;

    try {
      await addHabit(newHabit);
      setNewHabit("");
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  // Derived data
  const totalHabits = habits.length;

  const completedToday = habits.filter(h =>
    h.completedDates?.includes(today)
  ).length;

  const remainingToday = totalHabits - completedToday;

  const completionPercent =
    totalHabits > 0
      ? Math.round((completedToday / totalHabits) * 100)
      : 0;

  // Current streak: max streak across all habits
  const currentStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.currentStreak || 0), 0)
    : 0;

  // Best streak: max of currentStreak values (API doesn't track bestStreak separately)
  const bestStreak = currentStreak;

  const [userName, setUserName] = useState("");

  const formatFirstName = (rawName) => {
    if (!rawName) return "";
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

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // 7-day activity strip — Monday-start, correct day calculation
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // getDay: 0=Sun, convert to Mon=0..Sun=6
  const currentDayIndex = (new Date().getDay() + 6) % 7;

  const dayOfMonth = new Date().getDate();

  const storedAccountCreatedAt = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").createdAt;
    } catch (error) {
      return null;
    }
  })();
  const accountCreatedAt = storedAccountCreatedAt || habits.find((habit) => habit.accountCreatedAt)?.accountCreatedAt;
  const accountCreatedDate = accountCreatedAt ? new Date(accountCreatedAt) : null;
  const completedDates = new Set(
    habits.flatMap((habit) => habit.completedDates || [])
  );
  const motivation = motivationQuotes[(dayOfMonth - 1) % motivationQuotes.length];

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton" style={{ width: 220, height: 28, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 160, height: 16 }} />
          </div>
          <div className="skeleton" style={{ width: 140, height: 16 }} />
        </div>
        {/* Progress bar skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 4 }} />
        {/* Daily motivation skeleton */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 140, height: 16 }} />
            <div className="skeleton" style={{ width: 70, height: 14 }} />
          </div>
          <div className="skeleton" style={{ width: '80%', height: 18, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 160, height: 14 }} />
        </div>
        {/* Habits card skeleton */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="skeleton" style={{ width: 120, height: 16, marginBottom: 16 }} />
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '60%', height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 400 }}>
        <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-error)' }} />
        <p className="font-medium" style={{ fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>{error}</p>
        <button
          onClick={() => { setLoading(true); fetchHabits(); }}
          className="px-4 py-2 font-medium"
          style={{
            backgroundColor: 'var(--color-navy)',
            color: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-body)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1
            className="font-semibold"
            style={{
              fontSize: 'var(--text-page-title)',
              lineHeight: 'var(--lh-title)',
              color: 'var(--color-text)',
            }}
          >
            {getGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
          {/* Muted subtitle with real fact */}
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', marginTop: 4 }}>
            {remainingToday === 0 && totalHabits > 0
              ? "All habits completed today."
              : totalHabits === 0
                ? "Start building your daily rhythm."
                : `${remainingToday} of ${totalHabits} habit${totalHabits > 1 ? 's' : ''} left today`}
          </p>
        </div>
        <span style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)' }}>
          {todayFormatted}
        </span>
      </div>

      {/* 2. Progress bar — thin 4px, no card */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)' }}>
            {completedToday} of {totalHabits} completed
          </span>
          {totalHabits > 0 && (
            <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}>
              {completionPercent}%
            </span>
          )}
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            backgroundColor: 'var(--color-border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPercent}%`,
              backgroundColor: 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 300ms ease-out',
            }}
          />
        </div>
      </div>

      {/* 3. Daily motivation card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
        }}
      >
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <h2
              className="font-medium"
              style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)' }}
            >
              Daily motivation
            </h2>
          </div>
          <span
            className="tabular-nums"
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--color-muted)',
            }}
          >
            Day {((dayOfMonth - 1) % motivationQuotes.length) + 1} of 30
          </span>
        </div>
        <p
          className="italic"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-text)',
            lineHeight: 'var(--lh-body)',
            fontWeight: 500,
          }}
        >
          “{motivation}”
        </p>
        <p
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--color-muted)',
            marginTop: 8,
          }}
        >
          Keep your rhythm moving forward.
        </p>
      </div>

      {/* 4. Today's habits — main surface, one card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
        }}
      >
        {/* Add habit input row */}
        <div className="flex gap-2" style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Add a new habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddHabit();
            }}
            style={{
              flex: 1,
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontSize: 'var(--text-body)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddHabit}
            className="flex items-center gap-1.5 font-medium"
            style={{
              backgroundColor: 'var(--color-navy)',
              color: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontSize: 'var(--text-body)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Habits list */}
        {habits.length === 0 ? (
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', padding: '32px 0', textAlign: 'center' }}>
            No habits yet. Add your first one above.
          </p>
        ) : (
          <ul>
            {habits.map((habit, index) => {
              const isDone = habit.completedDates?.includes(today);
              const streak = habit.currentStreak || 0;

              return (
                <li
                  key={habit._id}
                  className="flex items-center justify-between group"
                  style={{
                    padding: '12px 0',
                    borderTop: index > 0 ? '1px solid var(--color-border)' : 'none',
                    minHeight: 44,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                    {/* Check button */}
                    <button
                      type="button"
                      onClick={() => handleComplete(habit._id)}
                      disabled={isDone}
                      aria-label={isDone ? "Completed" : "Mark as complete"}
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: isDone ? 'var(--color-accent)' : 'transparent',
                        border: isDone ? 'none' : '2px solid var(--color-border)',
                        color: isDone ? 'white' : 'transparent',
                        cursor: isDone ? 'default' : 'pointer',
                        transition: 'background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
                        minHeight: 24,
                      }}
                      onMouseEnter={(e) => {
                        if (!isDone) {
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                          e.currentTarget.style.color = 'var(--color-accent)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDone) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.color = 'transparent';
                        }
                      }}
                    >
                      <Check className="w-3.5 h-3.5" style={{ strokeWidth: 3 }} />
                    </button>

                    <span
                      className="text-sm font-medium block truncate capitalize"
                      style={{
                        color: isDone ? 'var(--color-muted)' : 'var(--color-text)',
                        transition: 'color 150ms ease-out',
                      }}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Streak — only shown when > 0 */}
                    {streak > 0 && (
                      <span
                        className="inline-flex items-center gap-1 tabular-nums"
                        style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}
                      >
                        <Flame className="w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                        <span>{streak} d</span>
                      </span>
                    )}

                    {/* 3-dot menu */}
                    <button
                      type="button"
                      aria-label="Habit options"
                      className="p-1 opacity-0 group-hover:opacity-100"
                      style={{
                        color: 'var(--color-muted)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'opacity 150ms ease-out',
                        minHeight: 28,
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 4. Two-column row: Streak + 7-day activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak block */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span
                className="tabular-nums font-semibold"
                style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', lineHeight: 'var(--lh-title)', display: 'block' }}
              >
                {currentStreak} days
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}>
                Current streak
              </span>
            </div>
            <div>
              <span
                className="tabular-nums font-semibold"
                style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', lineHeight: 'var(--lh-title)', display: 'block' }}
              >
                {bestStreak} days
              </span>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}>
                Best streak
              </span>
            </div>
          </div>
        </div>

        {/* 7-day activity */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
          }}
        >
          <h2
            className="font-medium"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)', marginBottom: 16 }}
          >
            7-day activity
          </h2>

          <div className="grid grid-cols-7 gap-2 text-center">
            {daysOfWeek.map((day, idx) => {
              // Calculate the date for this day of the week
              const daysFromToday = currentDayIndex - idx;
              const date = new Date();
              date.setDate(date.getDate() - daysFromToday);

              const accountStart = accountCreatedDate && new Date(
                accountCreatedDate.getFullYear(),
                accountCreatedDate.getMonth(),
                accountCreatedDate.getDate()
              );
              const isBeforeAccount = accountStart && date < accountStart;
              const isCompletedDay = !isBeforeAccount && completedDates.has(date.toDateString());
              const isToday = idx === currentDayIndex;

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: 'var(--text-caption)',
                      color: isToday ? 'var(--color-text)' : 'var(--color-muted)',
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day}
                  </span>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: isCompletedDay
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      border: isToday ? '2px solid var(--color-accent)' : 'none',
                      boxSizing: 'content-box',
                    }}
                    title={`${day}: ${isToday ? 'Today' : date.toDateString()}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}