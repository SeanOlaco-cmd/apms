import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

const navItems = [
  { label: "Overview", icon: "📊", path: "/dashboard" },
  { label: "Enrollment", icon: "📋", path: "/dashboard/enrollment" },
  { label: "Recruitment", icon: "🎯", path: "/dashboard/recruitment" },
  { label: "Retention", icon: "📈", path: "/dashboard/retention" },
  { label: "Faculty Performance", icon: "👨‍🏫", path: "/dashboard/faculty-performance" },
  { label: "Workforce Needs", icon: "👥", path: "/dashboard/workforce" },
  { label: "Achievements", icon: "🏆", path: "/dashboard/achievements" },
  { label: "Accreditation", icon: "📜", path: "/dashboard/accreditation" },
  { label: "Partnerships", icon: "🤝", path: "/dashboard/partnerships" },
  { label: "Student Performance", icon: "🎓", path: "/dashboard/student-performance" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-[#7b1113] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#5e0d0f]">
        <h1 className="text-white font-bold text-xl">APMS</h1>
        <p className="text-red-200 text-xs mt-1">City College of Tagaytay</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[#5e0d0f]">
        <p className="text-white font-semibold text-sm">{user?.name}</p>
        <p className="text-red-300 text-xs capitalize">{user?.role}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition w-full text-left
              ${location.pathname === item.path
                ? "bg-white text-[#7b1113]"
                : "text-red-100 hover:bg-[#5e0d0f]"
              }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#5e0d0f]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-100 hover:bg-[#5e0d0f] w-full text-left transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}