import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, LogOut, Save, Trash2 } from "lucide-react";
import { deleteAccount, updateProfile } from "../services/api";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setUsername(parsed.username || parsed.name || "");
    }
  }, []);

  const handleSaveUsername = async () => {
    try {
      setSaving(true);
      setMessage("");
      const data = await updateProfile(username);
      const updatedUser = {
        ...user,
        ...data.user,
        name: data.user.username,
      };
      setUser(updatedUser);
      setUsername(data.user.username);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));
      setMessage("Username updated");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/"); // or "/login" depending on your route
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    try {
      setDeleting(true);
      setDeleteError("");
      await deleteAccount();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      navigate("/?mode=signup");
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Account & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Manage your credentials, subscription level, and session preferences.
        </p>
      </div>

      {/* Account Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl p-6 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 mb-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Account Information
          </h2>
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
            Standard Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Display Name
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {user?.name || "Not set"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {user?.email || "Not set"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1.5">
            Username
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={username}
              maxLength={30}
              onChange={(event) => setUsername(event.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={handleSaveUsername}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save username"}
            </button>
          </div>
          {message && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">{message}</p>}
        </div>

        {/* Security / Session area */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Active session encrypted and saved locally.</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-900/60 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-rose-700 dark:text-rose-400">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Permanently remove your account and all habit history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmation("");
              setDeleteError("");
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/70 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Delete your account?</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
              This permanently deletes your account, habits, streaks, and completion history. This action cannot be undone.
            </p>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-5 mb-1.5">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              disabled={deleting}
              autoFocus
              className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {deleteError && <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">{deleteError}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "DELETE" || deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
