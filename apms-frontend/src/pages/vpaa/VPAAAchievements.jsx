import { useMemo, useState } from "react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { formatDate } from "../../lib/format";
import { cellValue } from "../../lib/deptAchievements";
import RowReview from "../../components/RowReview";
import { Card, Empty, Loading, Notice, PageHeader, Pills, SearchBox, StatusBadge } from "../../components/ui";

const STATUS_PILLS = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

// "Level 3 · BSIT · 3rd Year" — every filled field of the record except name and notes.
function details(record) {
  const fields = (record.module?.fields ?? []).filter((f) => !["recipient_name", "notes"].includes(f.key));
  const parts = fields.map((f) => cellValue(record, f)).filter((v) => v !== "—");
  return parts.length ? parts.join(" · ") : "—";
}

// VPAA: approve departmental achievements and board-exam results from the Deans.
export default function VPAAAchievements() {
  const { modules, inYear } = useAcademic();
  const { data, loading, error, reload } = useApi("/dept-achievements");
  const [query, setQuery] = useState("");
  const [moduleId, setModuleId] = useState("all");
  const [status, setStatus] = useState("pending");
  const [actionError, setActionError] = useState("");

  const inScope = useMemo(() => data.filter(inYear), [data, inYear]);

  const moduleOptions = [
    { value: "all", label: "All" },
    ...modules
      .map((m) => ({ value: String(m.id), label: `${m.school?.code ? `${m.school.code} · ` : ""}${m.name}` })),
  ];

  const needle = query.trim().toLowerCase();
  const rows = inScope
    .filter((r) => moduleId === "all" || String(r.module_id) === moduleId)
    .filter((r) => status === "all" || r.status === status)
    .filter((r) => !needle || (r.recipient_name ?? "").toLowerCase().includes(needle))
    .sort((a, b) => b.id - a.id);

  const pendingCount = inScope.filter((r) => r.status === "pending").length;

  return (
    <>
      <PageHeader crumb="Departmental Achievements" title="Departmental Achievements"
        subtitle="Review the achievements and board exam results submitted by the Deans." />

      <Notice kind="info">
        {pendingCount === 0 ? "No achievement records are waiting for approval." : `${pendingCount} record${pendingCount === 1 ? " is" : "s are"} waiting for your approval.`}
      </Notice>
      {error && <Notice kind="error">{error}</Notice>}
      {actionError && <Notice kind="error">{actionError}</Notice>}

      <div className="ap-toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search by name…" />
        <Pills label="Module" options={moduleOptions} value={moduleId} onChange={setModuleId} />
        <Pills label="Status" options={STATUS_PILLS} value={status} onChange={setStatus} />
      </div>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No achievement records match these filters.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Name", "School", "Module", "Details", "Submitted", "Status", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.recipient_name}</td>
                    <td className="py-3 px-4">{r.school?.code ?? "—"}</td>
                    <td className="py-3 px-4">{r.module?.name ?? "—"}</td>
                    <td className="py-3 px-4">{details(r)}</td>
                    <td className="py-3 px-4">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} viewer="vpaa" flow="dean" />
                      {r.status === "rejected" && <p className="ap-hint" style={{ color: "#9b1c40" }}>{r.rejection_reason}</p>}
                    </td>
                    <td className="py-3 px-4">
                      {r.status === "pending" && (
                        <RowReview endpoint={`/dept-achievements/${r.id}/vpaa-review`} onDone={reload} onError={setActionError} />
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