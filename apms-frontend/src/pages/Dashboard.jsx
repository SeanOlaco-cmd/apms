import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const statCards = [
  { label: "Total Schools", value: "6", icon: "🏫", color: "bg-blue-50 text-blue-700" },
  { label: "Total Programs", value: "24", icon: "📚", color: "bg-green-50 text-green-700" },
  { label: "Total Enrolled", value: "0", icon: "👨‍🎓", color: "bg-yellow-50 text-yellow-700" },
  { label: "Overall Passing Rate", value: "0%", icon: "📈", color: "bg-red-50 text-red-700" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      setUser(JSON.parse(stored));
    }
  }, [navigate]);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">
          Here's the academic performance overview for City College of Tagaytay.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl ${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-gray-500 text-xs font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Schools Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Schools Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {['SCS', 'SED', 'SHTM', 'SAS', 'SPES', 'SBM'].map((school) => (
            <div
              key={school}
              className="border border-gray-200 rounded-lg p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#7b1113] text-white flex items-center justify-center font-bold text-xs">
                {school}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{school}</p>
                <p className="text-xs text-gray-400">No data yet</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}