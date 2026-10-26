import { useEffect, useState } from "react";
import { getHabits, addHabit, completeHabit, deleteHabit } from "../services/api";
import {
  Check,
  Plus,
  Trash2,
  Flame,
  AlertCircle,
} from "lucide-react";

export default function Habits() {
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

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton" style={{ width: 140, height: 28, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 240, height: 16 }} />
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 24 }}>
          <div className="skeleton" style={{ width: '100%', height: 44, marginBottom: 16 }} />
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
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = habits.filter((h) => h.completedDates?.includes(today)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="font-semibold"
            style={{
              fontSize: 'var(--text-page-title)',
              lineHeight: 'var(--lh-title)',
              color: 'var(--color-text)',
            }}
          >
            My habits
          </h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)', marginTop: 4 }}>
            Manage and track your daily habits.
          </p>
        </div>
        <span
          className="tabular-nums font-medium"
          style={{ fontSize: 'var(--text-body)', color: 'var(--color-muted)' }}
        >
          {completedCount} / {habits.length} done today
        </span>
      </div>

      {/* Habits card with embedded add input */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
        }}
      >
        {/* Add habit input */}
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
                    {/* Streak — only when > 0 */}
                    {streak > 0 && (
                      <span
                        className="inline-flex items-center gap-1 tabular-nums"
                        style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}
                      >
                        <Flame className="w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                        <span>{streak} d</span>
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(habit._id)}
                      aria-label="Delete habit"
                      className="p-1.5 opacity-0 group-hover:opacity-100"
                      style={{
                        color: 'var(--color-muted)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'opacity 150ms ease-out, color 150ms ease-out',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        minHeight: 28,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}