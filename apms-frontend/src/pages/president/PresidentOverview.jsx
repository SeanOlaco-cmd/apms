import { useState } from "react";
import { Award, Briefcase, ClipboardList, UserMinus, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { ENROLLMENT_YEARS, yearLabel } from "../../lib/academic";
import { latestBy, num } from "../../lib/format";
import { cellValue } from "../../lib/deptAchievements";
import {
  Card, Empty, GroupedBars, Loading, PageHeader, Pills, SearchBox, SectionTitle, SingleBars, Tile, TileGrid,
} from "../../components/ui";

// "Level 3 · BSIT · 3rd Year": every filled field of the record except the name and notes.
function details(record) {
  const fields = (record.module?.fields ?? []).filter((f) => !["recipient_name", "notes"].includes(f.key));
  const parts = fields.map((f) => cellValue(record, f)).filter((v) => v !== "—");
  return parts.length ? parts.join(" · ") : "—";
}

export default function PresidentOverview() {
  const { schools, programs, periods, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const emp = useApi("/employees");
  const ach = useApi("/dept-achievements");
  const [moduleId, setModuleId] = useState("all");
  const [query, setQuery] = useState("");

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

  // Approved achievements and board-exam passers of the selected academic year.
  const achievements = ach.data.filter((r) => r.status === "approved" && inYear(r));
  const moduleOptions = [
    { value: "all", label: "All" },
    ...[...new Map(achievements.map((r) => [r.module_id, r])).values()].map((r) => ({
      value: String(r.module_id),
      label: `${r.school?.code ? `${r.school.code} · ` : ""}${r.module?.name ?? "Achievement"}`,
    })),
  ];
  const needle = query.trim().toLowerCase();
  const achievementRows = achievements
    .filter((r) => moduleId === "all" || String(r.module_id) === moduleId)
    .filter((r) => !needle || (r.recipient_name ?? "").toLowerCase().includes(needle))
    .sort((a, b) => String(a.school?.code).localeCompare(String(b.school?.code))
      || String(a.module?.name).localeCompare(String(b.module?.name))
      || String(a.recipient_name).localeCompare(String(b.recipient_name)));

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

      <Card>
        <SectionTitle icon={Award} tone="orange" title="Departmental Achievements"
          subtitle={`Approved achievements and board exam passers · ${num(achievements.length)} this academic year.`} />
        {ach.loading ? <Loading /> : achievements.length === 0 ? <Empty>No approved achievements for this academic year yet.</Empty> : (
          <>
            <div className="ap-toolbar mb-4">
              <SearchBox value={query} onChange={setQuery} placeholder="Search a name…" />
              <Pills label="Achievement" options={moduleOptions} value={moduleId} onChange={setModuleId} />
            </div>
            {achievementRows.length === 0 ? <Empty>No names match this search.</Empty> : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>{["Name", "School", "Achievement", "Details"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {achievementRows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 px-4 strong">{r.recipient_name}</td>
                        <td className="py-3 px-4">{r.school?.code ?? "—"}</td>
                        <td className="py-3 px-4">{r.module?.name ?? "—"}</td>
                        <td className="py-3 px-4">{details(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}