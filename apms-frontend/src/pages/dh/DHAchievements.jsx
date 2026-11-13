import { useState, useEffect } from "react";
import api from "../../api/axios";
import { YEAR_LEVELS, TYPE_OPTIONS, isStudent, recipientLabel, yearSection } from "../../lib/achievements";

const emptyForm = (periodId = "") => ({
  academic_period_id: periodId,
  recipient_type: "faculty",
  faculty_name: "",
  year_level: "",
  section: "",
  achievement_title: "",
  type: "other",
  date_awarded: "",
  awarding_body: "",
  description: "",
});

const inputCls =
  "mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]";

export default function DHAchievements() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const activePeriodId = periods.find((p) => p.is_active)?.id || "";
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());

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

  // Achievements are school-level, so a DH sees the whole school's submissions.
  const loadData = async () => {
    const res = await api.get("/achievements");
    setSubmissions(res.data.filter((d) => d.school_id == user.school_id));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Switching to Faculty clears year/section so stale student details never get sent.
  const setRecipient = (value) =>
    setForm((f) => ({
      ...f,
      recipient_type: value,
      ...(value === "faculty" ? { year_level: "", section: "" } : {}),
    }));

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      academic_period_id: row.academic_period_id,
      recipient_type: row.recipient_type || "faculty",
      faculty_name: row.faculty_name,
      year_level: row.year_level ?? "",
      section: row.section ?? "",
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
        await api.put(`/achievements/${editId}`, form);
        setSuccess("Achievement updated and resubmitted!");
        setEditId(null);
      } else {
        await api.post("/achievements", form);
        setSuccess("Achievement submitted!");
      }
      setForm(emptyForm(activePeriodId));
      loadData();
    } catch (err) {
      const firstFieldError = err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
      setError(firstFieldError || err.response?.data?.message || "Failed to submit. Please check all fields.");
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

  const student = form.recipient_type === "student";

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Achievements 🏆</h1>
        <p className="text-red-200 text-sm mt-1">Submit faculty and student achievements for your school.</p>
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

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Awarded To</label>
            <div className="mt-1 inline-flex rounded-lg border border-gray-300 overflow-hidden">
              {[["faculty", "Faculty"], ["student", "Student"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setRecipient(value)}
                  className={`px-5 py-2 text-sm font-medium transition
                    ${form.recipient_type === value ? "bg-[#7b1113] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={student ? "" : "col-span-2"}>
            <label className="text-sm font-medium text-gray-700">{student ? "Student Name" : "Faculty Name"}</label>
            <input type="text" name="faculty_name" value={form.faculty_name} onChange={handleChange}
              className={inputCls} placeholder="Full name..." />
          </div>

          {student && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Year Level</label>
                <select name="year_level" value={form.year_level} onChange={handleChange} className={inputCls}>
                  <option value="">Select...</option>
                  {YEAR_LEVELS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Section</label>
                <input type="text" name="section" value={form.section} onChange={handleChange}
                  maxLength={20} className={inputCls} placeholder="e.g. A" />
              </div>
            </div>
          )}

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Achievement Title</label>
            <input type="text" name="achievement_title" value={form.achievement_title} onChange={handleChange}
              className={inputCls} placeholder={student ? "e.g. 1st Place, Regional Programming Contest..." : "e.g. Best Researcher Award..."} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Date Awarded</label>
            <input type="date" name="date_awarded" value={form.date_awarded} onChange={handleChange} className={inputCls} />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Awarding Body</label>
            <input type="text" name="awarding_body" value={form.awarding_body} onChange={handleChange}
              className={inputCls} placeholder="e.g. CHED, DOST..." />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className={inputCls} rows={3} placeholder="Brief description..." />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : editId ? "Update Submission" : "Submit"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm(activePeriodId)); }}
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Recipient</th>
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
                  <td className="py-3 px-4">
                    <p className="font-medium">{row.faculty_name}</p>
                    <p className="text-xs text-gray-400">
                      {[recipientLabel(row), isStudent(row) ? yearSection(row) : ""].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className="py-3 px-4">{row.achievement_title}</td>
                  <td className="py-3 px-4 capitalize">{row.type}</td>
                  <td className="py-3 px-4">{row.date_awarded ?? "—"}</td>
                  <td className="py-3 px-4">
                    {statusBadge(row.status)}
                    {row.status === 'rejected' && <p className="text-red-500 text-xs mt-1">{row.rejection_reason}</p>}
                  </td>
                  <td className="py-3 px-4">
                    {row.status === 'rejected' && (
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