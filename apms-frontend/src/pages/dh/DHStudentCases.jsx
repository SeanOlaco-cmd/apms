import { useState, useEffect } from "react";
import api from "../../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const CASE_LABELS = {
  dropout: "Dropout",
  shift_course: "Shift Course",
  transfer_school: "Transfer School",
};

export default function DHStudentCases() {
  const [periods, setPeriods] = useState([]);
  const activePeriodId = periods.find((p) => p.is_active)?.id || "";
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");

  const emptyForm = {
    academic_period_id: activePeriodId,
    student_no: "",
    student_name: "",
    year_level: "",
    section: "",
    birthdate: "",
    case_type: "",
    destination: "",
    reason: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    api.get("/academic-periods").then((res) => {
      setPeriods(res.data);
      const active = res.data.find((p) => p.is_active);
      if (active) setForm((f) => (f.academic_period_id ? f : { ...f, academic_period_id: active.id }));
    });
    loadData();
  }, []);

  // Backend scopes this to the DH's own school + program automatically.
  const loadData = async () => {
    const res = await api.get("/student-cases");
    setCases(res.data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      academic_period_id: row.academic_period_id,
      student_no: row.student_no,
      student_name: row.student_name,
      year_level: row.year_level ?? "",
      section: row.section ?? "",
      birthdate: row.birthdate ? String(row.birthdate).slice(0, 10) : "",
      case_type: row.case_type,
      destination: row.destination ?? "",
      reason: row.reason,
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this case record? This can't be undone.")) return;
    await api.delete(`/student-cases/${id}`);
    loadData();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const payload = {
      ...form,
      year_level: form.year_level || null,
      section: form.section || null,
      birthdate: form.birthdate || null,
      destination: form.destination || null,
    };
    try {
      if (editId) {
        await api.put(`/student-cases/${editId}`, payload);
        setSuccess("Case record updated!");
        setEditId(null);
      } else {
        await api.post("/student-cases", payload);
        setSuccess("Case record added!");
      }
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const needsDestination = form.case_type === "shift_course" || form.case_type === "transfer_school";

  const q = query.trim().toLowerCase();
  const rows = cases.filter((r) =>
    !q || [r.student_no, r.student_name, r.section, r.year_level, r.destination, CASE_LABELS[r.case_type]]
      .map((v) => String(v ?? "").toLowerCase())
      .some((v) => v.includes(q))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Student Cases 📄</h1>
        <p className="text-red-200 text-sm mt-1">
          Individual dropout, shift-course, and transfer-school records for your program. Visible only to you and your Dean.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">{editId ? "Edit Case" : "New Case"}</h3>
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
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Student No.</label>
            <input type="text" name="student_no" value={form.student_no} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. 2023-0070" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Student Name</label>
            <input type="text" name="student_name" value={form.student_name} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="Full name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Year Level (optional)</label>
            <select name="year_level" value={form.year_level} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select...</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Section they came from (optional)</label>
            <input type="text" name="section" value={form.section} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="e.g. BSCS-2A" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Birthdate (optional)</label>
            <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Case Type</label>
            <select name="case_type" value={form.case_type} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select type...</option>
              <option value="dropout">Dropout</option>
              <option value="shift_course">Shift Course</option>
              <option value="transfer_school">Transfer School</option>
            </select>
          </div>
          {needsDestination && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                {form.case_type === "shift_course" ? "Shifted To (Program)" : "Transferred To (School)"}
              </label>
              <input type="text" name="destination" value={form.destination} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder={form.case_type === "shift_course" ? "e.g. BSIT" : "e.g. Name of school"} />
            </div>
          )}
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Reason</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              placeholder="Why the student dropped out, shifted, or transferred..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : editId ? "Update Case" : "Add Case"}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Your Recorded Cases</h3>
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
        </div>
        {rows.length === 0 ? <p className="text-gray-400 text-sm">No case records yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Student No.</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Year/Section</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Logged</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.student_no}</td>
                  <td className="py-3 px-4">{row.student_name}</td>
                  <td className="py-3 px-4">{row.year_level ?? "—"}{row.section ? ` / ${row.section}` : ""}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${row.case_type === 'dropout' ? 'bg-red-100 text-red-700' :
                        row.case_type === 'shift_course' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'}`}>
                      {CASE_LABELS[row.case_type]}
                    </span>
                    {row.destination && <p className="text-xs text-gray-400 mt-1">→ {row.destination}</p>}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate" title={row.reason}>{row.reason}</td>
                  <td className="py-3 px-4">{fmtDate(row.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(row)}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition">
                        Delete
                      </button>
                    </div>
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