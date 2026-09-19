import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function AdminAcademicPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const emptyForm = { school_year: "", semester: "1st", start_date: "", end_date: "", is_active: false };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academic-periods");
      setPeriods(res.data);
    } catch {
      setError("Failed to load academic periods.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editId) {
        await api.put(`/academic-periods/${editId}`, form);
        setSuccess("Period updated.");
      } else {
        await api.post("/academic-periods", form);
        setSuccess("Period created.");
      }
      setForm(emptyForm);
      setEditId(null);
      loadPeriods();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.semester?.[0] || "Save failed.";
      setError(msg);
    }
  };

  const handleEdit = (p) => {
    setForm({
      school_year: p.school_year,
      semester: p.semester,
      start_date: p.start_date ?? "",
      end_date: p.end_date ?? "",
      is_active: p.is_active,
    });
    setEditId(p.id);
    setError("");
    setSuccess("");
  };

  const handleSetActive = async (p) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/academic-periods/${p.id}`, { is_active: true });
      setSuccess("Period set as active.");
      loadPeriods();
    } catch {
      setError("Failed to activate period.");
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete academic period "${p.school_year} - ${p.semester}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/academic-periods/${p.id}`);
      setSuccess("Period deleted.");
      loadPeriods();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Academic Periods 🗓️</h1>
        <p className="text-red-200 text-sm mt-1">Manage the school years and semesters everyone submits data against.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">{editId ? "Edit Period" : "Create Period"}</h3>
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">School Year</label>
            <input type="text" name="school_year" value={form.school_year} onChange={handleChange}
              placeholder="2026-2027" required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Semester</label>
            <select name="semester" value={form.semester} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} id="is_active" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Set as active (only one can be active)</label>
          </div>
          <div className="col-span-2 flex gap-2 mt-2">
            <button type="submit" className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition">
              {editId ? "Update" : "Create"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); setError(""); setSuccess(""); }}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Periods</h3>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : periods.length === 0 ? <p className="text-gray-400 text-sm">No academic periods yet.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School Year</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Semester</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Start</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">End</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{p.school_year}</td>
                  <td className="py-3 px-4">{p.semester}</td>
                  <td className="py-3 px-4">{p.start_date ?? "—"}</td>
                  <td className="py-3 px-4">{p.end_date ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">Edit</button>
                    {!p.is_active && (
                      <button onClick={() => handleSetActive(p)} className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600 transition">Set Active</button>
                    )}
                    <button onClick={() => handleDelete(p)} className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition">Delete</button>
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