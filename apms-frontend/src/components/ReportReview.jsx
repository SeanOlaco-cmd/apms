import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, ArrowRight, Check, ClipboardCheck, UserMinus, X } from "lucide-react";
import api from "../api/axios";
import useApi, { apiError } from "../lib/useApi";
import { ENROLLMENT_YEARS, isMajor, programChip, yearLabel } from "../lib/academic";
import { formatDate, num } from "../lib/format";
import { countTypes } from "./RetentionTiles";
import {
  Button, Card, Field, Loading, LockedPeriod, Notice, PageHeader, StatusBadge, TextArea, Tile, TileGrid, TypeBadge,
} from "./ui";

const ro = (value) => <input className="ap-input" readOnly value={value ?? ""} />;

// Read-only view of one submitted report with the approve / reject controls.
// viewer "dean" acts on `pending` reports, viewer "vpaa" on `dean_approved` ones.
export default function ReportReview({ viewer, backPath }) {
  const { kind, id } = useParams();
  const navigate = useNavigate();
  const isRetention = kind === "retention";
  const base = isRetention ? `/retention-reports/${id}` : `/enrollment/${id}`;
  const { data: report, loading, error } = useApi(base, { initial: null });

  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const actionable = !!report && (viewer === "vpaa" ? report.status === "dean_approved" : report.status === "pending");

  const decide = async (approve) => {
    if (!approve && !reason.trim()) { setErr("Please enter a reason before rejecting."); return; }
    setBusy(true); setErr("");
    try {
      await api.put(`${base}/${viewer === "vpaa" ? "vpaa-review" : "review"}`, {
        status: approve ? (viewer === "vpaa" ? "approved" : "dean_approved") : "rejected",
        rejection_reason: approve ? undefined : reason.trim(),
      });
      navigate(backPath);
    } catch (e) {
      setErr(apiError(e));
      setBusy(false);
    }
  };

  const program = report?.program;
  const period = report?.academic_period;
  const records = report?.records ?? [];
  const c = countTypes(records);
  const programText = program ? (isMajor(program) ? programChip(program) : program.code) : "";

  return (
    <>
      <PageHeader crumb="Approval of Reports" onBack={() => navigate(backPath)} showYear={false}
        title="Review Submission"
        subtitle={report
          ? `${isRetention ? "Retention" : "Enrollment Data"} · ${programText} · ${period?.school_year?.replace("-", "–")} · ${period?.semester} Sem · submitted by Dept. Head, ${program?.code} on ${formatDate(report.created_at)}`
          : ""}
        right={report && (actionable
          ? <span className="ap-badge b-pending">Pending review</span>
          : <StatusBadge status={report.status} viewer={viewer} />)} />

      {loading && <Card><Loading /></Card>}
      {error && <Notice kind="error">{error}</Notice>}

      {report && !isRetention && (
        <Card>
          <h2 className="ap-card-title mb-4">Submitted Enrollment Data</h2>
          <div className="ap-form-grid">
            <LockedPeriod period={period} />
            <Field label="Total Enrolled">{ro(report.total_enrolled)}</Field>
            <Field label="Male Count">{ro(report.male_count)}</Field>
            <Field label="Female Count">{ro(report.female_count)}</Field>
            <Field label="New Students">{ro(report.new_students)}</Field>
            <Field label="Old Students" className="span-2">{ro(report.old_students)}</Field>

            <div className="span-2">
              <p className="ap-label">New and old students per year level</p>
              <div className="ap-table-wrap">
                <table className="ap-table">
                  <thead><tr>{["Year level", "New students", "Old students", "Total"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr></thead>
                  <tbody>
                    {ENROLLMENT_YEARS.map((y) => (
                      <tr key={y}>
                        <td className="py-3 px-4 strong">{yearLabel(y)}</td>
                        <td className="py-3 px-4">{num(report[`y${y}_new`])}</td>
                        <td className="py-3 px-4">{num(report[`y${y}_old`])}</td>
                        <td className="py-3 px-4 strong">{num(Number(report[`y${y}_new`] || 0) + Number(report[`y${y}_old`] || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Field label="Notes from department head" className="span-2">
              <textarea className="ap-textarea" readOnly value={report.notes ?? ""} />
            </Field>
          </div>
        </Card>
      )}

      {report && isRetention && (
        <>
          <Card>
            <TileGrid min="9.5rem">
              <Tile icon={ClipboardCheck} tone="blue" label="Total Records" value={num(records.length)} note="submitted this semester" />
              <Tile icon={UserMinus} tone="red" label="Dropped" value={num(c.dropped)} note={`${c.dropped} record${c.dropped === 1 ? "" : "s"}`} />
              <Tile icon={ArrowLeft} tone="green" label="Transferee In" value={num(c.transferee_in)} note={`${c.transferee_in || "no"} record${c.transferee_in === 1 ? "" : "s"}`} />
              <Tile icon={ArrowRight} tone="lavender" label="Transferee Out" value={num(c.transferee_out)} note={`${c.transferee_out || "no"} record${c.transferee_out === 1 ? "" : "s"}`} />
              <Tile icon={ArrowLeftRight} tone="orange" label="Shiftee In" value={num(c.shiftee_in)} note={`${c.shiftee_in || "no"} record${c.shiftee_in === 1 ? "" : "s"}`} />
              <Tile icon={ArrowRight} tone="lavender" label="Shiftee Out" value={num(c.shiftee_out)} note={`${c.shiftee_out || "no"} record${c.shiftee_out === 1 ? "" : "s"}`} />
            </TileGrid>
          </Card>
          <Card>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead><tr>{["Name", "Student No.", isMajor(program) ? "Major" : "Program", "Type", "Reason", "Date"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr></thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 px-4 strong">{r.student_name}</td>
                      <td className="py-3 px-4">{r.student_no}</td>
                      <td className="py-3 px-4">{programText}</td>
                      <td className="py-3 px-4"><TypeBadge type={r.type} /></td>
                      <td className="py-3 px-4">{r.reason}</td>
                      <td className="py-3 px-4">{formatDate(r.record_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {report && (
        <Card>
          {err && <div className="mb-3"><Notice kind="error">{err}</Notice></div>}
          {actionable ? (
            <>
              <label className="ap-label" htmlFor="reject-reason">
                Reason for rejection <span style={{ fontWeight: 400 }}>(required only if rejecting)</span>
              </label>
              <input id="reject-reason" className="ap-input" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Add feedback for the department head…" />
              <div className="ap-form-actions">
                <div className="flex gap-3">
                  <Button icon={Check} onClick={() => decide(true)} disabled={busy}>Approve</Button>
                  <Button variant="reject" icon={X} onClick={() => decide(false)} disabled={busy}>Reject</Button>
                </div>
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(backPath)}>Back to reports</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <StatusBadge status={report.status} viewer={viewer} />
                {report.status === "rejected" && <span>Rejected: {report.rejection_reason}</span>}
                {report.status !== "rejected" && <span>This report has already been reviewed.</span>}
              </div>
              <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(backPath)}>Back to reports</Button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}