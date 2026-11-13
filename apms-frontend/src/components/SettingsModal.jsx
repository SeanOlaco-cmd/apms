import { useEffect, useState } from "react";
import api from "../api/axios";

const USERNAME_PATTERN = /^[A-Za-z0-9_]{2,7}$/;

function Segmented({ value, options, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm transition
            ${value === o.value ? "bg-[#7b1113] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-[#7b1113]" : "bg-gray-300"}`}>
      <span style={{ backgroundColor: "#fff" }}
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Row({ title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="px-6 py-4 border-t border-gray-100 first:border-t-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{title}</h3>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );
}

export default function SettingsModal({ user, settings, onSettingsChange, onUsernameSaved, onLogoutAll, onClose }) {
  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameMsg, setUsernameMsg] = useState(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const usernameValid = USERNAME_PATTERN.test(username);
  const usernameChanged = username !== (user?.username ?? "");

  const saveUsername = async () => {
    setUsernameMsg(null);
    setSavingUsername(true);
    try {
      const res = await api.put("/profile/username", { username });
      onUsernameSaved(res.data.username);
      setUsernameMsg({ ok: true, text: "Saved. You can now log in with this username." });
    } catch (err) {
      setUsernameMsg({
        ok: false,
        text: err.response?.data?.errors?.username?.[0] || err.response?.data?.message || "Could not save username.",
      });
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Close">✕</button>
        </div>

        <Section title="Profile">
          <div className="py-3">
            <label className="text-sm font-medium text-gray-800">Username</label>
            <p className="text-xs text-gray-400 mt-0.5">
              2–7 characters: letters, numbers, underscore. A short way to log in instead of your email.
            </p>
            <div className="flex gap-2 mt-2">
              <input type="text" value={username} maxLength={7}
                onChange={(e) => { setUsername(e.target.value); setUsernameMsg(null); }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="e.g. jdc_01" />
              <button onClick={saveUsername} disabled={!usernameValid || !usernameChanged || savingUsername}
                className="bg-[#7b1113] text-white text-sm font-semibold px-4 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-40">
                {savingUsername ? "Saving..." : "Save"}
              </button>
            </div>
            {username && !usernameValid && (
              <p className="text-xs text-red-600 mt-1">Use 2–7 letters, numbers, or underscores.</p>
            )}
            {usernameMsg && (
              <p className={`text-xs mt-1 ${usernameMsg.ok ? "text-green-600" : "text-red-600"}`}>{usernameMsg.text}</p>
            )}
          </div>
        </Section>

        <Section title="Appearance">
          <Row title="Theme" hint="Follows your device if set to System.">
            <Segmented value={settings.theme} onChange={(v) => onSettingsChange({ theme: v })}
              options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
          </Row>
          <Row title="Text size">
            <Segmented value={settings.textSize} onChange={(v) => onSettingsChange({ textSize: v })}
              options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} />
          </Row>
          <Row title="Table density" hint="Compact fits more rows on screen.">
            <Segmented value={settings.density} onChange={(v) => onSettingsChange({ density: v })}
              options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }]} />
          </Row>
          <Row title="Animations" hint="Turn off for a plainer, faster feel.">
            <Toggle checked={settings.animations} onChange={(v) => onSettingsChange({ animations: v })} />
          </Row>
        </Section>

        <Section title="Security">
          <Row title="Auto-logout" hint="Log out after this long without activity.">
            <select value={settings.autoLogout} onChange={(e) => onSettingsChange({ autoLogout: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value={0}>Never</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </Row>
          <Row title="Log out of all devices" hint="Ends every active session, including this one.">
            {confirmAll ? (
              <div className="flex gap-2">
                <button onClick={onLogoutAll}
                  className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-600 transition">Confirm</button>
                <button onClick={() => setConfirmAll(false)}
                  className="bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-300 transition">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmAll(true)}
                className="border border-red-300 text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Log out everywhere
              </button>
            )}
          </Row>
        </Section>

        <p className="px-6 pb-5 text-xs text-gray-400">
          Appearance and auto-logout are saved on this device only.
        </p>
      </div>
    </div>
  );
}