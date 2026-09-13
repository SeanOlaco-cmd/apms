import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrarDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "registrar") {
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
          Registrar Dashboard — Submit enrollment, retention, and shiftee/transferee/dropout data college-wide.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div onClick={() => navigate("/registrar/enrollment")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-800">Enrollment Data</h3>
          <p className="text-gray-400 text-sm mt-1">Submit enrollment statistics for any school/program</p>
        </div>
        <div onClick={() => navigate("/registrar/retention")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-gray-800">Retention Rates</h3>
          <p className="text-gray-400 text-sm mt-1">Submit retention statistics for any school/program</p>
        </div>
        <div onClick={() => navigate("/registrar/shiftee-transferee")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition">
          <div className="text-3xl mb-3">🔄</div>
          <h3 className="font-semibold text-gray-800">Shiftee, Transferee & Dropouts</h3>
          <p className="text-gray-400 text-sm mt-1">Submit shiftee/transferee/dropout data for any school/program</p>
        </div>
      </div>
    </div>
  );
}