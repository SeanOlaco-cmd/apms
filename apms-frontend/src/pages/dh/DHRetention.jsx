import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHRetention() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    academic_period_id: "",
    retention_rate: "",
    continuing_students: "",
    dropped_students: "",
    transferred_students: "",
    graduated_students: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    api.get("/retention").then((res) => {
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
      await api.post("/retention", {
        ...form,
        school_id: user.school_id,
        program_id: user.program_id,
      });
      setSuccess("Retention data submitted successfully! Waiting for Dean approval.");
      setForm({
        academic_period_id: "",
        retention_rate: "",
        continuing_students: "",
        dropped_students: "",
        transferred_students: "",
        graduated_students: "",
        notes: "",
      });
      const res = await api.get("/retention");
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
        <h1 className="text-2xl font-bold">Retention Rates 📈</h1>
        <p className="text-red-200 text-sm mt-1">Submit retention data for your program.</p>
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
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Retention Rate (%)</label>
            <input type="number" name="retention_rate" value={form.retention_rate} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0.00" step="0.01" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Continuing Students</label>
            <input type="number" name="continuing_students" value={form.continuing_students} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Dropped Students</label>
            <input type="number" name="dropped_students" value={form.dropped_students} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Transferred Students</label>
            <input type="number" name="transferred_students" value={form.transferred_students} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Graduated Students</label>
            <input type="number" name="graduated_students" value={form.graduated_students} onChange={handleChange}
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Retention Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Continuing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropped</th>
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