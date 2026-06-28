import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHStudentPerformance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    academic_period_id: "",
    total_students: "",
    passing: "",
    failing: "",
    incomplete: "",
    dropped: "",
    passing_rate: "",
    average_gwa: "",
    latin_honors: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    api.get("/student-performance").then((res) => {
      const mine = res.data.filter(d => d.school_id == user.school_id);
      setSubmissions(mine);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/student-performance", {
        ...form,
        school_id: user.school_id,
        program_id: user.program_id,
      });
      setSuccess("Student performance data submitted! Waiting for Dean approval.");
      setForm({
        academic_period_id: "",
        total_students: "",
        passing: "",
        failing: "",
        incomplete: "",
        dropped: "",
        passing_rate: "",
        average_gwa: "",
        latin_honors: "",
        notes: "",
      });
      const res = await api.get("/student-performance");
      const mine = res.data.filter(d => d.school_id == user.school_id);
      setSubmissions(mine);
    } catch {
      setError("Failed to submit. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Student Performance 🎓</h1>
        <p className="text-red-200 text-sm mt-1">Submit student performance data for your program.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">New Submission</h3>

        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Academic Period</label>
            <select name="academic_period_id" value={form.academic_period_id} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select period...</option>
              {periods.map(p => (
                <option key={p.id} value={p.id}>{p.school_year} - {p.semester} Semester</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Students</label>
            <input type="number" name="total_students" value={form.total_students} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Passing</label>
            <input type="number" name="passing" value={form.passing} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Failing</label>
            <input type="number" name="failing" value={form.failing} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Incomplete</label>
            <input type="number" name="incomplete" value={form.incomplete} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Dropped</label>
            <input type="number" name="dropped" value={form.dropped} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Passing Rate (%)</label>
            <input type="number" name="passing_rate" value={form.passing_rate} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0.00" step="0.01" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Average GWA</label>
            <input type="number" name="average_gwa" value={form.average_gwa} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0.00" step="0.01" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Latin Honors</label>
            <input type="number" name="latin_honors" value={form.latin_honors} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={3} placeholder="Add any notes here..." />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="mt-4 bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit for Approval"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">My Submissions</h3>
        {submissions.length === 0 ? (
          <p className="text-gray-400 text-sm">No submissions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Failing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.total_students}</td>
                  <td className="py-3 px-4 text-green-600">{row.passing}</td>
                  <td className="py-3 px-4 text-red-500">{row.failing}</td>
                  <td className="py-3 px-4 font-semibold">{row.passing_rate}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {row.status}
                    </span>
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