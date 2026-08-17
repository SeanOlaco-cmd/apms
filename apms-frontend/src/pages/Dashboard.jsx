import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [studentPerfData, setStudentPerfData] = useState([]);
  const [stats, setStats] = useState({ totalEnrolled: 0, passingRate: 0, totalSchools: 6, totalPrograms: 13 });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    setUser(JSON.parse(stored));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [enrollment, studentPerf] = await Promise.all([
        api.get("/enrollment"),
        api.get("/student-performance"),
      ]);

      // Filter approved only
      const approvedEnrollment = enrollment.data.filter(d => d.status === "approved");
      const approvedStudentPerf = studentPerf.data.filter(d => d.status === "approved");

      // Total enrolled
      const totalEnrolled = approvedEnrollment.reduce((sum, d) => sum + d.total_enrolled, 0);

      // Average passing rate
      const avgPassingRate = approvedStudentPerf.length > 0
        ? (approvedStudentPerf.reduce((sum, d) => sum + parseFloat(d.passing_rate), 0) / approvedStudentPerf.length).toFixed(1)
        : 0;

      setStats({ totalEnrolled, passingRate: avgPassingRate, totalSchools: 6, totalPrograms: 13 });

      // Enrollment by school for bar chart
      const schoolMap = {};
      approvedEnrollment.forEach(d => {
        const code = d.school?.code || "Unknown";
        if (!schoolMap[code]) schoolMap[code] = 0;
        schoolMap[code] += d.total_enrolled;
      });
      setEnrollmentData(Object.entries(schoolMap).map(([school, total]) => ({ school, total })));

      // Passing rate by school for line chart
      const perfMap = {};
      approvedStudentPerf.forEach(d => {
        const code = d.school?.code || "Unknown";
        if (!perfMap[code]) perfMap[code] = [];
        perfMap[code].push(parseFloat(d.passing_rate));
      });
      setStudentPerfData(Object.entries(perfMap).map(([school, rates]) => ({
        school,
        passing_rate: (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1)
      })));

    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const statCards = [
    { label: "Total Schools", value: stats.totalSchools, icon: "🏫", color: "bg-blue-50 text-blue-700" },
    { label: "Total Programs", value: stats.totalPrograms, icon: "📚", color: "bg-green-50 text-green-700" },
    { label: "Total Enrolled", value: stats.totalEnrolled, icon: "👨‍🎓", color: "bg-yellow-50 text-yellow-700" },
    { label: "Avg Passing Rate", value: `${stats.passingRate}%`, icon: "📈", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">
          Academic Performance Monitoring System — City College of Tagaytay
        </p>
      </div>

      {/* Stat Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Enrollment by School Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">📊 Enrollment by School</h3>
          {enrollmentData.length === 0 ? (
            <p className="text-gray-400 text-sm">No approved enrollment data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#7b1113" name="Total Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Passing Rate by School Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">📈 Passing Rate by School</h3>
          {studentPerfData.length === 0 ? (
            <p className="text-gray-400 text-sm">No approved student performance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={studentPerfData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="passing_rate" stroke="#7b1113" name="Passing Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Schools Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Schools Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {['SCS', 'SED', 'SHTM', 'SAS', 'SPES', 'SBM'].map((school) => (
            <div key={school} className="border border-gray-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold text-xs">
                {school}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{school}</p>
                <p className="text-xs text-gray-400">
                  {enrollmentData.find(d => d.school === school)?.total
                    ? `${enrollmentData.find(d => d.school === school).total} enrolled`
                    : "No data yet"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}