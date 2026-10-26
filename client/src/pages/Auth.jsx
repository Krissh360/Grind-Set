import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, registerUser } from "../services/api";
import { ArrowRight, Lock, Mail, UserRound, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
      setFieldErrors({});

      const newFieldErrors = {};

      if (!email.trim()) {
        newFieldErrors.email = "Email is required.";
      }
      if (!password) {
        newFieldErrors.password = "Password is required.";
      }
      if (!isLogin && !username.trim()) {
        newFieldErrors.username = "Username is required.";
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
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

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    paddingLeft: 40,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 'var(--text-body)',
    color: 'var(--color-text)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--text-body)',
    fontWeight: 500,
    color: 'var(--color-text)',
    marginBottom: 6,
  };

  const fieldErrorStyle = {
    fontSize: 'var(--text-caption)',
    color: 'var(--color-error)',
    marginTop: 4,
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }}
        >
          <img src="/flame-logo.png" alt="Grind Set" className="w-8 h-8" />
        </div>
        <span
          className="font-semibold tracking-tight"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--color-text)' }}
        >
          Grind Set
        </span>
      </div>

      <div
        className="w-full max-w-md"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 32,
        }}
      >
        <h2
          className="font-semibold text-center"
          style={{
            fontSize: 'var(--text-page-title)',
            lineHeight: 'var(--lh-title)',
            color: 'var(--color-text)',
            marginBottom: 4,
          }}
        >
          {isLogin ? "Welcome back" : "Create an account"}
        </h2>

        <p
          className="text-center"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-muted)',
            marginBottom: 24,
          }}
        >
          {isLogin
            ? "Sign in to continue."
            : "Start tracking your daily habits."}
        </p>

        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-caption)',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label style={labelStyle}>Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--color-muted)' }}>
                  <UserRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Choose a username"
                  maxLength={30}
                  style={{
                    ...inputStyle,
                    borderColor: fieldErrors.username ? 'var(--color-error)' : 'var(--color-border)',
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {fieldErrors.username && <p style={fieldErrorStyle}>{fieldErrors.username}</p>}
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--color-muted)' }}>
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.email ? 'var(--color-error)' : 'var(--color-border)',
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {fieldErrors.email && <p style={fieldErrorStyle}>{fieldErrors.email}</p>}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--color-muted)' }}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                style={{
                  ...inputStyle,
                  paddingRight: 44,
                  borderColor: fieldErrors.password ? 'var(--color-error)' : 'var(--color-border)',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAuth();
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p style={fieldErrorStyle}>{fieldErrors.password}</p>}
          </div>

          {isLogin && (
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, minHeight: 16, accentColor: 'var(--color-accent)' }}
              />
              Remember me for 30 days
            </label>
          )}

          <button
            onClick={handleAuth}
            className="w-full flex items-center justify-center gap-2 font-semibold"
            style={{
              marginTop: 8,
              backgroundColor: 'var(--color-navy)',
              color: 'var(--color-surface)',
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-body)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>{isLogin ? "Sign in" : "Get started"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p
          className="text-center"
          style={{ fontSize: 'var(--text-caption)', color: 'var(--color-muted)', marginTop: 24 }}
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); setFieldErrors({}); }}
            className="font-semibold ml-1.5"
            style={{
              color: 'var(--color-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-caption)',
              minHeight: 'auto',
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
