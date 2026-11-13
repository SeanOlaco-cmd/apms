import { Briefcase, ClipboardList, UserMinus, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { ENROLLMENT_YEARS, yearLabel } from "../../lib/academic";
import { latestBy, num } from "../../lib/format";
import { Card, Empty, GroupedBars, Loading, PageHeader, SectionTitle, SingleBars, Tile, TileGrid } from "../../components/ui";

export default function PresidentOverview() {
  const { schools, programs, periods, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const emp = useApi("/employees");

  // The President only works with fully approved data.
  const approvedEnr = enr.data.filter((r) => r.status === "approved");
  const yearEnr = approvedEnr.filter(inYear);
  const yearRet = ret.data.filter((r) => r.status === "approved" && inYear(r));

  const latest = programs.map((p) => ({ p, report: latestBy(yearEnr.filter((r) => r.program_id === p.id)) }));
  const forSchool = (s) => latest.filter((x) => x.p.school_id === s.id);
  const sum = (items, pick) => items.reduce((t, x) => t + Number(pick(x) ?? 0), 0);

  const bySchool = schools.map((s) => ({ label: s.code, value: sum(forSchool(s), (x) => x.report?.total_enrolled) }));
  const totalEnrolled = bySchool.reduce((t, r) => t + r.value, 0);
  const byYear = ENROLLMENT_YEARS.map((y) => ({
    label: yearLabel(y),
    values: schools.map((s) => sum(forSchool(s), (x) => Number(x.report?.[`y${y}_new`] ?? 0) + Number(x.report?.[`y${y}_old`] ?? 0))),
  }));

  // Total enrollees for every term that has approved reports.
  const trend = [...periods].sort((a, b) => a.id - b.id)
    .map((p) => ({
      label: `${p.school_year.replace("-", "–")} · ${p.semester}`,
      value: approvedEnr.filter((r) => r.academic_period_id === p.id).reduce((t, r) => t + Number(r.total_enrolled ?? 0), 0),
    }))
    .filter((r) => r.value > 0);

  const dropouts = yearRet.reduce((t, r) => t + Number(r.type_counts?.dropped ?? 0), 0);
  const reporting = latest.filter((x) => x.report).length;
  const faculty = emp.data.filter((r) => r.status === "approved" && inYear(r)).length;
  const loading = enr.loading || ret.loading;

  return (
    <>
      <PageHeader eyebrow="College President Dashboard" title="College Overview"
        subtitle="Enrollment and retention across the college, based on fully approved reports." />

      <Card>
        {loading ? <Loading /> : (
          <TileGrid min="10rem">
            <Tile icon={Users} tone="lavender" label="Total Enrollees" value={num(totalEnrolled)} note="latest approved report per program" />
            <Tile icon={ClipboardList} tone="blue" label="Programs Reporting" value={`${reporting} / ${programs.length}`} note="with an approved report" />
            <Tile icon={UserMinus} tone="red" label="Total Dropouts" value={num(dropouts)} note="this academic year" />
            <Tile icon={Briefcase} tone="green" label="Faculty" value={num(faculty)} note="approved records" />
          </TileGrid>
        )}
      </Card>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(22rem, 1fr))" }}>
        <Card>
          <SectionTitle icon={Users} tone="green" title="Enrollment by School" subtitle="Total enrollees per school." />
          {loading ? <Loading /> : totalEnrolled === 0 ? <Empty>No approved enrollment reports for this academic year yet.</Empty> : <SingleBars rows={bySchool} />}
        </Card>
        <Card>
          <SectionTitle icon={Users} tone="blue" title="Enrollment by Year Level" subtitle="Students per year level in each school." />
          {loading ? <Loading /> : totalEnrolled === 0 ? <Empty>No approved enrollment reports for this academic year yet.</Empty>
            : <GroupedBars rows={byYear} series={schools.map((s) => s.code)} />}
        </Card>
      </div>

      <Card>
        <SectionTitle icon={Users} tone="orange" title="Enrollment Trend" subtitle="College-wide enrollees per semester (approved reports)." />
        {loading ? <Loading /> : trend.length === 0 ? <Empty>No approved enrollment reports yet.</Empty> : <SingleBars rows={trend} />}
      </Card>
    </>
  );
}