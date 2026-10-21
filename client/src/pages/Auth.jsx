import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, registerUser } from "../services/api";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const [isLogin, setIsLogin] = useState(() => new URLSearchParams(window.location.search).get("mode") !== "signup");

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    getCurrentUser()
      .then(({ user }) => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...user }));
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
  }, [navigate]);

  const handleAuth = async () => {
    try {
      setError("");

      if (!email.trim() || !password) {
        setError("Enter your user ID and password to continue.");
        return;
      }

      if (!isLogin && !username.trim()) {
        setError("Choose a username to create your account.");
        return;
      }

      let data;

      if (isLogin) {
        data = await loginUser({ email, password, rememberMe });

        localStorage.setItem("token", data.token);

        const fallbackName = email.split("@")[0];
        const profile = data.user || {};

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...profile,
            name: profile.username || fallbackName,
            email: email,
          })
        );

        navigate("/dashboard");
      } else {
        await registerUser({ username, email, password });

        alert("Registered successfully! Please login.");
        setIsLogin(true);
        setUsername("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-md shadow-emerald-500/20 overflow-hidden">
          <img src="/flame-logo.png" alt="Grind Set" className="w-9 h-9" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-zinc-100 block">
            Grind Set
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
            Daily Momentum
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm rounded-2xl p-8 w-full max-w-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 text-center mb-1">
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>

        <p className="text-sm text-slate-500 dark:text-zinc-400 text-center mb-6">
          {isLogin
            ? "Enter your details to access your daily habit workspace."
            : "Start building consistent daily routines today."}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Choose a username"
                  maxLength={30}
                  className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
                User ID (Email)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAuth();
                }}
              />
            </div>
          </div>

          {isLogin && (
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20"
              />
              Remember me for 30 days
            </label>
          )}

          <button
            onClick={handleAuth}
            className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{isLogin ? "Sign In" : "Get Started"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-zinc-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
