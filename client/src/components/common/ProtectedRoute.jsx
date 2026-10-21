import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../../services/api";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const [status, setStatus] = useState(token ? "checking" : "unauthenticated");

  useEffect(() => {
    if (!token) return;

    getCurrentUser()
      .then(({ user }) => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...user }));
        setStatus("authenticated");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("unauthenticated");
      });
  }, [token]);

  if (status === "unauthenticated") {
    return <Navigate to="/" />;
  }

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}