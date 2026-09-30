import { useEffect, useState } from "react";
import api from "../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const badgeClass = (status) =>
  status === "dean_approved" ? "bg-blue-100 text-blue-700"
  : status === "approved" ? "bg-green-100 text-green-700"
  : status === "rejected" ? "bg-red-100 text-red-700"
  : "bg-yellow-100 text-yellow-700";

const badgeLabel = (status) => (status === "dean_approved" ? "Awaiting VPAA" : status);

// Shared Dean page: one tab per program under the Dean's own school
// (e.g. SCS -> BSCS, BSIT), newest submission first. Set byProgram={false}
// for school-level categories that have no program column (Faculty
// Performance, Achievements) — those render as a single list.
//
// Search: typing searches EVERY program of the Dean's school at once (a
// Program column appears so results make sense). Optional `filter` adds a
// dropdown, e.g. { label: "Type", field: "employment_type", options: [...] }.
export default function DeanReviewPage({ title, subtitle, uri, columns, byProgram = true, filter = null }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");

  useEffect(() => {
    if (byProgram && user?.school_id) {
      api.get(`/programs?school_id=${user.school_id}`)
        .then((res) => {
          setPrograms(res.data);
          if (res.data.length) setActiveProgram(res.data[0].id);
        })
        .catch(() => setPrograms([]));
    }
    loadData();
  }, []);

  // Backend already scopes this to the Dean's own school.
  const loadData = () => {
    setLoading(true);
    api.get(uri)
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    setError("");
    try {
      await api.put(`${uri}/${id}/review`, { status: "dean_approved" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve.");
    }
  };

  const handleReject = async (id) => {
    setError("");
    try {
      await api.put(`${uri}/${id}/review`, { status: "rejected", rejection_reason: rejectReason });
      setRejectId(null);
      setRejectReason("");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject.");
    }
  };

  const showTabs = byProgram && programs.length > 0;
  const q = query.trim().toLowerCase();
  const searching = q !== "";

  const haystack = (row) =>
    [
      ...columns.map((c) => c.render(row)),
      row.program?.code,
      row.status === "dean_approved" ? "awaiting vpaa" : row.status,
      fmtDate(row.created_at),
    ]
      .map((v) => String(v ?? ""))
      .join(" ")
      .toLowerCase();

  let rows = data;
  if (filter && filterValue !== "all") rows = rows.filter((r) => r[filter.field] === filterValue);
  if (searching) rows = rows.filter((r) => haystack(r).includes(q));
  else if (showTabs) rows = rows.filter((r) => r.program_id === activeProgram);
  rows = [...rows].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const shownColumns = searching && showTabs
    ? [{ label: "Program", render: (r) => r.program?.code }, ...columns]
    : columns;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-red-200 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this list..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                aria-label="Clear search">✕</button>
            )}
          </div>
          {filter && (
            <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
              <option value="all">All {filter.label}s</option>
              {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>

        {showTabs && (
          <div className={`flex flex-wrap gap-2 mb-2 transition-opacity ${searching ? "opacity-40" : ""}`}>
            {programs.map((p) => {
              const pending = data.filter((r) => r.program_id === p.id && r.status === "pending").length;
              return (
                <button
                  key={p.id}
                  onClick={() => { setQuery(""); setActiveProgram(p.id); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2
                    ${activeProgram === p.id && !searching ? "bg-[#7b1113] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {p.code}
                  {pending > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
                      ${activeProgram === p.id && !searching ? "bg-white text-[#7b1113]" : "bg-yellow-100 text-yellow-700"}`}>
                      {pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {searching && showTabs && <p className="text-xs text-gray-400 mb-4">Searching all programs.</p>}
        {showTabs && !searching && <div className="mb-3" />}

        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : rows.length === 0 ? (
          <p className="text-gray-400 text-sm">{searching ? `No results for “${query.trim()}”.` : "No submissions yet."}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {shownColumns.map((c) => (
                  <th key={c.label} className="text-left py-3 px-4 text-gray-500 font-medium">{c.label}</th>
                ))}
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Submitted</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {shownColumns.map((c) => (
                    <td key={c.label} className={`py-3 px-4 ${c.className || ""}`}>{c.render(row)}</td>
                  ))}
                  <td className="py-3 px-4">{fmtDate(row.created_at)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${badgeClass(row.status)}`}>
                      {badgeLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {row.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(row.id)}
                          className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600 transition">
                          Approve
                        </button>
                        <button onClick={() => setRejectId(row.id)}
                          className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition">
                          Reject
                        </button>
                      </div>
                    )}
                    {row.status === "rejected" && (
                      <p className="text-red-500 text-xs">{row.rejection_reason}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Reason for Rejection</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={4} placeholder="Enter reason for rejection..." />
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleReject(rejectId)} disabled={!rejectReason.trim()}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                Confirm Reject
              </button>
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}