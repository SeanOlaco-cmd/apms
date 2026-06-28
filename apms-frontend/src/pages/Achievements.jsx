import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Achievements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/achievements")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Faculty Achievements 🏆</h1>
        <p className="text-red-200 text-sm mt-1">Awards, publications, and certifications per school.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Achievement Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No achievement data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Faculty</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Achievement</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Awarding Body</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.faculty_name}</td>
                  <td className="py-3 px-4">{row.achievement_title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">{row.awarding_body ?? "—"}</td>
                  <td className="py-3 px-4">{row.date_awarded ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}