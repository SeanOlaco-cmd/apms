import { useState, useEffect } from "react";
import api from "../../api/axios";

const emptyForm = (periodId = "") => ({
  academic_period_id: periodId,
  total_faculty: "",
  full_time: "",
  part_time: "",
  average_evaluation_score: "",
  with_masters: "",
  with_doctorate: "",
  with_board_license: "",
  notes: "",
});

const inputCls =
  "mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]";

export default function DHFacultyPerformance() {
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

  // Faculty performance is school-level (no program_id column), so a DH sees
  // the submissions for their whole school, not just their own program.
  const loadData = async () => {
    const res = await api.get("/faculty-performance");
    setSubmissions(res.data.filter((d) => d.school_id == user.school_id));
  };

  const blockInvalidKeys = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({
      academic_period_id: row.academic_period_id,
      total_faculty: row.total_faculty,
      full_time: row.full_time,
      part_time: row.part_time,
      average_evaluation_score: row.average_evaluation_score,
      with_masters: row.with_masters,
      with_doctorate: row.with_doctorate,
      with_board_license: row.with_board_license,
      notes: row.notes ?? "",
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (editId) {
        await api.put(`/faculty-performance/${editId}`, form);
        setSuccess("Faculty performance data updated and resubmitted!");
        setEditId(null);
      } else {
        await api.post("/faculty-performance", form);
        setSuccess("Faculty performance data submitted successfully!");
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

  const numberField = (name, label, extra = {}) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type="number" name={name} value={form[name]} onChange={handleChange} onKeyDown={blockInvalidKeys}
        min="0" placeholder="0" className={inputCls} {...extra} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Faculty Performance 👨‍🏫</h1>
        <p className="text-red-200 text-sm mt-1">Submit faculty performance data for your school.</p>
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

          {numberField("total_faculty", "Total Faculty")}
          {numberField("average_evaluation_score", "Average Evaluation Score (0–5)", { max: "5", step: "0.01", placeholder: "0.00" })}
          {numberField("full_time", "Full-Time Faculty")}
          {numberField("part_time", "Part-Time Faculty")}
          {numberField("with_masters", "With Master's Degree")}
          {numberField("with_doctorate", "With Doctorate Degree")}
          {numberField("with_board_license", "With Board License")}

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="Add any notes here..." className={inputCls} />
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Faculty</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Full / Part Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Avg. Score</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.total_faculty}</td>
                  <td className="py-3 px-4">{row.full_time} / {row.part_time}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.average_evaluation_score}</td>
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