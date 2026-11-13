import { useState } from "react";
import { RefreshCw, Send } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { FACULTY_DEGREES, FACULTY_POSITIONS, FACULTY_TYPES, labelOf, programChip } from "../../lib/academic";
import {
  Button, Card, Empty, Field, Loading, LockedPeriod, Notice, PageHeader, SearchBox, SelectInput,
  StatusBadge, TextArea, TextInput,
} from "../../components/ui";

const blank = () => ({ employee_name: "", employment_type: "", position: "", highest_education: "", program_id: "", notes: "" });

export default function DeanFaculty() {
  const { user, activePeriod, schoolPrograms, inYear, school } = useAcademic();
  const { data, loading, reload } = useApi("/employees");
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const programs = schoolPrograms(user?.school_id);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const canSave = !!activePeriod && !busy && form.employee_name.trim() && form.employment_type
    && form.position && form.highest_education;

  const needle = query.trim().toLowerCase();
  const rows = data.filter(inYear)
    .filter((r) => !needle || r.employee_name.toLowerCase().includes(needle))
    .sort((a, b) => b.id - a.id);

  const reset = () => { setForm(blank()); setEditId(null); setError(""); };

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = {
      employee_name: form.employee_name.trim(), employment_type: form.employment_type, position: form.position,
      highest_education: form.highest_education, program_id: form.program_id || null, notes: form.notes || null,
    };
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, { ...payload, academic_period_id: activePeriod.id });
        setSuccess("Record updated and resubmitted to the VPAA.");
      } else {
        await api.post("/employees", { ...payload, academic_period_id: activePeriod.id });
        setSuccess("Faculty record submitted to the VPAA for approval.");
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
      employee_name: r.employee_name, employment_type: r.employment_type, position: r.position,
      highest_education: r.highest_education, program_id: r.program_id ? String(r.program_id) : "", notes: r.notes ?? "",
    });
    window.scrollTo?.(0, 0);
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the record for ${r.employee_name}?`)) return;
    try {
      await api.delete(`/employees/${r.id}`);
      reload();
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <>
      <PageHeader crumb="Faculty Employment Status" title="Faculty Employment Status"
        subtitle={`Manually record the employment details of a ${school?.name ?? "school"} faculty member.`} />

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? "Edit Faculty Record" : "New Faculty Record"}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

        <div className="ap-form-grid">
          <LockedPeriod period={activePeriod} />
          <Field label="Name" className="span-2">
            <TextInput value={form.employee_name} onChange={(e) => set("employee_name")(e.target.value)} placeholder="Enter faculty name…" />
          </Field>
          <Field label="Type">
            <SelectInput value={form.employment_type} onChange={set("employment_type")} options={FACULTY_TYPES} placeholder="Select type…" />
          </Field>
          <Field label="Position">
            <SelectInput value={form.position} onChange={set("position")} options={FACULTY_POSITIONS} placeholder="Select position…" />
          </Field>
          <Field label="Degree">
            <SelectInput value={form.highest_education} onChange={set("highest_education")} options={FACULTY_DEGREES} placeholder="Select degree…" />
          </Field>
          <Field label="Program (optional)" hint="Lets the VPAA filter faculty by program.">
            <SelectInput value={form.program_id} onChange={set("program_id")} placeholder="All programs / general"
              options={programs.map((p) => ({ value: String(p.id), label: programChip(p) }))} />
          </Field>
          <Field label="Notes (optional)" className="span-2">
            <TextArea value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Add any additional notes…" />
          </Field>
        </div>
        <div className="ap-form-actions">
          <Button icon={Send} onClick={save} disabled={!canSave}>
            {busy ? "Saving…" : editId ? "Update & Resubmit" : "Submit Record"}
          </Button>
          <Button variant="ghost" icon={RefreshCw} onClick={reset}>Reset Form</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className="ap-card-title">Recorded faculty</h2>
          <SearchBox value={query} onChange={setQuery} placeholder="Search a faculty name…" />
        </div>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No faculty records for this academic year.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Name", "Type", "Position", "Degree", "Program", "Status", ""].map((h, i) => <th key={i} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.employee_name}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_TYPES, r.employment_type)}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_POSITIONS, r.position)}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_DEGREES, r.highest_education)}</td>
                    <td className="py-3 px-4">{r.program ? programChip(r.program) : "—"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} viewer="dean" flow="dean" />
                      {r.status === "rejected" && <p className="ap-hint" style={{ color: "#9b1c40" }}>{r.rejection_reason}</p>}
                    </td>
                    <td className="py-3 px-4">
                      {r.status !== "approved" && (
                        <div className="flex gap-2">
                          {r.status === "rejected" && <Button small variant="ghost" onClick={() => edit(r)}>Edit</Button>}
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