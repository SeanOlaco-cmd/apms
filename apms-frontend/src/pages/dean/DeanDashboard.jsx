import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function DeanDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "dean") {
        navigate("/login");
      } else {
        setUser(parsed);
        loadStats(parsed.school_id);
      }
    }
  }, [navigate]);

  const loadStats = async (schoolId) => {
    try {
      const [enrollment, recruitment, retention] = await Promise.all([
        api.get("/enrollment"),
        api.get("/recruitment"),
        api.get("/retention"),
      ]);

      const allData = [
        ...enrollment.data.filter(d => d.school_id == schoolId),
        ...recruitment.data.filter(d => d.school_id == schoolId),
        ...retention.data.filter(d => d.school_id == schoolId),
      ];

      setStats({
        pending: allData.filter(d => d.status === "pending").length,
        approved: allData.filter(d => d.status === "approved").length,
        rejected: allData.filter(d => d.status === "rejected").length,
      });
    } catch {
      console.error("Failed to load stats");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">
          Review and approve submissions from your department heads.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">❌</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Review Submissions</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Enrollment", icon: "📋", path: "/dean/enrollment" },
            { label: "Recruitment", icon: "🎯", path: "/dean/recruitment" },
            { label: "Retention", icon: "📈", path: "/dean/retention" },
            { label: "Faculty Performance", icon: "👨‍🏫", path: "/dean/faculty-performance" },
            { label: "Workforce Needs", icon: "👥", path: "/dean/workforce" },
            { label: "Achievements", icon: "🏆", path: "/dean/achievements" },
            { label: "Accreditation", icon: "📜", path: "/dean/accreditation" },
            { label: "Partnerships", icon: "🤝", path: "/dean/partnerships" },
            { label: "Student Performance", icon: "🎓", path: "/dean/student-performance" },
          ].map((item) => (
            <div key={item.path} onClick={() => navigate(item.path)}
              className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition">
              <div className="text-2xl">{item.icon}</div>
              <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}