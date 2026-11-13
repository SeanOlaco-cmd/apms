import { useNavigate } from "react-router-dom";
import { ArrowRight, Briefcase, ClipboardCheck, ClipboardList, Eye, UserMinus, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { RETENTION_TYPES, programChip } from "../../lib/academic";
import { formatDate, latestBy, num } from "../../lib/format";
import {
  Button, Card, Empty, GroupedBars, Loading, PageHeader, SectionTitle, SingleBars, Tile, TileGrid,
} from "../../components/ui";

export default function VPAAOverview() {
  const navigate = useNavigate();
  const { schools, programs, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const emp = useApi("/employees");
  const ach = useApi("/dept-achievements");
  const logs = useApi("/class-monitoring-logs");

  const approvedEnr = enr.data.filter((r) => r.status === "approved" && inYear(r));
  const approvedRet = ret.data.filter((r) => r.status === "approved" && inYear(r));

  // Latest approved report of every program, summed per school.
  const perProgram = programs.map((p) => ({ p, report: latestBy(approvedEnr.filter((r) => r.program_id === p.id)) }));
  const enrolledBySchool = schools.map((s) => ({
    label: s.code,
    value: perProgram.filter((x) => x.p.school_id === s.id).reduce((sum, x) => sum + Number(x.report?.total_enrolled ?? 0), 0),
  }));
  const totalEnrolled = enrolledBySchool.reduce((s, r) => s + r.value, 0);

  const typeTotal = (schoolId, type) => approvedRet
    .filter((r) => schoolId === null || r.school_id === schoolId)
    .reduce((s, r) => s + Number(r.type_counts?.[type] ?? 0), 0);
  const retentionRows = RETENTION_TYPES.map((t) => ({ label: t.label, values: schools.map((s) => typeTotal(s.id, t.value)) }));
  const totalDropouts = typeTotal(null, "dropped");

  const reportQueue = [
    ...enr.data.filter((r) => r.status === "dean_approved" && inYear(r)).map((r) => ({ kind: "enrollment", label: "Enrollment Report", r })),
    ...ret.data.filter((r) => r.status === "dean_approved" && inYear(r)).map((r) => ({ kind: "retention", label: "Retention Report", r })),
  ].sort((a, b) => String(b.r.created_at).localeCompare(String(a.r.created_at)));
  const facultyQueue = emp.data.filter((r) => r.status === "pending" && inYear(r)).length;
  const achievementQueue = ach.data.filter((r) => r.status === "pending" && inYear(r)).length;
  const awaiting = reportQueue.length + facultyQueue + achievementQueue;

  const monitored = logs.data.filter(inYear);
  const issues = monitored.filter((r) => r.verdict !== "complied").length;

  const loading = enr.loading || ret.loading;

  const queueRows = [
    { label: "Enrollment & retention reports", count: reportQueue.length, path: "/vpaa/approvals", icon: ClipboardCheck },
    { label: "Faculty employment records", count: facultyQueue, path: "/vpaa/faculty", icon: Briefcase },
    { label: "Departmental achievements", count: achievementQueue, path: "/vpaa/achievements", icon: Users },
  ];

  return (
    <>
      <PageHeader eyebrow="VPAA Dashboard" title="Academic Affairs Overview"
        subtitle="Review Dean-approved submissions and monitor academic performance across the college." />

      <Card>
        {loading ? <Loading /> : (
          <TileGrid min="10rem">
            <Tile icon={ClipboardCheck} tone="orange" label="Awaiting Approval" value={num(awaiting)} note="reports, faculty & achievements" />
            <Tile icon={Users} tone="lavender" label="Total Enrollees" value={num(totalEnrolled)} note="approved reports only" />
            <Tile icon={UserMinus} tone="red" label="Total Dropouts" value={num(totalDropouts)} note="approved reports only" />
            <Tile icon={ClipboardList} tone="blue" label="Class Issues" value={num(issues)} note={`of ${num(monitored.length)} monitored classes`} />
          </TileGrid>
        )}
      </Card>

      <Card>
        <SectionTitle icon={ClipboardCheck} tone="orange" title="Approval Queue" subtitle="Everything waiting for your decision." />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))" }}>
          {queueRows.map((q) => (
            <button key={q.path} type="button" className="ap-card text-left" style={{ cursor: "pointer" }} onClick={() => navigate(q.path)}>
              <div className="flex items-center justify-between">
                <q.icon size={18} />
                <ArrowRight size={14} />
              </div>
              <p className="ap-title" style={{ fontSize: "1.8rem", marginTop: "0.4rem" }}>{num(q.count)}</p>
              <p className="ap-hint">{q.label}</p>
            </button>
          ))}
        </div>
        {reportQueue.length > 0 && (
          <div className="ap-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="ap-table">
              <thead>
                <tr>{["Report", "School", "Program", "Date submitted", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {reportQueue.slice(0, 5).map(({ kind, label, r }) => (
                  <tr key={`${kind}-${r.id}`}>
                    <td className="py-3 px-4 strong">{label}</td>
                    <td className="py-3 px-4">{r.school?.code ?? "—"}</td>
                    <td className="py-3 px-4">{programChip(r.program)}</td>
                    <td className="py-3 px-4">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button small variant="reject" icon={Eye} onClick={() => navigate(`/vpaa/approvals/${kind}/${r.id}`)}>Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))" }}>
        <Card>
          <SectionTitle icon={Users} tone="green" title="Enrollment by School" subtitle="Approved reports, latest semester per program." />
          {loading ? <Loading /> : totalEnrolled === 0 ? <Empty>No approved enrollment reports yet.</Empty> : <SingleBars rows={enrolledBySchool} />}
        </Card>
        <Card>
          <SectionTitle icon={UserMinus} tone="red" title="Retention by Type" subtitle="Approved retention reports, per school." />
          {loading ? <Loading /> : approvedRet.length === 0 ? <Empty>No approved retention reports yet.</Empty>
            : <GroupedBars rows={retentionRows} series={schools.map((s) => s.code)} />}
        </Card>
      </div>
    </>
  );
}