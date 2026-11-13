import { ArrowLeft, CalendarDays, Info, Search, X } from "lucide-react";
import { useAcademic } from "../context/AcademicContext";
import { statusMeta, labelOf, RETENTION_TYPES } from "../lib/academic";

/* ---------- page chrome ---------- */

export function AcademicYearSelect() {
  const { years, year, setYear } = useAcademic();
  return (
    <label className="ap-ay" title="Academic year">
      <CalendarDays size={16} />
      <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Academic year">
        {years.length === 0 && <option value="">AY —</option>}
        {years.map((y) => <option key={y} value={y}>AY {y.replace("-", "–")}</option>)}
      </select>
    </label>
  );
}

export function PageHeader({ crumb, eyebrow, title, subtitle, right, showYear = true, onBack }) {
  return (
    <div className="ap-topline">
      <div className="min-w-0">
        {eyebrow && <p className="ap-eyebrow">{eyebrow}</p>}
        {crumb && (
          <button type="button" onClick={onBack} className="ap-crumb" disabled={!onBack}>
            <ArrowLeft size={14} /> {crumb}
          </button>
        )}
        <h1 className="ap-title">{title}</h1>
        {subtitle && <p className="ap-subtitle">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {right}
        {showYear && <AcademicYearSelect />}
      </div>
    </div>
  );
}

export const Card = ({ className = "", children, ...rest }) => (
  <section className={`ap-card ${className}`} {...rest}>{children}</section>
);

export function SectionTitle({ icon: Icon, tone = "green", title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <span className={`ap-tile-icon tone-${tone}`}><Icon size={20} /></span>}
        <div className="min-w-0">
          <h2 className="ap-card-title">{title}</h2>
          {subtitle && <p className="ap-card-sub">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Tile({ icon: Icon, tone = "lavender", label, value, note, noteClass = "", small = false }) {
  return (
    <div className={`ap-tile ${small ? "ap-tile-sm" : ""}`}>
      <div className="ap-tile-head">
        {Icon && <span className={`ap-tile-icon tone-${tone}`}><Icon size={small ? 16 : 20} /></span>}
        <span className="ap-tile-label">{label}</span>
      </div>
      <p className="ap-tile-value">{value}</p>
      {note && <p className={`ap-tile-note ${noteClass}`}>{note}</p>}
    </div>
  );
}

export const TileGrid = ({ min = "11rem", children }) => (
  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))` }}>
    {children}
  </div>
);

/* ---------- filters ---------- */

export function Pills({ options, value, onChange, label }) {
  return (
    <div className="ap-pills" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" className="ap-pill"
          aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="ap-search">
      <Search size={16} />
      <input className="ap-input" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

/* ---------- form fields ---------- */

export function Field({ label, hint, className = "", children, htmlFor }) {
  return (
    <div className={className}>
      {label && <label className="ap-label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <p className="ap-hint">{hint}</p>}
    </div>
  );
}

export const TextInput = (props) => <input type="text" className="ap-input" {...props} />;

const blockKeys = (e) => { if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault(); };
export const NumberInput = ({ value, onChange, ...rest }) => (
  <input type="number" min="0" className="ap-input" value={value} onKeyDown={blockKeys}
    onChange={(e) => onChange(e.target.value === "" ? "" : String(Math.max(0, Number(e.target.value))))}
    placeholder="0" {...rest} />
);

export function SelectInput({ value, onChange, options, placeholder = "Select…", ...rest }) {
  const list = options.map((o) => (typeof o === "object" ? o : { value: o, label: String(o) }));
  return (
    <select className={`ap-select ${value === "" || value == null ? "is-empty" : ""}`}
      value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      <option value="">{placeholder}</option>
      {list.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export const TextArea = (props) => <textarea className="ap-textarea" rows={3} {...props} />;

export function LockedPeriod({ period }) {
  const text = period
    ? `${period.school_year.replace("-", "–")} · ${period.semester === "Summer" ? "Summer" : `${period.semester} Semester`}`
    : "Loading current period…";
  return (
    <Field label="Academic Period" className="span-2">
      <div className="ap-locked">
        <p className="ap-locked-main"><CalendarDays size={16} /> {text}</p>
        <p className="ap-hint">Set automatically to the current academic period — cannot be changed here.</p>
      </div>
    </Field>
  );
}

/* ---------- buttons, badges, notices ---------- */

export function Button({ variant = "primary", small = false, icon: Icon, children, className = "", ...rest }) {
  return (
    <button type="button" className={`ap-btn ap-btn-${variant} ${small ? "ap-btn-sm" : ""} ${className}`} {...rest}>
      {Icon && <Icon size={small ? 14 : 17} />} {children}
    </button>
  );
}

export function StatusBadge({ status, viewer, flow }) {
  const [text, cls] = statusMeta(status, { viewer, flow });
  return <span className={`ap-badge ${cls}`}>{text}</span>;
}

export function TypeBadge({ type }) {
  return <span className={`ap-badge b-${type}`}>{labelOf(RETENTION_TYPES, type)}</span>;
}

export function Notice({ kind = "info", children }) {
  if (!children) return null;
  return (
    <div className={`ap-notice ap-notice-${kind}`} role={kind === "error" ? "alert" : "status"}>
      <Info size={16} className="shrink-0" /> <span>{children}</span>
    </div>
  );
}

export const Empty = ({ children }) => <p className="ap-empty">{children}</p>;
export const Loading = () => <p className="ap-empty">Loading…</p>;

/* ---------- dialogs ---------- */

export function RejectDialog({ title = "Reason for rejection", value, onChange, onConfirm, onCancel, error, busy }) {
  return (
    <div className="ap-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="ap-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="ap-card-title">{title}</h3>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-[var(--muted)]"><X size={18} /></button>
        </div>
        {error && <div className="mb-3"><Notice kind="error">{error}</Notice></div>}
        <TextArea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Add feedback for the submitter…" autoFocus />
        <div className="flex gap-2 mt-4">
          <Button onClick={onConfirm} disabled={busy || !value.trim()}>Confirm Reject</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny charts ---------- */

// rows: [{ label, values: [n, n] }], series: ["BSIT", "BSCS"] — grouped bars like the Dean overview.
export function GroupedBars({ rows, series }) {
  const max = Math.max(1, ...rows.flatMap((r) => r.values));
  return (
    <div>
      <div className="ap-legend">
        {series.map((s, i) => <span key={s}><i className={`s${i % 6}`} />{s}</span>)}
      </div>
      <div className="ap-bars">
        {rows.map((r) => (
          <div key={r.label} className="ap-bar-row">
            <span className="font-semibold text-[var(--ink)]">{r.label}</span>
            <div className="ap-bar-stack">
              {r.values.map((v, i) => <div key={i} className={`ap-bar s${i % 6}`} style={{ width: `${(v / max) * 100}%` }} />)}
            </div>
            <span className="text-[var(--ink-2)] font-semibold tabular-nums">{r.values.join(" · ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SingleBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="ap-bars">
      {rows.map((r) => (
        <div key={r.label} className="ap-bar-row">
          <span className="font-semibold text-[var(--ink)]">{r.label}</span>
          <div className="ap-bar-stack"><div className="ap-bar s0" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <span className="text-[var(--ink-2)] font-semibold tabular-nums">{r.value.toLocaleString("en-US")}</span>
        </div>
      ))}
    </div>
  );
}
