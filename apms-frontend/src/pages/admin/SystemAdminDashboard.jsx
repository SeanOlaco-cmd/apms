import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SystemAdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "system_admin") {
        navigate("/login");
      } else {
        setUser(parsed);
        loadStats();
      }
    }
  }, [navigate]);

  const loadStats = async () => {
    try {
      const res = await api.get("/users");
      setStats({
        total: res.data.length,
        active: res.data.filter((u) => u.is_active).length,
        inactive: res.data.filter((u) => !u.is_active).length,
      });
    } catch {
      console.error("Failed to load stats");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
        <p className="text-red-200 text-sm mt-1">System Admin Portal — Manage user accounts.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">👥</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-3xl mb-3">🚫</div>
          <p className="text-gray-500 text-xs font-medium uppercase">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div
          onClick={() => navigate("/admin/users")}
          className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition max-w-xs"
        >
          <div className="text-2xl">👤</div>
          <p className="font-semibold text-gray-800 text-sm">User Management</p>
        </div>
      </div>
    </div>
  );
}