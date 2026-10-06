import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const CASE_LABELS = {
  dropout: "Dropout",
  shift_course: "Shift Course",
  transfer_school: "Transfer School",
};

const badgeColor = (t) =>
  t === "dropout" ? "bg-red-100 text-red-700"
  : t === "shift_course" ? "bg-blue-100 text-blue-700"
  : "bg-amber-100 text-amber-700";

const UNDO_WINDOW_MS = 5000;

// Embedded inside Retention (caseTypes=["dropout"]) and Shiftee/Transferee
// (caseTypes=["shift_course","transfer_school"]) — NOT a standalone page.
//
// Cases are immutable once logged (no edit). Removal is instant with a
// short undo window — nothing is actually sent to the server until the
// undo window closes, so a misclick costs nothing. Once a case has been
// bundled into a submitted Retention record (retention_submission_id is
// set), it's locked: no remove button at all, just a 🔒 note. The Dean
// (dhMode=false) sees everything, including removed cases struck through
// with who removed them and when — nothing disappears without a trace
// once it could matter.
export default function StudentCasesSection({ caseTypes, activePeriodId, dhMode = false }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState(null); // { id }
  const timeoutRef = useRef(null);

  const emptyForm = {
    academic_period_id: activePeriodId,
    student_no: "",
    student_name: "",
    year_level: "",
    section: "",
    birthdate: "",
    case_type: caseTypes.length === 1 ? caseTypes[0] : "",
    destination: "",
    reason: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    setForm((f) => ({ ...f, academic_period_id: f.academic_period_id || activePeriodId }));
  }, [activePeriodId]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const loadData = () => {
    setLoading(true);
    api.get("/student-cases")
      .then((res) => setCases(res.data.filter((c) => caseTypes.includes(c.case_type))))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    const payload = {
      ...form,
      year_level: form.year_level || null,
      section: form.section || null,
      birthdate: form.birthdate || null,
      destination: form.destination || null,
    };
    try {
      await api.post("/student-cases", payload);
      setForm(emptyForm);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please check all fields.");
    }
  };

  // Optimistically hides the row and starts the undo countdown. The
  // actual DELETE only fires if the countdown finishes without Undo.
  const startRemoval = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const timeoutId = setTimeout(async () => {
      try {
        await api.delete(`/student-cases/${id}`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to remove.");
      }
      setPendingRemoval(null);
      loadData();
    }, UNDO_WINDOW_MS);
    timeoutRef.current = timeoutId;
    setPendingRemoval({ id });
  };

  const undoRemoval = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPendingRemoval(null);
  };

  const needsDestination = form.case_type === "shift_course" || form.case_type === "transfer_school";
  const q = query.trim().toLowerCase();
  const rows = cases
    .filter((r) => typeFilter === "all" || r.case_type === typeFilter)
    .filter((r) => dhMode ? r.id !== pendingRemoval?.id : true)
    .filter((r) =>
      !q || [r.student_no, r.student_name, r.section, r.year_level, r.destination, r.program?.code]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Individual Student Cases</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Student-level detail behind the numbers above. Visible only to you{!dhMode ? "" : " and your Dean"} — never sent to VPAA or the President.
          </p>
        </div>
        {dhMode && (
          <button onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
            className="bg-[#7b1113] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5e0d0f] transition">
            {showForm ? "Cancel" : "+ Add Case"}
          </button>
        )}
      </div>

      {dhMode && pendingRemoval && (
        <div className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg mb-4 flex items-center justify-between">
          <span>Case removed.</span>
          <button onClick={undoRemoval} className="underline font-semibold">Undo</button>
        </div>
      )}

      {dhMode && showForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-5 bg-gray-50">
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-3">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
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
            {caseTypes.length > 1 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Case Type</label>
                <select name="case_type" value={form.case_type} onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                  <option value="">Select type...</option>
                  {caseTypes.map((t) => <option key={t} value={t}>{CASE_LABELS[t]}</option>)}
                </select>
              </div>
            )}
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
                placeholder="Why the student left..." />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Once added, this case can be removed but not edited. Double-check the details before saving.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSubmit}
              className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition text-sm">
              Add Case
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
        </div>
        {caseTypes.length > 1 && (
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
            <option value="all">All Types</option>
            {caseTypes.map((t) => <option key={t} value={t}>{CASE_LABELS[t]}</option>)}
          </select>
        )}
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p>
      : rows.length === 0 ? <p className="text-gray-400 text-sm">No case records yet.</p>
      : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {!dhMode && <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>}
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Student No.</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Year/Section</th>
              {caseTypes.length > 1 && <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>}
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Reason</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Logged</th>
              {dhMode && <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const removed = !!row.removed_at;
              const locked = !!row.retention_submission_id;
              return (
                <tr key={row.id} className={`border-b border-gray-50 hover:bg-gray-50 ${removed ? "opacity-50" : ""}`}>
                  {!dhMode && <td className="py-3 px-4">{row.program?.code}</td>}
                  <td className={`py-3 px-4 ${removed ? "line-through" : ""}`}>{row.student_no}</td>
                  <td className={`py-3 px-4 ${removed ? "line-through" : ""}`}>{row.student_name}</td>
                  <td className="py-3 px-4">{row.year_level ?? "—"}{row.section ? ` / ${row.section}` : ""}</td>
                  {caseTypes.length > 1 && (
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor(row.case_type)}`}>
                        {CASE_LABELS[row.case_type]}
                      </span>
                      {row.destination && <p className="text-xs text-gray-400 mt-1">→ {row.destination}</p>}
                    </td>
                  )}
                  <td className="py-3 px-4 max-w-xs truncate" title={row.reason}>{row.reason}</td>
                  <td className="py-3 px-4">
                    {fmtDate(row.created_at)}
                    {!dhMode && removed && (
                      <p className="text-xs text-red-400 mt-1">Removed {fmtDate(row.removed_at)} by {row.removed_by?.name ?? "—"}</p>
                    )}
                  </td>
                  {dhMode && (
                    <td className="py-3 px-4">
                      {locked ? (
                        <span className="text-xs text-gray-400">🔒 Submitted</span>
                      ) : (
                        <button onClick={() => startRemoval(row.id)}
                          className="text-red-500 hover:text-red-700 text-lg leading-none" title="Remove">
                          ✕
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}