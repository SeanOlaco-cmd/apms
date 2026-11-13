import { useState } from "react";
import { Award, Briefcase, ClipboardList, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { VERDICTS, programChip } from "../../lib/academic";
import { latestBy, num } from "../../lib/format";
import { Card, Empty, Loading, PageHeader, Pills, SectionTitle, Tile, TileGrid } from "../../components/ui";

// One department (school) at a time: enrollment, retention, faculty, achievements, class monitoring.
export default function PresidentReports() {
  const { schools, programs, modules, inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const ret = useApi("/retention-reports");
  const emp = useApi("/employees");
  const ach = useApi("/dept-achievements");
  const logs = useApi("/class-monitoring-logs");
  const [picked, setPicked] = useState(null);
  const schoolId = picked ?? schools[0]?.id ?? null;
  const school = schools.find((s) => s.id === schoolId) ?? null;
  const schoolPrograms = programs.filter((p) => p.school_id === schoolId);

  const approved = (rows) => rows.filter((r) => r.status === "approved" && inYear(r) && r.school_id === schoolId);
  const enrRows = approved(enr.data);
  const retRows = approved(ret.data);
  const faculty = approved(emp.data);
  const achievements = approved(ach.data);
  const classLogs = logs.data.filter((r) => inYear(r) && r.school_id === schoolId);

  const perProgram = schoolPrograms.map((p) => {
    const e = latestBy(enrRows.filter((r) => r.program_id === p.id));
    const t = (type) => retRows.filter((r) => r.program_id === p.id).reduce((s, r) => s + Number(r.type_counts?.[type] ?? 0), 0);
    return { p, e, dropped: t("dropped"), tIn: t("transferee_in"), tOut: t("transferee_out"), sIn: t("shiftee_in"), sOut: t("shiftee_out") };
  });
  const fullTime = faculty.filter((r) => r.employment_type === "full_time").length;
  const advanced = faculty.filter((r) => ["masters", "doctorate"].includes(r.highest_education)).length;
  const schoolModules = modules.filter((m) => m.school_id === schoolId);
  const loading = enr.loading || ret.loading;

  return (
    <>
      <PageHeader eyebrow="College President Dashboard" title="Reports per Department"
        subtitle="Approved data for each school, ready for review." />

      <div className="ap-toolbar">
        <Pills label="Department" value={schoolId} onChange={setPicked}
          options={schools.map((s) => ({ value: s.id, label: s.code }))} />
      </div>
      {school && <p className="ap-subtitle">{school.name}</p>}

      <Card>
        <SectionTitle icon={Users} tone="green" title="Enrollment & Retention" subtitle="Latest approved enrollment report and this year's retention per program." />
        {loading ? <Loading /> : perProgram.every((x) => !x.e && !x.dropped) ? <Empty>No approved reports for this department yet.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Program", "Enrolled", "Male", "Female", "New", "Old", "Dropped", "Transferee In/Out", "Shiftee In/Out"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {perProgram.map(({ p, e, dropped, tIn, tOut, sIn, sOut }) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 strong">{programChip(p)}</td>
                    <td className="py-3 px-4">{e ? num(e.total_enrolled) : "—"}</td>
                    <td className="py-3 px-4">{e ? num(e.male_count) : "—"}</td>
                    <td className="py-3 px-4">{e ? num(e.female_count) : "—"}</td>
                    <td className="py-3 px-4">{e ? num(e.new_students) : "—"}</td>
                    <td className="py-3 px-4">{e ? num(e.old_students) : "—"}</td>
                    <td className="py-3 px-4">{num(dropped)}</td>
                    <td className="py-3 px-4">{tIn} / {tOut}</td>
                    <td className="py-3 px-4">{sIn} / {sOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Briefcase} tone="blue" title="Faculty Employment Status" />
        <TileGrid min="10rem">
          <Tile icon={Briefcase} tone="lavender" label="Faculty" value={num(faculty.length)} note="approved records" />
          <Tile icon={Briefcase} tone="green" label="Full-time" value={num(fullTime)} note={`${num(faculty.length - fullTime)} part-time`} />
          <Tile icon={Briefcase} tone="orange" label="Masteral / Doctorate" value={num(advanced)} note="highest education" />
        </TileGrid>
      </Card>

      <Card>
        <SectionTitle icon={Award} tone="orange" title="Departmental Achievements" />
        {schoolModules.length === 0 ? <Empty>No achievement module for this department.</Empty> : (
          <TileGrid min="10rem">
            {schoolModules.map((m) => (
              <Tile key={m.id} icon={Award} tone="lavender" label={m.name}
                value={num(achievements.filter((r) => r.module_id === m.id).length)} note="approved records" />
            ))}
          </TileGrid>
        )}
      </Card>

      <Card>
        <SectionTitle icon={ClipboardList} tone="red" title="Class Monitoring" subtitle="Entries recorded by the VPAA for this department." />
        <TileGrid min="10rem">
          <Tile icon={ClipboardList} tone="blue" label="Monitored" value={num(classLogs.length)} note="entries" />
          {VERDICTS.filter((v) => v.value !== "complied").map((v) => (
            <Tile key={v.value} icon={ClipboardList} tone="lavender" label={v.label}
              value={num(classLogs.filter((r) => r.verdict === v.value).length)} />
          ))}
        </TileGrid>
      </Card>
    </>
  );
}
