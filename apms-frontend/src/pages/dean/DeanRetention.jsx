import { useState } from "react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { isMajor, programChip } from "../../lib/academic";
import { formatDate, latestBy } from "../../lib/format";
import RetentionTiles, { countTypes } from "../../components/RetentionTiles";
import { Card, Empty, Loading, PageHeader, Pills, SearchBox, TypeBadge } from "../../components/ui";

export default function DeanRetention() {
  const { user, schoolPrograms, inYear } = useAcademic();
  const recs = useApi("/retention-records");
  const enr = useApi("/enrollment");
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");

  const programs = schoolPrograms(user?.school_id);
  const inScope = (programId) => scope === "all" || String(programId) === String(scope);

  const records = recs.data.filter((r) => inYear(r) && inScope(r.program_id));
  const needle = query.trim().toLowerCase();
  const rows = records
    .filter((r) => !needle || [r.student_name, r.student_no, r.reason, r.record_date, formatDate(r.record_date)]
      .join(" ").toLowerCase().includes(needle))
    .sort((a, b) => String(b.record_date).localeCompare(String(a.record_date)));

  // "% of total enrollees": the latest semester's enrollment of each program in view.
  const enrolled = programs
    .filter((p) => inScope(p.id))
    .reduce((sum, p) => {
      const latest = latestBy(enr.data.filter((e) => e.program_id === p.id && inYear(e)));
      return sum + Number(latest?.total_enrolled ?? 0);
    }, 0);

  const major = programs.length > 0 && programs.every(isMajor);
  const options = [{ value: "all", label: "All" }, ...programs.map((p) => ({ value: String(p.id), label: programChip(p) }))];

  return (
    <>
      <PageHeader crumb="Retention" title="Retention" subtitle="Search and review student movement and reasons for leaving." />

      <Card><RetentionTiles counts={countTypes(records)} enrolled={enrolled} /></Card>

      <div className="ap-toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search student name or number…" />
        <Pills label="Program" options={options} value={scope} onChange={setScope} />
      </div>

      <Card>
        {recs.loading ? <Loading /> : rows.length === 0 ? <Empty>No retention records found.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  {["Name", "Student No.", major ? "Major" : "Program", "Type", "Reason", "Date"].map((h) => (
                    <th key={h} className="py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 strong">{r.student_name}</td>
                    <td className="py-3 px-4">{r.student_no}</td>
                    <td className="py-3 px-4">{isMajor(r.program) ? programChip(r.program) : r.program?.code}</td>
                    <td className="py-3 px-4"><TypeBadge type={r.type} /></td>
                    <td className="py-3 px-4">{r.reason}</td>
                    <td className="py-3 px-4">{formatDate(r.record_date)}</td>
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