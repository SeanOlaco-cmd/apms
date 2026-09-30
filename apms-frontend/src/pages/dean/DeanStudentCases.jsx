import { useEffect, useState } from "react";
import api from "../../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const CASE_LABELS = {
  dropout: "Dropout",
  shift_course: "Shift Course",
  transfer_school: "Transfer School",
};

// Read-only for the Dean — the submitting DH owns edit/delete rights.
// No VPAA/President access at all; see the migration comment for why.
export default function DeanStudentCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoading(true);
    api.get("/student-cases")
      .then((res) => setCases(res.data))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  };

  const q = query.trim().toLowerCase();
  const rows = cases
    .filter((r) => typeFilter === "all" || r.case_type === typeFilter)
    .filter((r) =>
      !q || [r.student_no, r.student_name, r.section, r.year_level, r.destination, r.program?.code, CASE_LABELS[r.case_type]]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );

  const counts = {
    dropout: cases.filter((c) => c.case_type === "dropout").length,
    shift_course: cases.filter((c) => c.case_type === "shift_course").length,
    transfer_school: cases.filter((c) => c.case_type === "transfer_school").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Student Cases 📄</h1>
        <p className="text-red-200 text-sm mt-1">
          Individual dropout, shift-course, and transfer-school records logged by your department heads.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Dropouts</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{counts.dropout}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Shift Course</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{counts.shift_course}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Transfer School</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.transfer_school}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student no., name, program..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
            <option value="all">All Types</option>
            <option value="dropout">Dropout</option>
            <option value="shift_course">Shift Course</option>
            <option value="transfer_school">Transfer School</option>
          </select>
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : rows.length === 0 ? <p className="text-gray-400 text-sm">No case records found.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Student No.</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Year/Section</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Birthdate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Logged</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.student_no}</td>
                  <td className="py-3 px-4">{row.student_name}</td>
                  <td className="py-3 px-4">{row.year_level ?? "—"}{row.section ? ` / ${row.section}` : ""}</td>
                  <td className="py-3 px-4">{fmtDate(row.birthdate)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}