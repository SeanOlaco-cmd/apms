import { useNavigate } from "react-router-dom";
import { ArrowRight, Briefcase, ClipboardCheck, Eye, UserMinus, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { ENROLLMENT_YEARS, RETENTION_TYPES, programChip, yearLabel } from "../../lib/academic";
import { formatDate, latestBy, num } from "../../lib/format";
import {
  Button, Card, Empty, GroupedBars, Loading, PageHeader, SectionTitle, Tile, TileGrid,
} from "../../components/ui";

export default function DeanOverview() {
  const navigate = useNavigate();
  const { user, school, schoolPrograms, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const emp = useApi("/employees");

  const programs = schoolPrograms(user?.school_id);
  const live = (rows) => rows.filter((r) => inYear(r) && r.status !== "rejected");

  // Each program's latest report in the selected academic year.
  const latest = programs.map((p) => ({ program: p, report: latestBy(live(enr.data).filter((r) => r.program_id === p.id)) }));
  const totalEnrolled = latest.reduce((s, x) => s + Number(x.report?.total_enrolled ?? 0), 0);

  const perYear = ENROLLMENT_YEARS.map((y) => ({
    label: yearLabel(y),
    values: latest.map(({ report }) => Number(report?.[`y${y}_new`] ?? 0) + Number(report?.[`y${y}_old`] ?? 0)),
  }));

  const retentionReports = live(ret.data);
  const typeTotal = (programId, type) => retentionReports
    .filter((r) => programId === null || r.program_id === programId)
    .reduce((s, r) => s + Number(r.type_counts?.[type] ?? 0), 0);
  const perType = RETENTION_TYPES.map((t) => ({ label: t.label, values: programs.map((p) => typeTotal(p.id, t.value)) }));
  const totalDropouts = typeTotal(null, "dropped");

  const pending = [
    ...enr.data.filter((r) => r.status === "pending" && inYear(r)).map((r) => ({ kind: "enrollment", label: "Enrollment Report", r })),
    ...ret.data.filter((r) => r.status === "pending" && inYear(r)).map((r) => ({ kind: "retention", label: "Retention Report", r })),
  ].sort((a, b) => String(b.r.created_at).localeCompare(String(a.r.created_at)));

  const facultyCount = emp.data.filter((r) => inYear(r) && r.status !== "rejected").length;
  const series = programs.map(programChip);
  const loading = enr.loading || ret.loading;

  return (
    <>
      <PageHeader eyebrow="Dean Dashboard" title="School Overview"
        subtitle={`Monitor enrollment, retention and approvals for ${school?.name ?? "your school"}.`} />

      <Card>
        {loading ? <Loading /> : (
          <TileGrid min="10rem">
            <Tile icon={ClipboardCheck} tone="orange" label="Pending Reports" value={num(pending.length)} note="waiting for your review" />
            <Tile icon={Users} tone="lavender" label="Total Enrollees" value={num(totalEnrolled)} note="latest report per program" />
            <Tile icon={UserMinus} tone="red" label="Total Dropouts" value={num(totalDropouts)} note="in reviewed reports" />
            <Tile icon={Briefcase} tone="green" label="Faculty Records" value={num(facultyCount)} note="this academic year" />
          </TileGrid>
        )}
      </Card>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))" }}>
        <Card>
          <SectionTitle icon={Users} tone="green" title="Enrollment by Year Level" subtitle="Students per year level in each program." />
          {loading ? <Loading /> : totalEnrolled === 0 ? <Empty>No enrollment reports for this academic year yet.</Empty>
            : <GroupedBars rows={perYear} series={series} />}
        </Card>
        <Card>
          <SectionTitle icon={UserMinus} tone="red" title="Retention by Type" subtitle="Dropped, transferee and shiftee records per program." />
          {loading ? <Loading /> : retentionReports.length === 0 ? <Empty>No retention reports for this academic year yet.</Empty>
            : <GroupedBars rows={perType} series={series} />}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle icon={ClipboardCheck} tone="orange" title="Reports Waiting for Review" />
          <button type="button" className="ap-crumb" onClick={() => navigate("/dean/approvals")}>View All <ArrowRight size={14} /></button>
        </div>
        {loading ? <Loading /> : pending.length === 0 ? <Empty>Nothing is waiting for your review.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Report", "Program", "Academic period", "Date submitted", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map(({ kind, label, r }) => (
                  <tr key={`${kind}-${r.id}`}>
                    <td className="py-3 px-4 strong">{label}</td>
                    <td className="py-3 px-4">{programChip(r.program)}</td>
                    <td className="py-3 px-4">{r.academic_period?.school_year?.replace("-", "–")} · {r.academic_period?.semester}</td>
                    <td className="py-3 px-4">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button small variant="reject" icon={Eye} onClick={() => navigate(`/dean/approvals/${kind}/${r.id}`)}>Review</Button>
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