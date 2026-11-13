import { useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { ENROLLMENT_YEARS, yearLabel } from "../../lib/academic";
import { num } from "../../lib/format";
import {
  Button, Card, Empty, Field, Loading, LockedPeriod, Notice, NumberInput, PageHeader, StatusBadge, TextArea,
} from "../../components/ui";

const GRID = ENROLLMENT_YEARS.flatMap((y) => [`y${y}_new`, `y${y}_old`]);
const blank = () => ({
  total_enrolled: "", male_count: "", female_count: "", notes: "",
  ...Object.fromEntries(GRID.map((k) => [k, ""])),
});
const n = (v) => Number(v || 0);

export default function DHEnrollment() {
  const { activePeriod } = useAcademic();
  const { data: rows, loading, reload } = useApi("/enrollment");
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const newTotal = ENROLLMENT_YEARS.reduce((sum, y) => sum + n(form[`y${y}_new`]), 0);
  const oldTotal = ENROLLMENT_YEARS.reduce((sum, y) => sum + n(form[`y${y}_old`]), 0);
  const total = n(form.total_enrolled);
  const sexOk = n(form.male_count) + n(form.female_count) === total;
  const ageOk = newTotal + oldTotal === total;

  // One report per program per period: an existing one blocks a new submission.
  const mine = activePeriod ? rows.find((r) => r.academic_period_id === activePeriod.id) : null;
  const locked = !!mine && !editId;
  const canSubmit = !!activePeriod && !locked && !busy && form.total_enrolled !== "" && sexOk && ageOk;

  const reset = () => { setForm(blank()); setEditId(null); setError(""); };

  const startEdit = (row) => {
    setEditId(row.id);
    setSuccess("");
    setError("");
    setForm({
      total_enrolled: String(row.total_enrolled), male_count: String(row.male_count),
      female_count: String(row.female_count), notes: row.notes ?? "",
      ...Object.fromEntries(GRID.map((k) => [k, String(row[k] ?? 0)])),
    });
    window.scrollTo?.(0, 0);
  };

  const submit = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = {
      academic_period_id: activePeriod.id,
      total_enrolled: total, male_count: n(form.male_count), female_count: n(form.female_count),
      notes: form.notes || null,
      ...Object.fromEntries(GRID.map((k) => [k, n(form[k])])),
    };
    try {
      if (editId) {
        await api.put(`/enrollment/${editId}`, payload);
        setSuccess("Enrollment data updated and resubmitted to your Dean.");
      } else {
        await api.post("/enrollment", payload);
        setSuccess("Enrollment data submitted to your Dean.");
      }
      reset();
      reload();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader crumb="Enrollment Data" title="Enrollment Data" subtitle="Submit enrollment data for your program." />

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? "Edit Submission" : "New Submission"}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
        {locked && (
          <div className="mb-4">
            <Notice kind={mine.status === "rejected" ? "error" : "info"}>
              {mine.status === "rejected"
                ? `Your Dean or VPAA rejected this period's report: ${mine.rejection_reason ?? "no reason given"}. Use Edit in the list below to fix and resubmit it.`
                : "Your program already submitted enrollment data for this period, so the form is locked."}
            </Notice>
          </div>
        )}

        <fieldset disabled={locked || busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="ap-form-grid">
            <LockedPeriod period={activePeriod} />

            <Field label="Total Enrolled">
              <NumberInput value={form.total_enrolled} onChange={set("total_enrolled")} />
            </Field>
            <Field label="Male Count">
              <NumberInput value={form.male_count} onChange={set("male_count")} />
            </Field>
            <Field label="Female Count" hint={!sexOk && form.total_enrolled !== "" ? `Male + female is ${n(form.male_count) + n(form.female_count)}, but the total is ${total}.` : null}>
              <NumberInput value={form.female_count} onChange={set("female_count")} />
            </Field>
            <Field label="New Students" hint="Calculated from the year-level table below.">
              <input className="ap-input" readOnly value={newTotal} aria-label="New students (calculated)" />
            </Field>
            <Field label="Old Students" className="span-2"
              hint={!ageOk && form.total_enrolled !== "" ? `New + old is ${newTotal + oldTotal}, but the total is ${total}.` : "Calculated from the year-level table below."}>
              <input className="ap-input" readOnly value={oldTotal} aria-label="Old students (calculated)" />
            </Field>

            <div className="span-2">
              <p className="ap-label">New and old students per year level</p>
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th className="py-3 px-4">Year level</th>
                      <th className="py-3 px-4">New students</th>
                      <th className="py-3 px-4">Old students</th>
                      <th className="py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENROLLMENT_YEARS.map((y) => (
                      <tr key={y}>
                        <td className="py-2 px-4 strong">{yearLabel(y)}</td>
                        <td className="py-2 px-4"><NumberInput value={form[`y${y}_new`]} onChange={set(`y${y}_new`)} aria-label={`${yearLabel(y)} new students`} /></td>
                        <td className="py-2 px-4"><NumberInput value={form[`y${y}_old`]} onChange={set(`y${y}_old`)} aria-label={`${yearLabel(y)} old students`} /></td>
                        <td className="py-2 px-4 strong">{n(form[`y${y}_new`]) + n(form[`y${y}_old`])}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3 px-4 strong">All years</td>
                      <td className="py-3 px-4 strong">{newTotal}</td>
                      <td className="py-3 px-4 strong">{oldTotal}</td>
                      <td className="py-3 px-4 strong">{newTotal + oldTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Field label="Notes (optional)" className="span-2">
              <TextArea value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Add any notes here…" />
            </Field>
          </div>

          <div className="ap-form-actions">
            <Button icon={Send} onClick={submit} disabled={!canSubmit}>
              {busy ? "Saving…" : editId ? "Update & Resubmit" : "Submit Enrollment Data"}
            </Button>
            <Button variant="ghost" icon={RefreshCw} onClick={reset}>Reset Form</Button>
          </div>
        </fieldset>
      </Card>

      <Card>
        <h2 className="ap-card-title mb-4">Your enrollment reports</h2>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No enrollment reports yet.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  {["Period", "Total", "Male / Female", "New / Old", "Status", "Action"].map((h) => (
                    <th key={h} className="py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...rows].sort((a, b) => b.id - a.id).map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.academic_period?.school_year?.replace("-", "–")} · {r.academic_period?.semester}</td>
                    <td className="py-3 px-4">{num(r.total_enrolled)}</td>
                    <td className="py-3 px-4">{num(r.male_count)} / {num(r.female_count)}</td>
                    <td className="py-3 px-4">{num(r.new_students)} / {num(r.old_students)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} viewer="dh" />
                      {r.status === "rejected" && <p className="ap-hint" style={{ color: "#9b1c40" }}>{r.rejection_reason}</p>}
                    </td>
                    <td className="py-3 px-4">
                      {r.status === "rejected" && <Button small variant="ghost" onClick={() => startEdit(r)}>Edit</Button>}
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