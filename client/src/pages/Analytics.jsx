import { useEffect, useState } from "react";
import { getAnalytics, getHabits } from "../services/api";
import { AlertCircle } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setError(null);
        const analytics = await getAnalytics();
        setData(analytics);
        try {
          const habitData = await getHabits();
          setHabits(habitData);
        } catch (err) {
          console.error(err);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton" style={{ width: 160, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 280, height: 16 }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
              <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 100, height: 12 }} />
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="skeleton" style={{ width: '100%', height: 240 }} />
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
          onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
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

  // Derived data
  const totalHabits = Number(data?.totalHabits) || 0;
  const totalCompletions = Number(data?.totalCompletions) || 0;
  const averageStreak = Number(data?.averageStreak) || 0;
  const avgStreakDisplay = Number.isInteger(averageStreak) ? averageStreak : averageStreak.toFixed(1);
  const mostConsistentHabit = data?.mostConsistentHabit || null;
  const allStreaksZero = habits.length === 0 || habits.every(h => (h.currentStreak || 0) === 0);

  // Build 14-day completions data
  const today = new Date();
  const todayKey = today.toDateString();
  const accountCreatedAt = habits.find((habit) => habit.accountCreatedAt)?.accountCreatedAt;
  const storedAccountCreatedAt = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").createdAt;
    } catch (error) {
      return null;
    }
  })();
  const accountStart = new Date(storedAccountCreatedAt || accountCreatedAt || todayKey);
  accountStart.setHours(0, 0, 0, 0);

  const chartDays = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    const key = date.toDateString();
    const dateNorm = new Date(date);
    dateNorm.setHours(0, 0, 0, 0);
    const isAfterAccount = dateNorm >= accountStart;
    return {
      key,
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      shortLabel: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      count: isAfterAccount
        ? habits.reduce((total, habit) => total + (habit.completedDates?.includes(key) ? 1 : 0), 0)
        : 0,
      isToday: key === todayKey,
    };
  });

  const chartMax = Math.max(...chartDays.map((day) => day.count), 1);
  const hasChartData = chartDays.some(d => d.count > 0);

  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: 20,
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
          Analytics
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', marginTop: 4 }}>
          Completions over the last 14 days.
        </p>
      </div>

      {/* Four stat cards — simplified */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Habits */}
        <div style={cardStyle}>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Habits
          </span>
          <p className="tabular-nums font-semibold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}>
            {totalHabits}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            Active habits tracked
          </span>
        </div>

        {/* Check-ins */}
        <div style={cardStyle}>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Check-ins, all time
          </span>
          <p className="tabular-nums font-semibold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}>
            {totalCompletions}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            Total completions recorded
          </span>
        </div>

        {/* Average streak */}
        <div style={cardStyle}>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Average streak
          </span>
          <p className="tabular-nums font-semibold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}>
            {avgStreakDisplay} <span style={{ fontSize: 'var(--text-body)', fontWeight: 400, color: 'var(--color-muted)' }}>days</span>
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            Per active habit
          </span>
        </div>

        {/* Top habit */}
        <div style={cardStyle}>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', display: 'block' }}>
            Top habit
          </span>
          <p
            className="font-semibold truncate capitalize"
            style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)', marginTop: 4, lineHeight: 'var(--lh-title)' }}
            title={mostConsistentHabit || undefined}
          >
            {allStreaksZero ? "\u2014" : (mostConsistentHabit || "\u2014")}
          </p>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 4, display: 'block' }}>
            {allStreaksZero ? "Not enough data yet" : "Most consistent"}
          </span>
        </div>
      </div>

      {/* Chart — 14-day completions per day */}
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
          style={{ fontSize: 'var(--text-card-title)', color: 'var(--color-text)', marginBottom: 24 }}
        >
          Completions
        </h2>

        {!hasChartData ? (
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', padding: '48px 0', textAlign: 'center' }}>
            No completion data yet. Start checking off habits to see your chart.
          </p>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Y-axis gridlines */}
            <div
              style={{
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                pointerEvents: 'none',
              }}
            >
              {[chartMax, Math.round(chartMax / 2), 0].map((val, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="tabular-nums" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>
                    {val}
                  </span>
                  <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
                </div>
              ))}
            </div>

            {/* Bars */}
            <div
              className="flex items-end gap-1"
              style={{ height: 240, paddingLeft: 32 }}
              role="img"
              aria-label="Bar chart showing completions per day for the last 14 days"
            >
              {chartDays.map((day) => (
                <div
                  key={day.key}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                  style={{ height: '100%', minWidth: 0, position: 'relative' }}
                  title={`${day.label}: ${day.count} completion${day.count !== 1 ? 's' : ''}`}
                >
                  {day.count > 0 && (
                    <span className="tabular-nums" style={{ fontSize: 10, color: 'var(--color-muted)' }}>
                      {day.count}
                    </span>
                  )}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 32,
                      height: `${Math.max((day.count / chartMax) * 100, day.count > 0 ? 8 : 2)}%`,
                      backgroundColor: day.count > 0 ? 'var(--color-accent)' : 'var(--color-border)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 300ms ease-out',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1" style={{ paddingLeft: 32, marginTop: 8 }}>
              {chartDays.map((day) => (
                <div
                  key={day.key}
                  className="flex-1 text-center tabular-nums"
                  style={{
                    fontSize: 10,
                    color: day.isToday ? 'var(--color-text)' : 'var(--color-muted)',
                    fontWeight: day.isToday ? 600 : 400,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.shortLabel}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}