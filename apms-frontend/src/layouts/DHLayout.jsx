import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/axios";

const navItems = [
  { label: "Dashboard", icon: "📊", path: "/dh/dashboard" },
  { label: "Enrollment", icon: "📋", path: "/dh/enrollment" },
  { label: "Recruitment", icon: "🎯", path: "/dh/recruitment" },
  { label: "Retention", icon: "📈", path: "/dh/retention" },
  { label: "Faculty Performance", icon: "👨‍🏫", path: "/dh/faculty-performance" },
  { label: "Workforce Needs", icon: "👥", path: "/dh/workforce" },
  { label: "Achievements", icon: "🏆", path: "/dh/achievements" },
  { label: "Accreditation", icon: "📜", path: "/dh/accreditation" },
  { label: "Partnerships", icon: "🤝", path: "/dh/partnerships" },
  { label: "Student Performance", icon: "🎓", path: "/dh/student-performance" },
];

export default function DHLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const location = window.location.pathname;

  const handleLogout = async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-[#7b1113] flex flex-col">
        <div className="p-6 border-b border-[#5e0d0f]">
          <h1 className="text-white font-bold text-xl">APMS</h1>
          <p className="text-red-200 text-xs mt-1">City College of Tagaytay</p>
        </div>
        <div className="p-4 border-b border-[#5e0d0f]">
          <p className="text-white font-semibold text-sm">{user?.name}</p>
          <p className="text-red-300 text-xs">Department Head</p>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition w-full text-left
                ${location === item.path
                  ? "bg-white text-[#7b1113]"
                  : "text-red-100 hover:bg-[#5e0d0f]"
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#5e0d0f]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-100 hover:bg-[#5e0d0f] w-full text-left transition"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-gray-800">Department Head Portal</h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">Department Head</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#7b1113] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}