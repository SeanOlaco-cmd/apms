import { useState, useEffect } from "react";
import api from "../../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const EDUCATION_OPTIONS = [
  "Bachelor's Degree",
  "Master's Degree (units)",
  "Master's Degree",
  "Doctorate (units)",
  "Doctorate",
];

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
    employee_no: "",
    position: "",
    employment_type: "",
    date_hired: "",
    highest_education: "",
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
      employee_no: row.employee_no ?? "",
      position: row.position ?? "",
      employment_type: row.employment_type,
      date_hired: row.date_hired ? String(row.date_hired).slice(0, 10) : "",
      highest_education: row.highest_education ?? "",
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    // Empty optional fields are sent as null so the backend doesn't try to
    // validate "" as a date.
    const payload = {
      ...form,
      employee_no: form.employee_no || null,
      date_hired: form.date_hired || null,
      highest_education: form.highest_education || null,
    };
    try {
      if (editId) {
        await api.put(`/employees/${editId}`, payload);
        setSuccess("Resubmitted for Dean review!");
        setEditId(null);
      } else {
        await api.post("/employees", payload);
        setSuccess("Submitted for Dean review!");
      }
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
      ${status === 'dean_approved' ? 'bg-blue-100 text-blue-700' :
        status === 'approved' ? 'bg-green-100 text-green-700' :
        status === 'rejected' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'}`}>
      {status === 'dean_approved' ? 'Awaiting VPAA' : status}
    </span>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Employees 🧑‍💼</h1>
        <p className="text-red-200 text-sm mt-1">
          Submit faculty and employee data for your program. If your Dean or the VPAA sends an entry back,
          you can edit and resubmit it here.
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
            <label className="text-sm font-medium text-gray-700">Employee No. (optional)</label>
            <input type="text" name="employee_no" value={form.employee_no} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. 2019-0042" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Position</label>
            <input type="text" name="position" value={form.position} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. Instructor" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Employment Type</label>
            <select name="employment_type" value={form.employment_type} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select type...</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Highest Education (optional)</label>
            <select name="highest_education" value={form.highest_education} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select...</option>
              {EDUCATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Hired (optional)</label>
            <input type="date" name="date_hired" value={form.date_hired} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Emp. No.</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Position</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Education</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Submitted</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...submissions]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.employee_no ?? "—"}</td>
                  <td className="py-3 px-4">{row.employee_name}</td>
                  <td className="py-3 px-4">{row.position}</td>
                  <td className="py-3 px-4 capitalize">{row.employment_type?.replace("_", " ")}</td>
                  <td className="py-3 px-4">{row.highest_education ?? "—"}</td>
                  <td className="py-3 px-4">{fmtDate(row.created_at)}</td>
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