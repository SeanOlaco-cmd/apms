import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function NSTOReports() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    barangay_name: "",
    activity_title: "",
    activity_date: "",
    participants: "",
    student_volunteers: "",
    hours_rendered: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/nstp-reports");
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/nstp-reports", { ...form });
      setSuccess("NSTP report submitted successfully!");
      setShowForm(false);
      setForm({
        barangay_name: "",
        activity_title: "",
        activity_date: "",
        participants: "",
        student_volunteers: "",
        hours_rendered: "",
        description: "",
      });
      loadData();
    } catch {
      setError("Failed to submit. Please check all fields.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">NSTP Reports 🌿</h1>
        <p className="text-red-200 text-sm mt-1">Submit NSTP activity reports to VPAA.</p>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#7b1113] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5e0d0f] transition">
          {showForm ? "Cancel" : "+ Add New Report"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">New NSTP Report</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Barangay Name</label>
              <input type="text" name="barangay_name" value={form.barangay_name} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="e.g. Barangay San Jose..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Activity Title</label>
              <input type="text" name="activity_title" value={form.activity_title} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="e.g. Tree Planting..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Activity Date</label>
              <input type="date" name="activity_date" value={form.activity_date} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Participants</label>
              <input type="number" name="participants" value={form.participants} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Student Volunteers</label>
              <input type="number" name="student_volunteers" value={form.student_volunteers} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hours Rendered</label>
              <input type="number" name="hours_rendered" value={form.hours_rendered} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Description (optional)</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                rows={3} placeholder="Brief description of the activity..." />
            </div>
          </div>
          <button onClick={handleSubmit}
            className="mt-4 bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition">
            Submit Report
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">My Reports</h3>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : submissions.length === 0 ? <p className="text-gray-400 text-sm">No reports yet.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Barangay</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Activity</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Participants</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Volunteers</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Hours</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.barangay_name}</td>
                  <td className="py-3 px-4">{row.activity_title}</td>
                  <td className="py-3 px-4">{row.activity_date}</td>
                  <td className="py-3 px-4">{row.participants}</td>
                  <td className="py-3 px-4">{row.student_volunteers}</td>
                  <td className="py-3 px-4">{row.hours_rendered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}