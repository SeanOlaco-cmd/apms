import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import schoolLogo from "../assets/school-logo.png";
import campus from "../assets/background.jpg";

const HOME_BY_ROLE = {
  president: "/dashboard",
  dean: "/dean/dashboard",
  vpaa: "/vpaa/dashboard",
  system_admin: "/admin/dashboard",
  department_head: "/dh/dashboard",
};

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Set when you were signed out automatically (e.g. after being inactive).
  const notice = useLocation().state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { login: login.trim(), password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(HOME_BY_ROLE[res.data.user.role] ?? "/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email/username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ap-login">
      <section className="ap-login-photo" style={{ backgroundImage: `url(${campus})` }} aria-label="City College of Tagaytay campus">
        <div>
          <img src={schoolLogo} alt="City College of Tagaytay crest" style={{ width: "4.5rem", marginBottom: "1.2rem" }} />
          <p className="ap-eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>City College of Tagaytay</p>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.15, margin: "0.4rem 0 0.8rem" }}>
            A Clearer View of Academic Progress.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)" }}>Records, reviews, and reporting for the CCT academic community.</p>
        </div>
      </section>

      <section className="ap-login-pane">
        <div className="ap-login-card">
          <p className="ap-eyebrow">City College of Tagaytay</p>
          <h1 className="ap-title" style={{ fontSize: "1.7rem" }}>Academic Performance Monitoring System</h1>
          <p className="ap-subtitle" style={{ margin: "0.5rem 0 1.5rem" }}>Sign in with your CCT account.</p>

          {notice && !error && <div className="ap-notice ap-notice-info" role="status" style={{ marginBottom: "1rem" }}><span>{notice}</span></div>}
          {error && <div className="ap-notice ap-notice-error" role="alert" style={{ marginBottom: "1rem" }}><span>{error}</span></div>}

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "1.1rem" }}>
            <div>
              <label className="ap-label" htmlFor="login-id">CCT Email or Username</label>
              <div className="ap-input-icon">
                <Mail size={17} aria-hidden="true" />
                <input id="login-id" className="ap-input" type="text" autoComplete="username" required
                  value={login} onChange={(e) => setLogin(e.target.value)} placeholder="you@cct.edu.ph or username" />
              </div>
            </div>
            <div>
              <label className="ap-label" htmlFor="login-password">Password</label>
              <div className="ap-input-icon">
                <LockKeyhole size={17} aria-hidden="true" />
                <input id="login-password" className="ap-input" type={showPassword ? "text" : "password"}
                  autoComplete="current-password" required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingRight: "2.8rem" }} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" className="ap-btn ap-btn-primary" disabled={loading} aria-busy={loading}
              style={{ justifyContent: "center", width: "100%", height: "2.9rem" }}>
              {loading ? "Signing in…" : "Sign In"} <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          <p className="ap-hint" style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            Accounts and access are managed by the System Administrator.
          </p>
        </div>
      </section>
    </main>
  );
}