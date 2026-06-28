import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHAccreditation() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    accrediting_body: "",
    level: "Not Accredited",
    date_accredited: "",
    expiry_date: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    api.get("/accreditation").then((res) => {
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
      await api.post("/accreditation", {
        ...form,
        school_id: user.school_id,
        program_id: user.program_id,
      });
      setSuccess("Accreditation data submitted! Waiting for Dean approval.");
      setForm({
        accrediting_body: "",
        level: "Not Accredited",
        date_accredited: "",
        expiry_date: "",
        status: "pending",
        notes: "",
      });
      const res = await api.get("/accreditation");
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
        <h1 className="text-2xl font-bold">Accreditation Status 📜</h1>
        <p className="text-red-200 text-sm mt-1">Submit accreditation status for your program.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">New Submission</h3>

        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Accrediting Body</label>
            <input type="text" name="accrediting_body" value={form.accrediting_body} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="e.g. ACSCU, PACUCOA..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Level</label>
            <select name="level" value={form.level} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="Not Accredited">Not Accredited</option>
              <option value="Candidate">Candidate</option>
              <option value="Level I">Level I</option>
              <option value="Level II">Level II</option>
              <option value="Level III">Level III</option>
              <option value="Level IV">Level IV</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Accreditation Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Accredited</label>
            <input type="date" name="date_accredited" value={form.date_accredited} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="date" name="expiry_date" value={form.expiry_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Accrediting Body</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Level</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date Accredited</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Expiry</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.accrediting_body}</td>
                  <td className="py-3 px-4 font-semibold">{row.level}</td>
                  <td className="py-3 px-4">{row.date_accredited ?? "—"}</td>
                  <td className="py-3 px-4">{row.expiry_date ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'active' ? 'bg-green-100 text-green-700' :
                        row.status === 'expired' ? 'bg-red-100 text-red-700' :
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