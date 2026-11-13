import { useMemo, useState } from "react";
import AchievementHighlights from "./AchievementHighlights";
import {
  TYPE_OPTIONS,
  TYPE_STYLES,
  kindOf,
  isStudent,
  recipientLabel,
  yearSection,
  formatDate,
} from "../lib/achievements";

// Newest first: the date it was awarded, falling back to when it was filed.
const sortKey = (r) => r.date_awarded || r.created_at || "";

const selectCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7b1113]";

export default function AchievementsBrowser({ data, initialView = "highlights" }) {
  const [view, setView] = useState(initialView);
  const [recipient, setRecipient] = useState("all");
  const [school, setSchool] = useState("all");
  const [type, setType] = useState("all");

  const schools = useMemo(
    () => [...new Set(data.map((d) => d.school?.code).filter(Boolean))].sort(),
    [data]
  );

  const counts = useMemo(
    () => ({
      all: data.length,
      faculty: data.filter((d) => kindOf(d) === "faculty").length,
      student: data.filter((d) => kindOf(d) === "student").length,
    }),
    [data]
  );

  const filtered = useMemo(
    () =>
      data
        .filter((d) => recipient === "all" || kindOf(d) === recipient)
        .filter((d) => school === "all" || d.school?.code === school)
        .filter((d) => type === "all" || d.type === type)
        .sort((a, b) => sortKey(b).localeCompare(sortKey(a))),
    [data, recipient, school, type]
  );

  const stats = [
    { label: "Total achievements", value: counts.all },
    { label: "Faculty", value: counts.faculty },
    { label: "Students", value: counts.student },
    { label: "Schools represented", value: schools.length },
  ];

  const chip = (value, label) => (
    <button key={value} onClick={() => setRecipient(value)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition
        ${recipient === value ? "bg-[#7b1113] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
      {label} <span className="opacity-70">({counts[value]})</span>
    </button>
  );

  const viewBtn = (value, label) => (
    <button key={value} onClick={() => setView(value)}
      className={`px-4 py-1.5 text-sm font-medium transition
        ${view === value ? "bg-[#7b1113] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-2xl font-bold text-[#7b1113]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {chip("all", "All")}
          {chip("faculty", "Faculty")}
          {chip("student", "Students")}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <select value={school} onChange={(e) => setSchool(e.target.value)} className={selectCls}>
            <option value="all">All schools</option>
            {schools.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
            <option value="all">All types</option>
            {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
            {viewBtn("highlights", "Highlights")}
            {viewBtn("table", "Table")}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 -mt-3">
        Showing {filtered.length} of {data.length} achievement{data.length === 1 ? "" : "s"}
      </p>

      {view === "highlights" ? (
        <AchievementHighlights items={filtered} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No achievements match these filters.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {["School", "Program", "Recipient", "Category", "Year & Section", "Achievement", "Type", "Awarding Body", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">{row.school?.code ?? "—"}</td>
                    <td className="py-3 px-4">{row.program?.code ?? "—"}</td>
                    <td className="py-3 px-4 font-medium">{row.faculty_name}</td>
                    <td className="py-3 px-4">{recipientLabel(row)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{isStudent(row) ? yearSection(row) || "—" : "—"}</td>
                    <td className="py-3 px-4">{row.achievement_title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${(TYPE_STYLES[row.type] || TYPE_STYLES.other).chip}`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{row.awarding_body || "—"}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(row.date_awarded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}