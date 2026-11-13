import { useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { RETENTION_REASONS, RETENTION_TYPES } from "../../lib/academic";
import { formatDate } from "../../lib/format";
import RetentionTiles, { countTypes } from "../../components/RetentionTiles";
import {
  Button, Card, Empty, Field, Loading, Notice, PageHeader, Pills, SearchBox, SelectInput,
  StatusBadge, TextArea, TextInput, TypeBadge,
} from "../../components/ui";

// "Sub panels" of the Retention page: dropped, shiftee and transferee records.
const GROUPS = [
  { value: "all", label: "All", types: null },
  { value: "dropped", label: "Dropped", types: ["dropped"] },
  { value: "shiftee", label: "Shiftee", types: ["shiftee_in", "shiftee_out"] },
  { value: "transferee", label: "Transferee", types: ["transferee_in", "transferee_out"] },
];
const blank = () => ({ student_name: "", reason: "", record_date: "", student_no: "", type: "", notes: "" });
const todayStr = () => new Date().toISOString().slice(0, 10);

export default function DHRetention() {
  const { activePeriod } = useAcademic();
  const pid = activePeriod?.id;
  const recs = useApi(pid ? `/retention-records?academic_period_id=${pid}` : "", { enabled: !!pid });
  const reps = useApi("/retention-reports");
  const enr = useApi("/enrollment");

  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const records = recs.data;
  const report = reps.data.find((r) => r.academic_period_id === pid) ?? null;
  const enrolled = enr.data.find((r) => r.academic_period_id === pid)?.total_enrolled ?? 0;
  const locked = !!report && report.status !== "rejected";
  const counts = countTypes(records);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const canSave = !!pid && !locked && !busy && form.student_name.trim() && form.reason
    && form.record_date && form.student_no.trim() && form.type;

  const needle = query.trim().toLowerCase();
  const types = GROUPS.find((g) => g.value === group).types;
  const filtered = records
    .filter((r) => !types || types.includes(r.type))
    .filter((r) => !needle || [r.student_name, r.student_no, r.reason, r.record_date, formatDate(r.record_date)]
      .join(" ").toLowerCase().includes(needle));

  const refresh = () => { recs.reload(); reps.reload(); };
  const reset = () => { setForm(blank()); setEditId(null); setError(""); };

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = {
      student_name: form.student_name.trim(), student_no: form.student_no.trim(), type: form.type,
      reason: form.reason, record_date: form.record_date, notes: form.notes || null,
    };
    try {
      if (editId) {
        await api.put(`/retention-records/${editId}`, payload);
        setSuccess("Record updated.");
      } else {
        await api.post("/retention-records", { ...payload, academic_period_id: pid });
        setSuccess("Record added to this period's report.");
      }
      reset();
      refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const edit = (r) => {
    setEditId(r.id); setSuccess(""); setError("");
    setForm({
      student_name: r.student_name, reason: r.reason, record_date: r.record_date?.slice(0, 10) ?? "",
      student_no: r.student_no, type: r.type, notes: r.notes ?? "",
    });
    window.scrollTo?.(0, 0);
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the record for ${r.student_name}?`)) return;
    setError("");
    try {
      await api.delete(`/retention-records/${r.id}`);
      refresh();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const submitReport = async () => {
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("/retention-reports", { academic_period_id: pid });
      setSuccess("Retention report submitted to your Dean.");
      refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const editable = (r) => !r.report || r.report.status === "rejected";

  return (
    <>
      <PageHeader crumb="Retention" title="Retention" subtitle="Manually record student movement and reasons for leaving." />

      <Card><RetentionTiles counts={counts} enrolled={enrolled} /></Card>

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? "Edit Retention Record" : "New Retention Record"}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
        {locked && <div className="mb-4"><Notice kind="info">This period's retention report was already submitted, so records are locked.</Notice></div>}

        <fieldset disabled={locked || busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="ap-form-grid">
            <Field label="Name">
              <TextInput value={form.student_name} onChange={(e) => set("student_name")(e.target.value)} placeholder="Enter student name…" />
            </Field>
            <Field label="Reason">
              <SelectInput value={form.reason} onChange={set("reason")} options={RETENTION_REASONS} placeholder="Select reason…" />
            </Field>
            <Field label="Date">
              <input type="date" className="ap-input" value={form.record_date} max={todayStr()}
                onChange={(e) => set("record_date")(e.target.value)} />
            </Field>
            <Field label="Student Number">
              <TextInput value={form.student_no} onChange={(e) => set("student_no")(e.target.value)} placeholder="Enter student number…" />
            </Field>
            <Field label="Type">
              <SelectInput value={form.type} onChange={set("type")} options={RETENTION_TYPES} placeholder="Select type…" />
            </Field>
            <Field label="Notes (optional)">
              <TextArea value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Add any additional notes…" />
            </Field>
          </div>
          <div className="ap-form-actions">
            <Button icon={Send} onClick={save} disabled={!canSave}>
              {busy ? "Saving…" : editId ? "Update Record" : "Submit Record"}
            </Button>
            <Button variant="ghost" icon={RefreshCw} onClick={reset}>Reset Form</Button>
          </div>
        </fieldset>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="ap-card-title">Retention records</h2>
            <p className="ap-card-sub">
              {report ? "Report status:" : "Report not submitted yet."} {report && <StatusBadge status={report.status} viewer="dh" />}
            </p>
          </div>
          <Button icon={Send} onClick={submitReport} disabled={busy || locked || records.length === 0}>
            {report?.status === "rejected" ? "Resubmit report to Dean" : "Submit report to Dean"}
          </Button>
        </div>

        {report?.status === "rejected" && (
          <div className="mb-4"><Notice kind="error">Rejected: {report.rejection_reason}. Fix the records below, then resubmit.</Notice></div>
        )}
        {!report && records.length > 0 && (
          <div className="mb-4"><Notice kind="info">
            {records.length} draft record{records.length === 1 ? "" : "s"}. Submit the report when you are done so your Dean can review it.
          </Notice></div>
        )}

        <div className="ap-toolbar mb-4">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by name, reason, date, or student number…" />
          <Pills label="Record type" options={GROUPS} value={group} onChange={setGroup} />
        </div>

        {recs.loading ? <Loading /> : filtered.length === 0 ? <Empty>No retention records found.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  {["Name", "Student No.", "Type", "Reason", "Date", "Status", ""].map((h, i) => (
                    <th key={i} className="py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.student_name}</td>
                    <td className="py-3 px-4">{r.student_no}</td>
                    <td className="py-3 px-4"><TypeBadge type={r.type} /></td>
                    <td className="py-3 px-4">{r.reason}</td>
                    <td className="py-3 px-4">{formatDate(r.record_date)}</td>
                    <td className="py-3 px-4">
                      {r.report ? <StatusBadge status={r.report.status} viewer="dh" /> : <span className="ap-badge b-neutral">Draft</span>}
                    </td>
                    <td className="py-3 px-4">
                      {editable(r) && (
                        <div className="flex gap-2">
                          <Button small variant="ghost" onClick={() => edit(r)}>Edit</Button>
                          <Button small variant="reject" onClick={() => remove(r)}>Delete</Button>
                        </div>
                      )}
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