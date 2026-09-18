import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function VPAAAcademicPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    school_year: "",
    semester: "1st",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academic-periods");
      setPeriods(res.data);
    } catch {
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/academic-periods", form);
      setSuccess("Academic period created.");
      setForm({ school_year: "", semester: "1st", start_date: "", end_date: "", is_active: true });
      loadData();
    } catch {
      setError("Failed to create period. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (period) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/academic-periods/${period.id}`, { ...period, is_active: true });
      setSuccess(`${period.school_year} - ${period.semester} is now the current period.`);
      loadData();
    } catch {
      setError("Failed to set active period.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Academic Periods 🗓️</h1>
        <p className="text-red-200 text-sm mt-1">
          Manually set the current academic period. DH submission forms and reports use whichever period is marked Active.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">New Academic Period</h3>

        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">School Year</label>
            <input type="text" name="school_year" value={form.school_year} onChange={handleChange}
              placeholder="e.g. 2025-2026"
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
            <label className="text-sm font-medium text-gray-700">Start Date (optional)</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">End Date (optional)</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange}
              className="h-4 w-4" />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Make this the current active period (turns off any other active period)
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={handleSubmit} disabled={saving || !form.school_year}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {saving ? "Saving..." : "Create Period"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Academic Periods</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : periods.length === 0 ? (
          <p className="text-gray-400 text-sm">No academic periods yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School Year</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Semester</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Start</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">End</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {!p.is_active && (
                      <button onClick={() => handleSetActive(p)}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                        Set Active
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