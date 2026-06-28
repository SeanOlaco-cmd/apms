import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Partnerships() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/partnerships")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Corporate Partnerships 🤝</h1>
        <p className="text-red-200 text-sm mt-1">Industry and corporate partnerships per school.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Partnership Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No partnership data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Industry</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Start Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">End Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4 font-semibold">{row.company_name}</td>
                  <td className="py-3 px-4">{row.industry ?? "—"}</td>
                  <td className="py-3 px-4 capitalize">{row.partnership_type}</td>
                  <td className="py-3 px-4">{row.start_date ?? "—"}</td>
                  <td className="py-3 px-4">{row.end_date ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'active' ? 'bg-green-100 text-green-700' :
                        row.status === 'expired' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
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