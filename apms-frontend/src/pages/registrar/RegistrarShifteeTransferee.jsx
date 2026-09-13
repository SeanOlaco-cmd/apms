import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function RegistrarShifteeTransferee() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    school_id: "",
    program_id: "",
    academic_period_id: "",
    total_shiftees: "",
    shiftees_in: "",
    shiftees_out: "",
    total_transferees: "",
    transferees_in: "",
    transferees_out: "",
    total_dropouts: "",
    notes: "",
  });

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    api.get("/schools").then((res) => setSchools(res.data));
    loadData();
  }, []);

  useEffect(() => {
    if (form.school_id) {
      api.get(`/programs?school_id=${form.school_id}`).then((res) => setPrograms(res.data));
    } else {
      setPrograms([]);
    }
  }, [form.school_id]);

  const loadData = async () => {
    const res = await api.get("/shiftee-transferee");
    setSubmissions(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "school_id") {
      setForm({ ...form, school_id: value, program_id: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => setForm({
    school_id: "", program_id: "", academic_period_id: "", total_shiftees: "", shiftees_in: "",
    shiftees_out: "", total_transferees: "", transferees_in: "", transferees_out: "", total_dropouts: "", notes: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/shiftee-transferee", { ...form, submitted_by: user.id });
      setSuccess("Data submitted successfully! This entry is now locked — contact an admin if it needs correcting.");
      resetForm();
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
        <h1 className="text-2xl font-bold">Shiftee, Transferee & Dropout Data 🔄</h1>
        <p className="text-red-200 text-sm mt-1">Submit this data for any school and program. Submissions lock once saved.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">New Submission</h3>
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">School</label>
            <select name="school_id" value={form.school_id} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select school...</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Program</label>
            <select name="program_id" value={form.program_id} onChange={handleChange} disabled={!form.school_id}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113] disabled:bg-gray-100">
              <option value="">Select program...</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Academic Period</label>
            <select name="academic_period_id" value={form.academic_period_id} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="">Select period...</option>
              {periods.map(p => <option key={p.id} value={p.id}>{p.school_year} - {p.semester} Semester</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Shiftees</label>
            <input type="number" name="total_shiftees" value={form.total_shiftees} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Shiftees In</label>
            <input type="number" name="shiftees_in" value={form.shiftees_in} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Shiftees Out</label>
            <input type="number" name="shiftees_out" value={form.shiftees_out} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Transferees</label>
            <input type="number" name="total_transferees" value={form.total_transferees} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Transferees In</label>
            <input type="number" name="transferees_in" value={form.transferees_in} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Transferees Out</label>
            <input type="number" name="transferees_out" value={form.transferees_out} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Total Dropouts</label>
            <input type="number" name="total_dropouts" value={form.total_dropouts} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={3} placeholder="Add any notes here..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50">
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Submissions (locked)</h3>
        {submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Shiftees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Transferees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropouts</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.total_shiftees}</td>
                  <td className="py-3 px-4">{row.total_transferees}</td>
                  <td className="py-3 px-4 text-red-500">{row.total_dropouts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}