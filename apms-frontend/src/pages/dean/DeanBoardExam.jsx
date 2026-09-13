import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DeanBoardExam() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    program_id: "",
    academic_period_id: "",
    exam_name: "",
    exam_date: "",
    total_examinees: "",
    total_passers: "",
    passing_rate: "",
    first_timers: "",
    first_timer_passers: "",
    first_timer_passing_rate: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    // Only this Dean's own school's programs — matches backend validation
    // that rejects a program_id belonging to a different school.
    if (user.school_id) {
      api.get(`/programs?school_id=${user.school_id}`).then((res) => setPrograms(res.data));
    }
    loadData();
  }, []);

  const loadData = async () => {
    const res = await api.get("/board-exam-results");
    setSubmissions(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => setForm({
    program_id: "", academic_period_id: "", exam_name: "", exam_date: "",
    total_examinees: "", total_passers: "", passing_rate: "",
    first_timers: "", first_timer_passers: "", first_timer_passing_rate: "", notes: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/board-exam-results", form);
      setSuccess("Submitted for VPAA review! This entry is now locked.");
      resetForm();
      loadData();
    } catch {
      setError("Failed to submit. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
      ${status === 'approved' ? 'bg-green-100 text-green-700' :
        status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'}`}>
      {status}
    </span>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Board Exam Results 📝</h1>
        <p className="text-red-200 text-sm mt-1">Submit board exam results for your school's programs. VPAA reviews and approves.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">New Submission</h3>
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Program</label>
            <select name="program_id" value={form.program_id} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select program...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Academic Period</label>
            <select name="academic_period_id" value={form.academic_period_id} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select period...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.school_year} - {p.semester} Semester</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Exam Name</label>
            <input type="text" name="exam_name" value={form.exam_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. LET, CPA Board" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Exam Date</label>
            <input type="date" name="exam_date" value={form.exam_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Examinees</label>
            <input type="number" name="total_examinees" value={form.total_examinees} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Passers</label>
            <input type="number" name="total_passers" value={form.total_passers} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Passing Rate (%)</label>
            <input type="number" step="0.01" name="passing_rate" value={form.passing_rate} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0.00" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">First Timers</label>
            <input type="number" name="first_timers" value={form.first_timers} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">First Timer Passers</label>
            <input type="number" name="first_timer_passers" value={form.first_timer_passers} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">First Timer Passing Rate (%)</label>
            <input type="number" step="0.01" name="first_timer_passing_rate" value={form.first_timer_passing_rate} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0.00" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={3} placeholder="Add any notes here..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Your Submissions</h3>
        {submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Exam</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Examinees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passers</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.exam_name}</td>
                  <td className="py-3 px-4">{row.total_examinees}</td>
                  <td className="py-3 px-4">{row.total_passers}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.passing_rate}%</td>
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