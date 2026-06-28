import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Accreditation() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/accreditation")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Accreditation Status 📜</h1>
        <p className="text-red-200 text-sm mt-1">Accreditation levels and status per program.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Accreditation Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No accreditation data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Accrediting Body</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Level</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date Accredited</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Expiry</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.accrediting_body}</td>
                  <td className="py-3 px-4 font-semibold">{row.level}</td>
                  <td className="py-3 px-4">{row.date_accredited ?? "—"}</td>
                  <td className="py-3 px-4">{row.expiry_date ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'active' ? 'bg-green-100 text-green-700' :
                        row.status === 'expired' ? 'bg-red-100 text-red-700' :
                        row.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}