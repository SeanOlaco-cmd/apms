import { useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { formatDate } from "../../lib/format";
import { Button, Card, Empty, Field, Loading, Notice, PageHeader, SelectInput, TextInput } from "../../components/ui";

const SEMESTERS = [
  { value: "1st", label: "1st Semester" },
  { value: "2nd", label: "2nd Semester" },
  { value: "Summer", label: "Summer" },
];
const semesterLabel = (s) => SEMESTERS.find((x) => x.value === s)?.label ?? s;
const ORDER = { "1st": 1, "2nd": 2, Summer: 3 };

const emptyForm = { school_year: "", semester: "1st", start_date: "", end_date: "", is_active: false };

export default function AdminAcademicPeriods() {
  const { data: periods, loading, error: loadError, reload } = useApi("/academic-periods");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const reset = () => { setForm(emptyForm); setEditId(null); setError(""); };

  const yearOk = /^\d{4}-\d{4}$/.test(form.school_year.trim());
  const canSave = !busy && yearOk && form.semester;

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = { ...form, school_year: form.school_year.trim() };
    try {
      if (editId) {
        await api.put(`/academic-periods/${editId}`, payload);
        setSuccess("Period updated.");
      } else {
        await api.post("/academic-periods", payload);
        setSuccess("Period created.");
      }
      setForm(emptyForm); setEditId(null);
      reload();
    } catch (err) {
      setError(apiError(err, "Could not save the period."));
    } finally {
      setBusy(false);
    }
  };

  const edit = (p) => {
    setEditId(p.id); setError(""); setSuccess("");
    setForm({
      school_year: p.school_year, semester: p.semester,
      start_date: (p.start_date ?? "").slice(0, 10), end_date: (p.end_date ?? "").slice(0, 10),
      is_active: !!p.is_active,
    });
    window.scrollTo?.(0, 0);
  };

  const setActive = async (p) => {
    setError(""); setSuccess("");
    try {
      await api.put(`/academic-periods/${p.id}`, { is_active: true });
      setSuccess(`${p.school_year.replace("-", "–")} · ${semesterLabel(p.semester)} is now the active period.`);
      reload();
    } catch (err) {
      setError(apiError(err, "Could not activate the period."));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete academic period "${p.school_year} · ${semesterLabel(p.semester)}"?`)) return;
    setError(""); setSuccess("");
    try {
      await api.delete(`/academic-periods/${p.id}`);
      setSuccess("Period deleted.");
      reload();
    } catch (err) {
      setError(apiError(err, "Could not delete the period."));
    }
  };

  const rows = [...periods].sort((a, b) =>
    b.school_year.localeCompare(a.school_year) || (ORDER[b.semester] ?? 0) - (ORDER[a.semester] ?? 0));
  const active = periods.find((p) => p.is_active);

  return (
    <>
      <PageHeader crumb="Academic Periods" title="Academic Periods" showYear={false}
        subtitle="Manage the school years and semesters everyone submits data against." />

      <Notice kind={active || loading ? "info" : "error"}>
        {active
          ? `Active period: ${active.school_year.replace("-", "–")} · ${semesterLabel(active.semester)}. New reports are filed under it.`
          : loading ? "Loading periods…" : "No period is active. Department Heads cannot submit reports until you set one."}
      </Notice>
      {loadError && <Notice kind="error">{loadError}</Notice>}

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? "Edit Period" : "New Period"}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

        <div className="ap-form-grid">
          <Field label="School year" hint="Format: 2026-2027">
            <TextInput value={form.school_year} onChange={(e) => set("school_year")(e.target.value)} placeholder="2026-2027" />
          </Field>
          <Field label="Semester">
            <SelectInput value={form.semester} onChange={set("semester")} options={SEMESTERS} placeholder="Select semester…" />
          </Field>
          <Field label="Start date (optional)">
            <input type="date" className="ap-input" value={form.start_date} onChange={(e) => set("start_date")(e.target.value)} />
          </Field>
          <Field label="End date (optional)">
            <input type="date" className="ap-input" value={form.end_date} min={form.start_date || undefined}
              onChange={(e) => set("end_date")(e.target.value)} />
          </Field>
          <label className="span-2 flex items-center gap-2" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active")(e.target.checked)} />
            <span className="ap-label" style={{ margin: 0 }}>Set as the active period (only one can be active)</span>
          </label>
        </div>
        <div className="ap-form-actions">
          <Button icon={Save} onClick={save} disabled={!canSave}>{busy ? "Saving…" : editId ? "Update Period" : "Create Period"}</Button>
          <Button variant="ghost" icon={RefreshCw} onClick={reset}>{editId ? "Cancel Edit" : "Reset Form"}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="ap-card-title mb-4">All Periods</h2>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No academic periods yet.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["School year", "Semester", "Start", "End", "Status", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 strong">{p.school_year.replace("-", "–")}</td>
                    <td className="py-3 px-4">{semesterLabel(p.semester)}</td>
                    <td className="py-3 px-4">{formatDate((p.start_date ?? "").slice(0, 10))}</td>
                    <td className="py-3 px-4">{formatDate((p.end_date ?? "").slice(0, 10))}</td>
                    <td className="py-3 px-4">
                      <span className={`ap-badge ${p.is_active ? "b-approved" : "b-neutral"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button small variant="ghost" onClick={() => edit(p)}>Edit</Button>
                        {!p.is_active && <Button small onClick={() => setActive(p)}>Set Active</Button>}
                        {!p.is_active && <Button small variant="reject" onClick={() => remove(p)}>Delete</Button>}
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