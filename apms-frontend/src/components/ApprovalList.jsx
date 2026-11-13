import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import useApi from "../lib/useApi";
import { useAcademic } from "../context/AcademicContext";
import { isMajor, programChip } from "../lib/academic";
import { formatDate, num } from "../lib/format";
import { Button, Card, Empty, Loading, Notice, PageHeader, Pills } from "./ui";

const STATUS_PILLS = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];
const SEMESTERS = [
  { value: "all", label: "All semesters" },
  { value: "1st", label: "1st Semester" },
  { value: "2nd", label: "2nd Semester" },
  { value: "Summer", label: "Summer" },
];

// What "Pending / Approved / Rejected" mean depends on who is looking.
const bucket = (status, viewer) =>
  (viewer === "vpaa"
    ? { dean_approved: "pending", approved: "approved", rejected: "rejected" }
    : { pending: "pending", dean_approved: "approved", approved: "approved", rejected: "rejected" })[status];

function ListBadge({ status, viewer }) {
  const map = { pending: ["Pending", "b-pending"], approved: ["Approved", "b-approved"], rejected: ["Rejected", "b-rejected"] };
  const [text, cls] = map[bucket(status, viewer)] ?? ["—", "b-neutral"];
  return (
    <>
      <span className={`ap-badge ${cls}`}>{text}</span>
      {viewer === "dean" && status === "dean_approved" && <p className="ap-hint">Awaiting VPAA</p>}
    </>
  );
}

// Enrollment + retention reports in one list. Used by the Dean and the VPAA.
export default function ApprovalList({ viewer, basePath, title, subtitle }) {
  const navigate = useNavigate();
  const { user, schools, schoolPrograms, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [semester, setSemester] = useState("all");

  const common = (r) => ({
    raw: r, status: r.status, program: r.program, school: r.school,
    programId: r.program_id, schoolId: r.school_id, period: r.academic_period, created: r.created_at,
  });
  const all = [
    ...enr.data.map((r) => ({ kind: "enrollment", id: r.id, label: "Enrollment Report", ...common(r), details: `${num(r.total_enrolled)} enrollees` })),
    ...ret.data.map((r) => ({ kind: "retention", id: r.id, label: "Retention Report", ...common(r), details: `${num(r.records_count)} record${Number(r.records_count) === 1 ? "" : "s"}` })),
  ].filter((r) => inYear(r.raw) && bucket(r.status, viewer));

  const rows = all
    .filter((r) => scope === "all" || String(viewer === "vpaa" ? r.schoolId : r.programId) === String(scope))
    .filter((r) => status === "all" || bucket(r.status, viewer) === status)
    .filter((r) => semester === "all" || r.period?.semester === semester)
    .sort((a, b) => String(b.created).localeCompare(String(a.created)));

  const scopeOptions = viewer === "vpaa"
    ? [{ value: "all", label: "All" }, ...schools.filter((s) => all.some((r) => r.schoolId === s.id)).map((s) => ({ value: String(s.id), label: s.code }))]
    : [{ value: "all", label: "All" }, ...schoolPrograms(user?.school_id).map((p) => ({ value: String(p.id), label: programChip(p) }))];

  const major = rows.length > 0 && rows.every((r) => isMajor(r.program));
  const loading = enr.loading || ret.loading;

  return (
    <>
      <PageHeader crumb="Approval of Submitted Reports" title={title} subtitle={subtitle} />

      <Notice kind="info">
        One submission per program, per school year and semester. Click <strong>Review</strong> to open the submitted data.
      </Notice>

      <div className="ap-toolbar">
        <Pills label={viewer === "vpaa" ? "School" : "Program"} options={scopeOptions} value={scope} onChange={setScope} />
        <Pills label="Status" options={STATUS_PILLS} value={status} onChange={setStatus} />
        <select className="ap-select" style={{ width: "auto", height: "2.5rem", borderRadius: "999px", marginLeft: "auto" }}
          value={semester} onChange={(e) => setSemester(e.target.value)} aria-label="Semester">
          {SEMESTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No reports match these filters.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  {["Report", major ? "Major" : "Program", "Academic period", "Submitted by", "Date submitted", "Details", "Status", "Action"].map((h) => (
                    <th key={h} className="py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.kind}-${r.id}`}>
                    <td className="py-3 px-4 strong">{r.label}</td>
                    <td className="py-3 px-4">{isMajor(r.program) ? programChip(r.program) : r.program?.code}</td>
                    <td className="py-3 px-4">{r.period?.school_year?.replace("-", "–")} · {r.period?.semester}</td>
                    <td className="py-3 px-4">Dept. Head, {r.program?.code}</td>
                    <td className="py-3 px-4">{formatDate(r.created)}</td>
                    <td className="py-3 px-4">{r.details}</td>
                    <td className="py-3 px-4"><ListBadge status={r.status} viewer={viewer} /></td>
                    <td className="py-3 px-4">
                      <Button small variant="reject" icon={Eye} onClick={() => navigate(`${basePath}/${r.kind}/${r.id}`)}>Review</Button>
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