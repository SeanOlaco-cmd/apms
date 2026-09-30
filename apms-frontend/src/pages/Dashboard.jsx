import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const SCHOOLS = ["SCS", "SED", "SHTM", "SAS", "SPES", "SBM"];
const MAROON = "#7b1113";
const AMBER = "#d97706";
const TEAL = "#0f766e";

// Only records the VPAA has given final approval ('approved') reach this page.
const fetchApproved = (uri) =>
  api.get(uri).then((res) => res.data.filter((d) => d.status === "approved")).catch(() => []);

const groupRows = (rows, keyFn) => {
  const map = new Map();
  rows.forEach((r) => {
    const k = keyFn(r) ?? "Unknown";
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  });
  return [...map.entries()];
};

const num = (v) => Number(v) || 0;

const sumBy = (rows, keyFn, fields) =>
  groupRows(rows, keyFn).map(([name, rs]) => {
    const o = { name };
    fields.forEach(([key, field]) => { o[key] = rs.reduce((s, r) => s + num(r[field]), 0); });
    return o;
  });

const avgBy = (rows, keyFn, field) =>
  groupRows(rows, keyFn).map(([name, rs]) => ({
    name,
    value: Number((rs.reduce((s, r) => s + num(r[field]), 0) / rs.length).toFixed(1)),
  }));

const average = (rows, field) =>
  rows.length ? (rows.reduce((s, r) => s + num(r[field]), 0) / rows.length).toFixed(1) : null;

function ChartCard({ title, data, children, domain }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-gray-400 text-sm">No approved data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={domain} />
            <Tooltip />
            <Legend />
            {children}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState("ALL");
  const [d, setD] = useState({
    enrollment: [], retention: [], shiftee: [], faculty: [],
    achievements: [], board: [], student: [], employees: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    const [enrollment, retention, shiftee, faculty, achievements, board, student, employees] = await Promise.all([
      fetchApproved("/enrollment"),
      fetchApproved("/retention"),
      fetchApproved("/shiftee-transferee"),
      fetchApproved("/faculty-performance"),
      fetchApproved("/achievements"),
      fetchApproved("/board-exam-results"),
      fetchApproved("/student-performance"),
      fetchApproved("/employees"),
    ]);
    setD({ enrollment, retention, shiftee, faculty, achievements, board, student, employees });
  };

  // Narrow everything to the selected school, then group: by school when
  // viewing all schools, by program (or by period for school-level data)
  // when a single school is selected.
  const scope = (rows) => (selected === "ALL" ? rows : rows.filter((r) => r.school?.code === selected));
  const periodLabel = (r) => `${r.academic_period?.school_year} ${r.academic_period?.semester}`;
  const programKey = (r) => (selected === "ALL" ? r.school?.code : r.program?.code);
  const schoolLevelKey = (r) => (selected === "ALL" ? r.school?.code : periodLabel(r));
  const ordered = (arr) =>
    selected === "ALL"
      ? [...arr].sort((a, b) => SCHOOLS.indexOf(a.name) - SCHOOLS.indexOf(b.name))
      : [...arr].sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const enrollment = scope(d.enrollment);
  const retention = scope(d.retention);
  const shiftee = scope(d.shiftee);
  const faculty = scope(d.faculty);
  const achievements = scope(d.achievements);
  const board = scope(d.board);
  const student = scope(d.student);
  const employees = scope(d.employees);

  const totalEnrolled = enrollment.reduce((s, r) => s + num(r.total_enrolled), 0);
  const statCards = [
    { label: "Total Enrolled", value: enrollment.length ? totalEnrolled : "—", icon: "👨‍🎓", color: "bg-yellow-50 text-yellow-700" },
    { label: "Avg Retention Rate", value: average(retention, "retention_rate") ? `${average(retention, "retention_rate")}%` : "—", icon: "📈", color: "bg-green-50 text-green-700" },
    { label: "Avg Passing Rate", value: average(student, "passing_rate") ? `${average(student, "passing_rate")}%` : "—", icon: "🎓", color: "bg-blue-50 text-blue-700" },
    { label: "Avg Board Passing Rate", value: average(board, "passing_rate") ? `${average(board, "passing_rate")}%` : "—", icon: "📝", color: "bg-red-50 text-red-700" },
  ];

  const enrollmentChart = ordered(sumBy(enrollment, programKey, [["male", "male_count"], ["female", "female_count"]]));
  const retentionChart = ordered(avgBy(retention, programKey, "retention_rate"));
  const studentChart = ordered(avgBy(student, programKey, "passing_rate"));
  const boardChart = ordered(avgBy(board, programKey, "passing_rate"));
  const shifteeChart = ordered(sumBy(shiftee, programKey, [["shiftees", "total_shiftees"], ["transferees", "total_transferees"], ["dropouts", "total_dropouts"]]));
  const facultyChart = ordered(sumBy(faculty, schoolLevelKey, [["fullTime", "full_time"], ["partTime", "part_time"]]));
  const employeeChart = ordered(
    groupRows(employees, programKey).map(([name, rs]) => ({
      name,
      fullTime: rs.filter((r) => r.employment_type === "full_time").length,
      partTime: rs.filter((r) => r.employment_type === "part_time").length,
    }))
  );
  const achievementChart = ordered(groupRows(achievements, schoolLevelKey).map(([name, rs]) => ({ name, count: rs.length })));

  const scopeLabel = selected === "ALL" ? "by school" : `by program — ${selected}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">
          Academic Performance Monitoring System — City College of Tagaytay. Showing only data approved by the Dean and the VPAA.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", ...SCHOOLS].map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${selected === s ? "bg-[#7b1113] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {s === "ALL" ? "All Schools" : s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-gray-500 text-xs font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title={`📊 Enrollment (${scopeLabel})`} data={enrollmentChart}>
          <Bar dataKey="male" fill={MAROON} name="Male" />
          <Bar dataKey="female" fill={AMBER} name="Female" />
        </ChartCard>

        <ChartCard title={`📈 Retention Rate (${scopeLabel})`} data={retentionChart} domain={[0, 100]}>
          <Bar dataKey="value" fill={TEAL} name="Retention Rate (%)" />
        </ChartCard>

        <ChartCard title={`🎓 Student Passing Rate (${scopeLabel})`} data={studentChart} domain={[0, 100]}>
          <Bar dataKey="value" fill={MAROON} name="Passing Rate (%)" />
        </ChartCard>

        <ChartCard title={`📝 Board Exam Passing Rate (${scopeLabel})`} data={boardChart} domain={[0, 100]}>
          <Bar dataKey="value" fill={AMBER} name="Passing Rate (%)" />
        </ChartCard>

        <ChartCard title={`🔄 Shiftees, Transferees & Dropouts (${scopeLabel})`} data={shifteeChart}>
          <Bar dataKey="shiftees" fill={MAROON} name="Shiftees" />
          <Bar dataKey="transferees" fill={TEAL} name="Transferees" />
          <Bar dataKey="dropouts" fill={AMBER} name="Dropouts" />
        </ChartCard>

        <ChartCard title={`👨‍🏫 Faculty: Full-time vs Part-time (${selected === "ALL" ? "by school" : "by period"})`} data={facultyChart}>
          <Bar dataKey="fullTime" fill={MAROON} name="Full Time" />
          <Bar dataKey="partTime" fill={AMBER} name="Part Time" />
        </ChartCard>

        <ChartCard title={`🧑‍💼 Employees (${scopeLabel})`} data={employeeChart}>
          <Bar dataKey="fullTime" fill={TEAL} name="Full Time" />
          <Bar dataKey="partTime" fill={AMBER} name="Part Time" />
        </ChartCard>

        <ChartCard title={`🏆 Faculty Achievements (${selected === "ALL" ? "by school" : "by period"})`} data={achievementChart}>
          <Bar dataKey="count" fill={MAROON} name="Achievements" />
        </ChartCard>
      </div>
    </div>
  );
}