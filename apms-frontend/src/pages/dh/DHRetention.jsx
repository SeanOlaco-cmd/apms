import { useState, useEffect } from "react";
import api from "../../api/axios";
import StudentCasesSection from "../../components/StudentCasesSection";

export default function DHRetention() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const activePeriodId = periods.find((p) => p.is_active)?.id || "";
  const [submissions, setSubmissions] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [draftDroppedCount, setDraftDroppedCount] = useState(0);
  const [draftTransferredCount, setDraftTransferredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ graduated_students: "", notes: "" });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
  }, []);

  useEffect(() => {
    if (activePeriodId) loadData();
  }, [activePeriodId]);

  const loadData = async () => {
    const [retentionRes, enrollmentRes, casesRes] = await Promise.all([
      api.get("/retention"),
      api.get("/enrollment"),
      api.get("/student-cases"),
    ]);
    setSubmissions(retentionRes.data.filter(d => d.school_id == user.school_id && d.program_id == user.program_id));

    const approvedEnrollment = enrollmentRes.data
      .filter(e => e.school_id == user.school_id && e.program_id == user.program_id
        && e.academic_period_id == activePeriodId && e.status === 'approved')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    setEnrollment(approvedEnrollment ?? null);

    const draftCases = casesRes.data.filter(c =>
      !c.removed_at && !c.retention_submission_id && c.academic_period_id == activePeriodId
    );
    setDraftDroppedCount(draftCases.filter(c => c.case_type === 'dropout').length);
    setDraftTransferredCount(draftCases.filter(c => c.case_type === 'transfer_school').length);
  };

  const blockInvalidKeys = (e) => { if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault(); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value === "" ? "" : String(Math.max(0, Number(value))) });
  };

  // A rejected submission for the CURRENT period gets resubmitted (same
  // record, recomputed from whatever the case list looks like now) rather
  // than creating a brand new one.
  const rejectedForThisPeriod = submissions.find(
    s => s.status === 'rejected' && s.academic_period_id == activePeriodId
  );
  const hasInFlightSubmission = submissions.some(
    s => ['pending', 'dean_approved', 'approved'].includes(s.status) && s.academic_period_id == activePeriodId
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const payload = {
      graduated_students: form.graduated_students || 0,
      notes: form.notes,
    };
    try {
      if (rejectedForThisPeriod) {
        await api.put(`/retention/${rejectedForThisPeriod.id}`, payload);
        setSuccess("Retention report resubmitted for review!");
      } else {
        await api.post("/retention", { academic_period_id: activePeriodId, ...payload });
        setSuccess("Retention report submitted for Dean review!");
      }
      setForm({ graduated_students: "", notes: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
      ${status === 'dean_approved' ? 'bg-blue-100 text-blue-700' :
        status === 'approved' ? 'bg-green-100 text-green-700' :
        status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'}`}>
      {status === 'dean_approved' ? 'Awaiting VPAA' : status}
    </span>
  );

  // Live preview only — the authoritative numbers are computed server-side
  // at the moment of submission.
  const graduated = Number(form.graduated_students) || 0;
  const totalEnrolled = enrollment?.total_enrolled ?? null;
  const continuing = totalEnrolled !== null
    ? Math.max(0, totalEnrolled - draftDroppedCount - draftTransferredCount - graduated) : null;
  const denom = continuing !== null ? continuing + draftDroppedCount + draftTransferredCount : null;
  const previewRate = denom && denom > 0 ? ((continuing / denom) * 100).toFixed(2) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Retention Rates 📈</h1>
        <p className="text-red-200 text-sm mt-1">
          Log Dropout and Transfer School cases below as they happen — each one updates the live preview below.
          When you're ready, submit a Retention report for Dean review.
        </p>
      </div>

      <StudentCasesSection caseTypes={["dropout", "transfer_school"]} activePeriodId={activePeriodId} dhMode={true} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {rejectedForThisPeriod ? "Resubmit Retention Report" : "Submit Retention Report"}
        </h3>
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        {!enrollment && (
          <div className="bg-yellow-50 text-yellow-800 text-sm px-4 py-3 rounded-lg mb-4">
            No VPAA-approved Enrollment data exists yet for this period. Get Enrollment fully approved first —
            Retention needs it to calculate the rate.
          </div>
        )}

        {rejectedForThisPeriod && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            This period's submission was rejected: "{rejectedForThisPeriod.rejection_reason}". Adjust your case list
            above if needed, then resubmit.
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 mb-5">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Enrolled</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{totalEnrolled ?? "—"}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">Dropped (logged)</p>
            <p className="text-xl font-bold text-red-600 mt-1">{draftDroppedCount}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">Transferred Out (logged)</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{draftTransferredCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">Continuing (preview)</p>
            <p className="text-xl font-bold text-green-600 mt-1">{continuing ?? "—"}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">Retention Rate (preview)</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{previewRate !== null ? `${previewRate}%` : "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Graduated Students</label>
            <input type="number" name="graduated_students" value={form.graduated_students} onChange={handleChange} onKeyDown={blockInvalidKeys}
              min="0"
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            <p className="text-xs text-gray-400 mt-1">The only manual number left — graduating has no case log.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={2} placeholder="Add any notes here..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading || !enrollment || (hasInFlightSubmission && !rejectedForThisPeriod)}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : rejectedForThisPeriod ? "Resubmit for Review" : "Submit for Dean Review"}
          </button>
        </div>
        {hasInFlightSubmission && !rejectedForThisPeriod && (
          <p className="text-xs text-gray-400 mt-2">
            A submission for this period is already in review below. Any cases you log now will count toward your NEXT report.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">My Submissions</h3>
        {submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Retention Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Continuing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropped</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Transferred Out</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.retention_rate}%</td>
                  <td className="py-3 px-4">{row.continuing_students}</td>
                  <td className="py-3 px-4 text-red-500">{row.dropped_students}</td>
                  <td className="py-3 px-4 text-amber-600">{row.transferred_students}</td>
                  <td className="py-3 px-4">
                    {statusBadge(row.status)}
                    {row.status === 'rejected' && <p className="text-red-500 text-xs mt-1">{row.rejection_reason}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}