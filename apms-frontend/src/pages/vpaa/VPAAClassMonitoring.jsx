import { useMemo, useState } from "react";
import { Ban, ClipboardList, Clock, RefreshCw, Save, UserX } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { SECTIONS, VERDICTS, labelOf, programChip } from "../../lib/academic";
import { formatDate, num } from "../../lib/format";
import {
  Button, Card, Empty, Field, Loading, LockedPeriod, Notice, NumberInput, PageHeader, Pills, SearchBox,
  SelectInput, TextArea, TextInput, Tile, TileGrid,
} from "../../components/ui";

// Local date as YYYY-MM-DD (not UTC, so mornings in Manila don't show yesterday).
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blank = () => ({
  monitored_on: localToday(), school_id: "", program_id: "", instructor_name: "", subject_code: "",
  section: "", verdict: "", minutes_early: "", remarks: "",
});

const badgeOf = (v) => VERDICTS.find((x) => x.value === v)?.badge ?? "b-neutral";

// VPAA: log whether an instructor held, cancelled or cut short a class.
export default function VPAAClassMonitoring() {
  const { schools, schoolPrograms, activePeriod, inYear } = useAcademic();
  const { data, loading, reload } = useApi("/class-monitoring-logs");
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setSchool = (value) => setForm((f) => ({ ...f, school_id: value, program_id: "" }));
  const programs = form.school_id ? schoolPrograms(Number(form.school_id)) : [];
  const early = form.verdict === "early_dismissal";

  const canSave = !busy && form.school_id && form.program_id && form.instructor_name.trim() && form.subject_code.trim()
    && form.section && form.verdict && form.monitored_on && (!early || Number(form.minutes_early) > 0);

  const reset = () => { setForm(blank()); setEditId(null); setError(""); };

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = {
      monitored_on: form.monitored_on, school_id: Number(form.school_id), program_id: Number(form.program_id),
      instructor_name: form.instructor_name.trim(), subject_code: form.subject_code.trim().toUpperCase(),
      section: form.section, verdict: form.verdict, remarks: form.remarks.trim() || null,
      minutes_early: early ? Number(form.minutes_early) : null,
    };
    try {
      if (editId) {
        await api.put(`/class-monitoring-logs/${editId}`, payload);
        setSuccess("Class monitoring entry updated.");
      } else {
        await api.post("/class-monitoring-logs", { ...payload, academic_period_id: activePeriod?.id });
        setSuccess("Class monitoring entry saved.");
      }
      reset();
      reload();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const edit = (r) => {
    setEditId(r.id); setSuccess(""); setError("");
    setForm({
      monitored_on: (r.monitored_on ?? "").slice(0, 10), school_id: String(r.school_id), program_id: String(r.program_id),
      instructor_name: r.instructor_name, subject_code: r.subject_code, section: r.section, verdict: r.verdict,
      minutes_early: r.minutes_early ? String(r.minutes_early) : "", remarks: r.remarks ?? "",
    });
    window.scrollTo?.(0, 0);
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the entry for ${r.instructor_name} (${r.subject_code})?`)) return;
    try {
      await api.delete(`/class-monitoring-logs/${r.id}`);
      reload();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const inScope = useMemo(() => data.filter(inYear), [data, inYear]);
  const count = (v) => inScope.filter((r) => r.verdict === v).length;
  const lostMinutes = inScope.filter((r) => r.verdict === "early_dismissal").reduce((s, r) => s + Number(r.minutes_early || 0), 0);

  const needle = query.trim().toLowerCase();
  const rows = inScope
    .filter((r) => verdictFilter === "all" || r.verdict === verdictFilter)
    .filter((r) => !needle || r.instructor_name.toLowerCase().includes(needle) || r.subject_code.toLowerCase().includes(needle));

  const verdictPills = [{ value: "all", label: "All" }, ...VERDICTS.map((v) => ({ value: v.value, label: v.label }))];

  return (
    <>
      <PageHeader crumb="Class Monitoring" title="Class Monitoring"
        subtitle="Record whether instructors held their classes for the full scheduled time." />

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? "Edit Monitoring Entry" : "New Monitoring Entry"}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

        <div className="ap-form-grid">
          <LockedPeriod period={activePeriod} />
          <Field label="Date monitored">
            <input type="date" className="ap-input" max={localToday()} value={form.monitored_on}
              onChange={(e) => set("monitored_on")(e.target.value)} />
          </Field>
          <Field label="School">
            <SelectInput value={form.school_id} onChange={setSchool} placeholder="Select school…"
              options={schools.map((s) => ({ value: String(s.id), label: s.code }))} />
          </Field>
          <Field label="Program">
            <SelectInput value={form.program_id} onChange={set("program_id")} disabled={!form.school_id}
              placeholder={form.school_id ? "Select program…" : "Select a school first"}
              options={programs.map((p) => ({ value: String(p.id), label: programChip(p) }))} />
          </Field>
          <Field label="Instructor name" className="span-2">
            <TextInput value={form.instructor_name} onChange={(e) => set("instructor_name")(e.target.value)} placeholder="Enter instructor name…" />
          </Field>
          <Field label="Subject code">
            <TextInput value={form.subject_code} onChange={(e) => set("subject_code")(e.target.value)} placeholder="e.g. IT 101" />
          </Field>
          <Field label="Section">
            <SelectInput value={form.section} onChange={set("section")} options={SECTIONS} placeholder="Select section…" />
          </Field>
          <Field label="Verdict" className={early ? "" : "span-2"}>
            <SelectInput value={form.verdict} onChange={set("verdict")} options={VERDICTS} placeholder="Select verdict…" />
          </Field>
          {early && (
            <Field label="Minutes dismissed early" hint="Early dismissal is penalizable — every minute of the allotted time must be used.">
              <NumberInput value={form.minutes_early} onChange={set("minutes_early")} />
            </Field>
          )}
          <Field label="Remarks (optional)" className="span-2">
            <TextArea value={form.remarks} onChange={(e) => set("remarks")(e.target.value)} placeholder="Add any additional details…" />
          </Field>
        </div>
        <div className="ap-form-actions">
          <Button icon={Save} onClick={save} disabled={!canSave}>{busy ? "Saving…" : editId ? "Update Entry" : "Save Entry"}</Button>
          <Button variant="ghost" icon={RefreshCw} onClick={reset}>Reset Form</Button>
        </div>
      </Card>

      <Card>
        <TileGrid min="10rem">
          <Tile icon={ClipboardList} tone="blue" label="Entries" value={num(inScope.length)} note="this academic year" />
          <Tile icon={Ban} tone="red" label="Cancelled" value={num(count("cancelled_by_instructor"))} note="by the instructor" />
          <Tile icon={Clock} tone="orange" label="Early dismissals" value={num(count("early_dismissal"))} note={`${num(lostMinutes)} min lost`} />
          <Tile icon={UserX} tone="lavender" label="Unavailable" value={num(count("instructor_unavailable"))} note="instructor absent" />
        </TileGrid>
      </Card>

      <div className="ap-toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search instructor or subject…" />
        <Pills label="Verdict" options={verdictPills} value={verdictFilter} onChange={setVerdictFilter} />
      </div>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No monitoring entries match these filters.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Date", "Instructor", "School", "Program", "Subject", "Section", "Verdict", "Remarks", ""].map((h, i) => <th key={i} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4">{formatDate(r.monitored_on)}</td>
                    <td className="py-3 px-4 strong">{r.instructor_name}</td>
                    <td className="py-3 px-4">{r.school?.code ?? "—"}</td>
                    <td className="py-3 px-4">{r.program ? programChip(r.program) : "—"}</td>
                    <td className="py-3 px-4">{r.subject_code}</td>
                    <td className="py-3 px-4">{r.section}</td>
                    <td className="py-3 px-4">
                      <span className={`ap-badge ${badgeOf(r.verdict)}`}>{labelOf(VERDICTS, r.verdict)}</span>
                      {r.verdict === "early_dismissal" && r.minutes_early ? <p className="ap-hint">{r.minutes_early} min early</p> : null}
                    </td>
                    <td className="py-3 px-4">{r.remarks || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button small variant="ghost" onClick={() => edit(r)}>Edit</Button>
                        <Button small variant="reject" onClick={() => remove(r)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}