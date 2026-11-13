import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const tiles = [
  { label: "Enrollment", hint: "Enrollment statistics", path: "/dh/enrollment" },
  { label: "Retention", hint: "Dropout and transfer cases, retention rate", path: "/dh/retention" },
  { label: "Shiftee & Transferee", hint: "Shift and transfer cases and counts", path: "/dh/shiftee-transferee" },
  { label: "Faculty Performance", hint: "Faculty evaluation data", path: "/dh/faculty-performance" },
  { label: "Achievements", hint: "Faculty achievements", path: "/dh/achievements" },
  { label: "Board Exam Results", hint: "Board exam results", path: "/dh/board-exam" },
  { label: "Student Performance", hint: "Student performance data", path: "/dh/student-performance" },
  { label: "Employees", hint: "Faculty and employee records", path: "/dh/employees" },
];

export default function DHDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "department_head") {
        navigate("/login");
      } else {
        setUser(parsed);
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">
          Department Head Dashboard — Input and manage your program's data.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.path} onClick={() => navigate(t.path)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition">
            <h3 className="font-semibold text-gray-800">{t.label}</h3>
            <p className="text-gray-400 text-sm mt-1">{t.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}