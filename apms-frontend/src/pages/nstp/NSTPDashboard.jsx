import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NSTODashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "nstp_head") {
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
          NSTP Head Portal — Submit NSTP reports to VPAA.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => navigate("/nstp/reports")}
            className="border border-gray-200 rounded-lg p-6 flex items-center gap-3 cursor-pointer hover:shadow-md transition">
            <div className="text-3xl">🌿</div>
            <div>
              <p className="font-semibold text-gray-800">NSTP Reports</p>
              <p className="text-gray-400 text-sm mt-1">Submit barangay reach, participants, activities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}