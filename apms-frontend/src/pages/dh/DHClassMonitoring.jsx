import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHClassMonitoring() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    academic_period_id: "",
    subject_name: "",
    subject_code: "",
    instructor_name: "",
    total_students: "",
    passing: "",
    failing: "",
    incomplete: "",
    dropped: "",
    passing_rate: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    api.get("/class-monitoring").then((res) => {
      const mine = res.data.filter(d => d.school_id == user.school_id && d.program_id == user.program_id);
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
      await api.post("/class-monitoring", {
        ...form,
        school_id: user.school_id,
        program_id: user.program_id,
      });
      setSuccess("Class monitoring record submitted successfully!");
      setForm({
        academic_period_id: "",
        subject_name: "",
        subject_code: "",
        instructor_name: "",
        total_students: "",
        passing: "",
        failing: "",
        incomplete: "",
        dropped: "",
        passing_rate: "",
        notes: "",
      });
      const res = await api.get("/class-monitoring");
      const mine = res.data.filter(d => d.school_id == user.school_id && d.program_id == user.program_id);
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
        <h1 className="text-2xl font-bold">Class Monitoring 📓</h1>
        <p className="text-red-200 text-sm mt-1">Submit class monitoring records for your program.</p>
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
            <label className="text-sm font-medium text-gray-700">Subject Name</label>
            <input type="text" name="subject_name" value={form.subject_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="e.g. Calculus..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Subject Code</label>
            <input type="text" name="subject_code" value={form.subject_code} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="e.g. MATH101..." />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Instructor Name</label>
            <input type="text" name="instructor_name" value={form.instructor_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="Full name..." />
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
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={3} placeholder="Add any notes here..." />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="mt-4 bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
          {loading ? "Submitting..." : "Submit"}
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Instructor</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.subject_name}</td>
                  <td className="py-3 px-4">{row.instructor_name}</td>
                  <td className="py-3 px-4">{row.total_students}</td>
                  <td className="py-3 px-4 font-semibold">{row.passing_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}