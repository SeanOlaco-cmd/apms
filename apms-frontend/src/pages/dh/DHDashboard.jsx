import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

      <div className="grid grid-cols-3 gap-4">
        <div onClick={() => navigate("/dh/enrollment")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-800">Enrollment Data</h3>
          <p className="text-gray-400 text-sm mt-1">Input enrollment statistics</p>
        </div>
        <div onClick={() => navigate("/dh/recruitment")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-semibold text-gray-800">Recruitment Data</h3>
          <p className="text-gray-400 text-sm mt-1">Input recruitment statistics</p>
        </div>
        <div onClick={() => navigate("/dh/retention")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-gray-800">Retention Rates</h3>
          <p className="text-gray-400 text-sm mt-1">Input retention statistics</p>
        </div>
        <div onClick={() => navigate("/dh/faculty-performance")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">👨‍🏫</div>
          <h3 className="font-semibold text-gray-800">Faculty Performance</h3>
          <p className="text-gray-400 text-sm mt-1">Input faculty evaluation data</p>
        </div>
        <div onClick={() => navigate("/dh/workforce")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-gray-800">Workforce Needs</h3>
          <p className="text-gray-400 text-sm mt-1">Input workforce requirements</p>
        </div>
        <div onClick={() => navigate("/dh/achievements")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">🏆</div>
          <h3 className="font-semibold text-gray-800">Achievements</h3>
          <p className="text-gray-400 text-sm mt-1">Input faculty achievements</p>
        </div>
        <div onClick={() => navigate("/dh/accreditation")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">📜</div>
          <h3 className="font-semibold text-gray-800">Accreditation</h3>
          <p className="text-gray-400 text-sm mt-1">Input accreditation status</p>
        </div>
        <div onClick={() => navigate("/dh/partnerships")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">🤝</div>
          <h3 className="font-semibold text-gray-800">Partnerships</h3>
          <p className="text-gray-400 text-sm mt-1">Input corporate partnerships</p>
        </div>
        <div onClick={() => navigate("/dh/student-performance")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">🎓</div>
          <h3 className="font-semibold text-gray-800">Student Performance</h3>
          <p className="text-gray-400 text-sm mt-1">Input student performance data</p>
        </div>
      </div>
    </div>
  );
}