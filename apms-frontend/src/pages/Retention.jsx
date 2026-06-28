import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Retention() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/retention")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Retention Rates 📈</h1>
        <p className="text-red-200 text-sm mt-1">Student retention statistics per program.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Retention Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No retention data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Retention Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Continuing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropped</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Transferred</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Graduated</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">{row.retention_rate}%</td>
                  <td className="py-3 px-4">{row.continuing_students}</td>
                  <td className="py-3 px-4 text-red-500">{row.dropped_students}</td>
                  <td className="py-3 px-4">{row.transferred_students}</td>
                  <td className="py-3 px-4 text-green-500">{row.graduated_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}