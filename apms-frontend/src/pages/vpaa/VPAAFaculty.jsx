import { useMemo, useState } from "react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { FACULTY_DEGREES, FACULTY_POSITIONS, FACULTY_TYPES, labelOf, programChip } from "../../lib/academic";
import { formatDate } from "../../lib/format";
import RowReview from "../../components/RowReview";
import { Card, Empty, Loading, Notice, PageHeader, Pills, SearchBox, StatusBadge } from "../../components/ui";

const STATUS_PILLS = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// VPAA: approve the faculty employment records the Deans submitted.
export default function VPAAFaculty() {
  const { schools, programs, inYear } = useAcademic();
  const { data, loading, error, reload } = useApi("/employees");
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("pending");
  const [actionError, setActionError] = useState("");

  const inScope = useMemo(() => data.filter(inYear), [data, inYear]);

  // Program filter lists only programs that actually have records.
  const programOptions = useMemo(() => {
    const ids = new Set(inScope.map((r) => r.program_id).filter(Boolean));
    return [{ value: "all", label: "All" }, ...programs.filter((p) => ids.has(p.id)).map((p) => ({ value: String(p.id), label: programChip(p) }))];
  }, [inScope, programs]);

  const needle = query.trim().toLowerCase();
  const rows = inScope
    .filter((r) => program === "all" || String(r.program_id) === program)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => !needle || r.employee_name.toLowerCase().includes(needle))
    .sort((a, b) => b.id - a.id);

  const pendingCount = inScope.filter((r) => r.status === "pending").length;
  const schoolCode = (r) => r.school?.code ?? schools.find((s) => s.id === r.school_id)?.code ?? "—";

  return (
    <>
      <PageHeader crumb="Faculty Employment Status" title="Faculty Employment Status"
        subtitle="Review the faculty employment records submitted by the Deans." />

      <Notice kind="info">
        {pendingCount === 0 ? "No faculty records are waiting for approval." : `${pendingCount} faculty record${pendingCount === 1 ? " is" : "s are"} waiting for your approval.`}
      </Notice>
      {error && <Notice kind="error">{error}</Notice>}
      {actionError && <Notice kind="error">{actionError}</Notice>}

      <div className="ap-toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name…" />
        <Pills label="Program" options={programOptions} value={program} onChange={setProgram} />
        <Pills label="Status" options={STATUS_PILLS} value={status} onChange={setStatus} />
      </div>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No faculty records match these filters.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Name", "School", "Program", "Type", "Position", "Degree", "Submitted", "Status", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.employee_name}</td>
                    <td className="py-3 px-4">{schoolCode(r)}</td>
                    <td className="py-3 px-4">{r.program ? programChip(r.program) : "—"}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_TYPES, r.employment_type)}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_POSITIONS, r.position)}</td>
                    <td className="py-3 px-4">{labelOf(FACULTY_DEGREES, r.highest_education)}</td>
                    <td className="py-3 px-4">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} viewer="vpaa" flow="dean" />
                      {r.status === "rejected" && <p className="ap-hint" style={{ color: "#9b1c40" }}>{r.rejection_reason}</p>}
                    </td>
                    <td className="py-3 px-4">
                      {r.status === "pending" && (
                        <RowReview endpoint={`/employees/${r.id}/vpaa-review`} onDone={reload} onError={setActionError} />
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