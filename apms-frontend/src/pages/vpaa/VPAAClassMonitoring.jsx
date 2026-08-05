import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function VPAAClassMonitoring() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [periods, setPeriods] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    academic_period_id: "",
    school_id: "",
    program_id: "",
    subject_name: "",
    subject_code: "",
    instructor_name: "",
    total_students: "",
    passing: "",
    failing: "",
    incomplete: "",
    dropped: "",
    passing_rate: "",
    notes: "",
  });

  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    api.get("/academic-periods").then((res) => setPeriods(res.data));
    api.get("/class-monitoring").then((res) => setData(res.data)).finally(() => setLoading(false));
    api.get("/schools").then((res) => setSchools(res.data));
  }, []);

  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
    setForm({ ...form, school_id: schoolId, program_id: "" });
    if (schoolId) {
      const res = await api.get(`/programs?school_id=${schoolId}`);
      setPrograms(res.data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/class-monitoring", { ...form });
      setSuccess("Class monitoring record submitted successfully!");
      setShowForm(false);
      const res = await api.get("/class-monitoring");
      setData(res.data);
      setForm({
        academic_period_id: "", school_id: "", program_id: "",
        subject_name: "", subject_code: "", instructor_name: "",
        total_students: "", passing: "", failing: "",
        incomplete: "", dropped: "", passing_rate: "", notes: "",
      });
    } catch {
      setError("Failed to submit. Please check all fields.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Class Monitoring 📓</h1>
        <p className="text-red-200 text-sm mt-1">Input and view class monitoring records.</p>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#7b1113] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5e0d0f] transition">
          {showForm ? "Cancel" : "+ Add New Record"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">New Class Monitoring Record</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Academic Period</label>
              <select name="academic_period_id" value={form.academic_period_id} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="">Select period...</option>
                {periods.map(p => <option key={p.id} value={p.id}>{p.school_year} - {p.semester} Semester</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">School</label>
              <select name="school_id" value={form.school_id} onChange={handleSchoolChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="">Select school...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Program</label>
              <select name="program_id" value={form.program_id} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="">Select program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject Name</label>
              <input type="text" name="subject_name" value={form.subject_name} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="e.g. Calculus..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Subject Code</label>
              <input type="text" name="subject_code" value={form.subject_code} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="e.g. MATH101..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Instructor Name</label>
              <input type="text" name="instructor_name" value={form.instructor_name} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="Full name..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Students</label>
              <input type="number" name="total_students" value={form.total_students} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Passing</label>
              <input type="number" name="passing" value={form.passing} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Failing</label>
              <input type="number" name="failing" value={form.failing} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Incomplete</label>
              <input type="number" name="incomplete" value={form.incomplete} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Dropped</label>
              <input type="number" name="dropped" value={form.dropped} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Passing Rate (%)</label>
              <input type="number" name="passing_rate" value={form.passing_rate} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" placeholder="0.00" step="0.01" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                rows={3} placeholder="Add any notes here..." />
            </div>
          </div>
          <button onClick={handleSubmit}
            className="mt-4 bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition">
            Submit
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Class Monitoring Records</h3>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : data.length === 0 ? <p className="text-gray-400 text-sm">No records yet.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Instructor</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.subject_name}</td>
                  <td className="py-3 px-4">{row.instructor_name}</td>
                  <td className="py-3 px-4">{row.total_students}</td>
                  <td className="py-3 px-4 font-semibold">{row.passing_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}