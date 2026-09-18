import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function DHEmployees() {
  const [periods, setPeriods] = useState([]);
  const activePeriodId = periods.find((p) => p.is_active)?.id || "";
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    academic_period_id: activePeriodId,
    employee_name: "",
    position: "",
    employment_type: "",
  };
  const [form, setForm] = useState(emptyForm);

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

  // Backend scopes this to the DH's own school + program automatically.
  const loadData = async () => {
    const res = await api.get("/employees");
    setSubmissions(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      academic_period_id: row.academic_period_id,
      employee_name: row.employee_name,
      position: row.position ?? "",
      employment_type: row.employment_type,
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, form);
        setSuccess("Resubmitted for Dean review!");
        setEditId(null);
      } else {
        await api.post("/employees", form);
        setSuccess("Submitted for Dean review!");
      }
      setForm(emptyForm);
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
        <h1 className="text-2xl font-bold">Employees 🧑‍💼</h1>
        <p className="text-red-200 text-sm mt-1">
          Submit part-time/full-time employee data for your program. You can edit while it's pending or
          rejected — it locks once your Dean approves it.
        </p>
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
            <label className="text-sm font-medium text-gray-700">Employee Name</label>
            <input type="text" name="employee_name" value={form.employee_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="Full name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Position</label>
            <input type="text" name="position" value={form.position} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. Instructor" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Employment Type</label>
            <select name="employment_type" value={form.employment_type} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select type...</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : editId ? "Resubmit" : "Submit"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm); }}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Your Submissions</h3>
        {submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Position</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.employee_name}</td>
                  <td className="py-3 px-4">{row.position}</td>
                  <td className="py-3 px-4 capitalize">{row.employment_type?.replace("_", " ")}</td>
                  <td className="py-3 px-4">
                    {statusBadge(row.status)}
                    {row.status === 'rejected' && <p className="text-red-500 text-xs mt-1">{row.rejection_reason}</p>}
                  </td>
                  <td className="py-3 px-4">
                    {(row.status === 'rejected') && (
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