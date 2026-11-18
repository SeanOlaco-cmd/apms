import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, RefreshCw, User, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { countTypes } from "../../components/RetentionTiles";
import { formatDate, latestBy, num, pct } from "../../lib/format";
import {
  Card, Empty, Loading, PageHeader, SearchBox, SectionTitle, Tile, TileGrid, TypeBadge,
} from "../../components/ui";

export default function DHOverview() {
  const navigate = useNavigate();
  const { inYear } = useAcademic();
  const enr = useApi("/enrollment");
  const recs = useApi("/retention-records");
  const [query, setQuery] = useState("");

    // Rejected reports don't count anywhere on the overview — they are sent
  // back for correction, so their numbers aren't valid yet.
  const valid = enr.data.filter((r) => r.status !== "rejected");

  // The latest semester's report inside the selected academic year.
  const current = latestBy(valid.filter(inYear));
  const previous = current
    ? latestBy(valid.filter((r) => Number(r.academic_period_id) < Number(current.academic_period_id)))
    : null;
  const growth = current && previous && Number(previous.total_enrolled) > 0
    ? Math.round(((current.total_enrolled - previous.total_enrolled) / previous.total_enrolled) * 100)
    : null;
  const total = Number(current?.total_enrolled ?? 0);

    // Same rule for retention: skip records whose report was rejected.
  const records = recs.data.filter((r) => inYear(r) && r.report?.status !== "rejected");
  const c = countTypes(records);
  const needle = query.trim().toLowerCase();
  const recent = [...records]
    .filter((r) => !needle || [r.student_name, r.student_no, r.reason, r.record_date, formatDate(r.record_date)]
      .join(" ").toLowerCase().includes(needle))
    .sort((a, b) => String(b.record_date).localeCompare(String(a.record_date)))
    .slice(0, needle ? 10 : 5);

  const note = (n) => `${pct(n, total)} of enrollees`;

  return (
    <>
      <PageHeader eyebrow="Department Head Dashboard" title="Department Overview"
        subtitle="Monitor student enrollment and retention performance for your department." />

      <Card>
        <SectionTitle icon={Users} tone="green" title="Enrollment Data" subtitle="Total number of enrollees in your department." />
        {enr.loading ? <Loading /> : (
          <TileGrid min="10rem">
            <Tile icon={Users} tone="lavender" label="Total Enrollees" value={num(total)}
              note={growth === null ? "No previous term to compare" : `${growth >= 0 ? "▲ +" : "▼ "}${growth}% vs. last term`}
              noteClass={growth !== null && growth >= 0 ? "up" : ""} />
            <Tile icon={User} tone="blue" label="Male" value={num(current?.male_count)} note={note(current?.male_count)} />
            <Tile icon={User} tone="pink" label="Female" value={num(current?.female_count)} note={note(current?.female_count)} />
            <Tile icon={UserPlus} tone="green" label="New Students" value={num(current?.new_students)} note={note(current?.new_students)} />
            <Tile icon={UserCheck} tone="orange" label="Old Students" value={num(current?.old_students)} note={note(current?.old_students)} />
          </TileGrid>
        )}
        {!enr.loading && !current && <p className="ap-hint mt-3">No enrollment report for this academic year yet.</p>}
      </Card>

      <Card>
        <SectionTitle icon={RefreshCw} tone="green" title="Retention"
          subtitle="Track dropped, shiftee, and transferee students in your department." />
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))" }}>
          <div className="grid gap-3">
            <TileGrid min="8.5rem">
              <Tile icon={UserMinus} tone="red" label="Dropped" value={num(c.dropped)} note={note(c.dropped)} />
              <Tile icon={ArrowLeftRight} tone="purple" label="Shiftee" value={num(c.shiftees)} note={note(c.shiftees)} />
              <Tile icon={ArrowLeftRight} tone="blue" label="Transferee" value={num(c.transferees)} note={note(c.transferees)} />
            </TileGrid>
            <TileGrid min="7rem">
              <Tile small label="Transferee In" value={num(c.transferee_in)} />
              <Tile small label="Transferee Out" value={num(c.transferee_out)} />
              <Tile small label="Total Transferee" value={num(c.transferees)} />
              <Tile small label="Shiftee In" value={num(c.shiftee_in)} />
              <Tile small label="Shiftee Out" value={num(c.shiftee_out)} />
              <Tile small label="Total Shiftee" value={num(c.shiftees)} />
              <Tile small label="Total Dropout" value={num(c.dropped)} />
            </TileGrid>
          </div>

          <div className="min-w-0">
            <SearchBox value={query} onChange={setQuery} placeholder="Search by name, reason, date, or student number…" />
            <div className="flex items-center justify-between mt-4 mb-2">
              <h3 className="ap-card-title" style={{ fontSize: "1rem" }}>Recent Retention Records</h3>
              <button type="button" className="ap-crumb" onClick={() => navigate("/dh/retention")}>
                View All <ArrowRight size={14} />
              </button>
            </div>
            {recs.loading ? <Loading /> : recent.length === 0 ? <Empty>No retention records yet.</Empty> : (
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead>
                    <tr>{["Name", "Reason", "Date", "Student No.", "Type"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 px-4 strong">{r.student_name}</td>
                        <td className="py-3 px-4">{r.reason}</td>
                        <td className="py-3 px-4">{formatDate(r.record_date)}</td>
                        <td className="py-3 px-4">{r.student_no}</td>
                        <td className="py-3 px-4"><TypeBadge type={r.type} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}