import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHAchievements() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const activePeriodId = periods.find((p) => p.is_active)?.id || "";
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    academic_period_id: "",
    faculty_name: "",
    achievement_title: "",
    type: "other",
    date_awarded: "",
    awarding_body: "",
    description: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => {
      setPeriods(res.data);
      const active = res.data.find((p) => p.is_active);
      if (active) {
        setForm((f) => (f.academic_period_id ? f : { ...f, academic_period_id: active.id }));
      }
    });
    loadData();
  }, []);

  const loadData = async () => {
    const res = await api.get("/achievements");
    const mine = res.data.filter(d => d.school_id == user.school_id);
    setSubmissions(mine);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      academic_period_id: row.academic_period_id,
      faculty_name: row.faculty_name,
      achievement_title: row.achievement_title,
      type: row.type,
      date_awarded: row.date_awarded ?? "",
      awarding_body: row.awarding_body ?? "",
      description: row.description ?? "",
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (editId) {
        await api.put(`/achievements/${editId}`, { ...form, status: "pending" });
        setSuccess("Achievement updated successfully!");
        setEditId(null);
      } else {
        await api.post("/achievements", { ...form, school_id: user.school_id });
        setSuccess("Achievement submitted!");
      }
      setForm({ academic_period_id: activePeriodId, faculty_name: "", achievement_title: "", type: "other", date_awarded: "", awarding_body: "", description: "" });
      loadData();
    } catch {
      setError("Failed to submit. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Faculty Achievements 🏆</h1>
        <p className="text-red-200 text-sm mt-1">Submit faculty achievements for your school.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">{editId ? "Edit Submission" : "New Submission"}</h3>
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Academic Period</label>
            <div className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500">
              {(() => {
                const p = periods.find((pd) => pd.id == form.academic_period_id);
                return p ? `${p.school_year} - ${p.semester} Semester` : "Loading current period...";
              })()}
              <p className="text-xs text-gray-400 mt-1">Set automatically to the current academic period — cannot be changed here.</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Faculty Name</label>
            <input type="text" name="faculty_name" value={form.faculty_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="Full name..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Achievement Title</label>
            <input type="text" name="achievement_title" value={form.achievement_title} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. Best Researcher Award..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="research">Research</option>
              <option value="publication">Publication</option>
              <option value="award">Award</option>
              <option value="certification">Certification</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Awarded</label>
            <input type="date" name="date_awarded" value={form.date_awarded} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Awarding Body</label>
            <input type="text" name="awarding_body" value={form.awarding_body} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. CHED, DOST..." />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={3} placeholder="Brief description..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : editId ? "Update Submission" : "Submit"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ academic_period_id: activePeriodId, faculty_name: "", achievement_title: "", type: "other", date_awarded: "", awarding_body: "", description: "" }); }}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">My Submissions</h3>
        {submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Faculty</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Achievement</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.faculty_name}</td>
                  <td className="py-3 px-4">{row.achievement_title}</td>
                  <td className="py-3 px-4 capitalize">{row.type}</td>
                  <td className="py-3 px-4">{row.date_awarded ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {(row.status === 'pending' || row.status === 'rejected') && (
                      <button onClick={() => handleEdit(row)}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                        Edit
                      </button>
                    )}
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