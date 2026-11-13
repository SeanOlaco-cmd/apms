import { useEffect, useMemo, useState } from "react";
import { Award, RefreshCw, Send } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { programChip, schoolYearRanges } from "../../lib/academic";
import {
  blankValues, cellValue, columnsOf, missingRequired, optionList, payloadFromValues, singularName, valuesFromRecord,
} from "../../lib/deptAchievements";
import {
  Button, Card, Empty, Field, Loading, LockedPeriod, Notice, PageHeader, Pills, SearchBox, SectionTitle,
  SelectInput, StatusBadge, TextArea, TextInput,
} from "../../components/ui";

// One input, chosen by the field's `type` from the module configuration.
function FieldInput({ field, value, onChange, programs }) {
  switch (field.type) {
    case "select":
      return <SelectInput value={value} onChange={onChange} options={optionList(field)} placeholder={`Select ${field.label.toLowerCase()}…`} />;
    case "program":
      return <SelectInput value={value} onChange={onChange} placeholder="Select program…"
        options={programs.map((p) => ({ value: String(p.id), label: programChip(p) }))} />;
    case "school_year_range":
      return <SelectInput value={value} onChange={onChange} options={schoolYearRanges()} placeholder="Select school year attended…" />;
    case "date":
      return <input type="date" className="ap-input" value={value} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <TextArea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Add any additional notes…" />;
    default:
      return <TextInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}…`} />;
  }
}

export default function DeanAchievements() {
  const { user, modules, periods, activePeriod, schoolPrograms, inYear, school } = useAcademic();
  const { data, loading, reload } = useApi("/dept-achievements");
  const programs = schoolPrograms(user?.school_id);

  const [moduleId, setModuleId] = useState(null);
  const [values, setValues] = useState({});
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const module = modules.find((m) => m.id === moduleId) ?? modules[0] ?? null;

  useEffect(() => { setValues(blankValues(module)); setEditId(null); }, [module?.id]); // eslint-disable-line

  const set = (key) => (v) => setValues((cur) => ({ ...cur, [key]: v }));
  const isBoard = module?.kind === "board_exam";
  const noun = singularName(module?.name);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data
      .filter((r) => r.module_id === module?.id && inYear(r))
      .filter((r) => !needle || (r.recipient_name ?? "").toLowerCase().includes(needle))
      .sort((a, b) => b.id - a.id);
  }, [data, module?.id, query, inYear]);

  // TOPCIT summary: how many students reached each level, with names.
  const byLevel = useMemo(() => {
    if (module?.kind !== "topcit") return [];
    const live = data.filter((r) => r.module_id === module.id && inYear(r) && r.status !== "rejected");
    return [1, 2, 3, 4, 5].map((lvl) => ({ lvl, people: live.filter((r) => Number(r.topcit_level) === lvl) }));
  }, [data, module, inYear]);

  const reset = () => { setValues(blankValues(module)); setEditId(null); setError(""); };
  // Board exams hide the period lock, but the record still belongs to a period.
  const savePeriod = activePeriod ?? [...periods].sort((a, b) => b.id - a.id)[0] ?? null;
  const canSave = !!module && !busy && !!savePeriod && !missingRequired(module, values);

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    const payload = payloadFromValues(module, values);
    const target = rows.find((r) => r.id === editId);
    const periodId = editId ? target?.academic_period_id : savePeriod?.id;
    try {
      if (editId) {
        await api.put(`/dept-achievements/${editId}`, payload);
        setSuccess("Record updated and resubmitted to the VPAA.");
      } else {
        await api.post("/dept-achievements", { ...payload, module_id: module.id, academic_period_id: periodId });
        setSuccess(`${noun} record submitted to the VPAA for approval.`);
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
    setValues(valuesFromRecord(module, r));
    window.scrollTo?.(0, 0);
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the record for ${r.recipient_name}?`)) return;
    try {
      await api.delete(`/dept-achievements/${r.id}`);
      reload();
    } catch (err) {
      setError(apiError(err));
    }
  };

  if (!module) {
    return (
      <>
        <PageHeader crumb="Departmental Achievements" title="Departmental Achievements"
          subtitle={`Achievements and board exam results of ${school?.name ?? "your school"}.`} />
        <Card><Notice kind="info">No departmental achievement module has been set up for your school yet. The System Administrator can configure one.</Notice></Card>
      </>
    );
  }

  const cols = columnsOf(module);

  return (
    <>
      <PageHeader crumb={isBoard ? "Board Exams" : "Departmental Achievements"}
        title={isBoard ? "Board Exams" : "Departmental Achievements"}
        subtitle={module.description || `Manually record ${school?.name ?? "school"} achievements.`} showYear={!isBoard} />

      {modules.length > 1 && (
        <Card>
          <Pills label="Achievement module" value={module.id} onChange={setModuleId}
            options={modules.map((m) => ({ value: m.id, label: m.name }))} />
        </Card>
      )}

      <Card>
        <h2 className="ap-card-title mb-4">{editId ? `Edit ${noun} Record` : `New ${noun} Record`}</h2>
        {success && <div className="mb-4"><Notice kind="success">{success}</Notice></div>}
        {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

        <div className="ap-form-grid">
          {!isBoard && <LockedPeriod period={activePeriod} />}
          {module.fields.map((f) => (
            <Field key={f.key} label={f.label} className={f.type === "textarea" || f.key === "recipient_name" ? "span-2" : ""}>
              <FieldInput field={f} value={values[f.key] ?? ""} onChange={set(f.key)} programs={programs} />
            </Field>
          ))}
        </div>
        <div className="ap-form-actions">
          <Button icon={Send} onClick={save} disabled={!canSave}>
            {busy ? "Saving…" : editId ? "Update & Resubmit" : "Submit Record"}
          </Button>
          <Button variant="ghost" icon={RefreshCw} onClick={reset}>Reset Form</Button>
        </div>
      </Card>

      {module.kind === "topcit" && (
        <Card>
          <SectionTitle icon={Award} tone="orange" title="TOPCIT results by level"
            subtitle="Students recorded per level this academic year (rejected records excluded)." />
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead><tr>{["Level", "Total", "Students (year level)"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr></thead>
              <tbody>
                {byLevel.map(({ lvl, people }) => (
                  <tr key={lvl}>
                    <td className="py-3 px-4 strong">Level {lvl}</td>
                    <td className="py-3 px-4">{people.length}</td>
                    <td className="py-3 px-4">
                      {people.length === 0 ? "—" : people.map((p) => `${p.recipient_name}${p.year_level ? ` (${p.year_level})` : ""}`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className="ap-card-title">Recorded {module.name}</h2>
          <SearchBox value={query} onChange={setQuery} placeholder="Search a name…" />
        </div>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No {module.name} records yet.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{[...cols.map((c) => c.label), "Status", ""].map((h, i) => <th key={i} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    {cols.map((c, i) => (
                      <td key={c.key} className={`py-3 px-4 ${i === 0 ? "strong" : ""}`}>{cellValue(r, c, programs)}</td>
                    ))}
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