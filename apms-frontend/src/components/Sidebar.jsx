import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Overview", path: "/dashboard" },
  { label: "Enrollment", path: "/dashboard/enrollment" },
  { label: "Retention", path: "/dashboard/retention" },
  { label: "Shiftee & Transferee", path: "/dashboard/shiftee-transferee" },
  { label: "Faculty Performance", path: "/dashboard/faculty-performance" },
  { label: "Achievements", path: "/dashboard/achievements" },
  { label: "Board Exam Results", path: "/dashboard/board-exam" },
  { label: "Class Monitoring", path: "/dashboard/class-monitoring" },
  { label: "Student Performance", path: "/dashboard/student-performance" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen bg-[#7b1113] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#5e0d0f]">
        <h1 className="text-white font-bold text-xl">APMS</h1>
        <p className="text-red-200 text-xs mt-1">City College of Tagaytay</p>
      </div>

      {/* System Name */}
      <div className="p-4 border-b border-[#5e0d0f]">
        <p className="text-white font-semibold text-sm">Academic Performance</p>
        <p className="text-red-300 text-xs">Monitoring System</p>
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
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}