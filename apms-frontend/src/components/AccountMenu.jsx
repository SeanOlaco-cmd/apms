import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import SettingsModal from "./SettingsModal";
import AboutModal from "./AboutModal";
import { loadSettings, saveSettings, applySettings } from "../lib/settings";

const ROLE_LABELS = {
  president: "President",
  dean: "Dean",
  vpaa: "VPAA",
  department_head: "Department Head",
  system_admin: "System Admin",
};

const CHANGE_PASSWORD_PATH = {
  president: "/dashboard/change-password",
  dean: "/dean/change-password",
  vpaa: "/vpaa/change-password",
  department_head: "/dh/change-password",
  system_admin: "/admin/change-password",
};

// Uploaded pictures live on the backend's public disk at /storage/<path>.
function avatarUrl(path) {
  if (!path) return null;
  const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${base}/storage/${path}`;
}

const ROLE_INITIALS = { department_head: "DH", dean: "DN", vpaa: "VP", president: "PR", system_admin: "SA" };

function Avatar({ user, size = 36 }) {
  const url = avatarUrl(user?.avatar_path);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (url && !broken) {
    return <img src={url} alt="" style={style} onError={() => setBroken(true)}
      className="rounded-full object-cover shrink-0" />;
  }
  return (
    <div style={style}
      className="rounded-xl bg-[var(--crimson)] flex items-center justify-center text-white font-bold shrink-0">
      {ROLE_INITIALS[user?.role] ?? user?.name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MenuItem({ onClick, danger = false, children }) {
  return (
    <button onClick={onClick} role="menuitem"
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition hover:bg-gray-100
        ${danger ? "text-red-600" : "text-gray-700"}`}>
      {children}
    </button>
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AccountMenu({ label }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [settings, setSettings] = useState(loadSettings);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null); // "settings" | "about" | null
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  const updateUser = (patch) => {
    const next = { ...user, ...patch };
    setUser(next);
    localStorage.setItem("user", JSON.stringify(next));
  };

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    applySettings(next);
  };

  // Sessions that started before usernames/avatars existed don't have
  // those fields in localStorage — pull the fresh copy once.
  useEffect(() => {
    api.get("/me")
      .then((res) => {
        const { name, email, username, role, school_id, program_id, avatar_path } = res.data;
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const next = { ...stored, name, email, username, role, school_id, program_id, avatar_path };
        localStorage.setItem("user", JSON.stringify(next));
        setUser(next);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Fades the screen out (if animations are on) before going to login.
  const leave = async (message) => {
    const root = document.getElementById("root");
    if (settings.animations && root) {
      root.classList.add("page-leaving");
      await sleep(250);
    }
    clearSession();
    navigate("/login", message ? { state: { message } } : undefined);
    requestAnimationFrame(() => root?.classList.remove("page-leaving"));
  };

  const handleLogout = async () => {
    setOpen(false);
    try { await api.post("/logout"); } catch { /* token may already be gone */ }
    await leave();
  };

  const handleLogoutAll = async () => {
    try { await api.post("/logout-all"); } catch { /* same */ }
    await leave();
  };

  // Auto-logout after N minutes without any mouse/keyboard/touch activity.
  useEffect(() => {
    if (!settings.autoLogout) return;
    const ms = settings.autoLogout * 60 * 1000;

    const expire = async () => {
      try { await api.post("/logout"); } catch { /* ignore */ }
      clearSession();
      navigate("/login", { state: { message: "You were logged out after being inactive." } });
    };

    let timer = setTimeout(expire, ms);
    const reset = () => { clearTimeout(timer); timer = setTimeout(expire, ms); };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [settings.autoLogout]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again later
    if (!file) return;

    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Image must be 2MB or smaller."); return; }

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatar_path: res.data.avatar_path });
    } catch (err) {
      setError(err.response?.data?.errors?.avatar?.[0] || err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setError("");
    try {
      await api.delete("/profile/avatar");
      updateUser({ avatar_path: null });
    } catch {
      setError("Could not remove the photo.");
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}
          className="flex items-center gap-3 rounded-2xl pl-2 pr-3 py-2 bg-[var(--card)] shadow-[var(--shadow-tile)] hover:brightness-95 transition max-w-[22rem]">
          <Avatar user={user} size={40} />
          <span className="text-sm font-semibold text-[var(--ink-2)] leading-tight text-left">
            {label ?? ROLE_LABELS[user?.role] ?? user?.role}
          </span>
          <ChevronDown size={16} className="text-[var(--muted)] shrink-0" />
        </button>

        {open && (
          <div role="menu"
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-pop-in overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar user={user} size={48} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.username ? `@${user.username}` : "No username set"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="text-red-700 font-semibold hover:underline disabled:opacity-50">
                  {uploading ? "Uploading..." : user?.avatar_path ? "Change photo" : "Upload photo"}
                </button>
                {user?.avatar_path && (
                  <button onClick={removePhoto} className="text-gray-500 hover:underline">Remove</button>
                )}
              </div>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <div className="p-2">
              <MenuItem onClick={() => { setOpen(false); navigate(CHANGE_PASSWORD_PATH[user?.role] ?? "/login"); }}>
                Change Password
              </MenuItem>
              <MenuItem onClick={() => { setOpen(false); setPanel("settings"); }}>Settings</MenuItem>
              <MenuItem onClick={() => { setOpen(false); setPanel("about"); }}>About Us</MenuItem>
            </div>

            <div className="p-2 border-t border-gray-100">
              <MenuItem onClick={handleLogout} danger>Logout</MenuItem>
            </div>
          </div>
        )}
      </div>

      {panel === "settings" && (
        <SettingsModal
          user={user}
          settings={settings}
          onSettingsChange={updateSettings}
          onUsernameSaved={(username) => updateUser({ username })}
          onLogoutAll={handleLogoutAll}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "about" && <AboutModal onClose={() => setPanel(null)} />}
    </>
  );
}