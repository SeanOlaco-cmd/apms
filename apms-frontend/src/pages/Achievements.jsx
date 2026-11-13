import { useEffect, useState } from "react";
import api from "../api/axios";
import AchievementsBrowser from "../components/AchievementsBrowser";

export default function Achievements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The President only ever sees records that have cleared both the Dean and the VPAA.
    api.get("/achievements")
      .then((res) => setData(res.data.filter((d) => d.status === "approved")))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Achievements 🏆</h1>
        <p className="text-red-200 text-sm mt-1">Faculty and student accomplishments across all schools.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-gray-400 text-sm">No achievement data yet.</p>
        </div>
      ) : (
        <AchievementsBrowser data={data} />
      )}
    </div>
  );
}