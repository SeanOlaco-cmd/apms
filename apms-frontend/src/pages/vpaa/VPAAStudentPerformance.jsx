import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function VPAAStudentPerformance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoading(true);
    api.get("/student-performance")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Student Performance 🎓</h1>
        <p className="text-red-200 text-sm mt-1">Read-only view — Deans approve this data, not VPAA.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : data.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Failing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Avg GWA</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.total_students}</td>
                  <td className="py-3 px-4 text-green-600">{row.passing}</td>
                  <td className="py-3 px-4 text-red-500">{row.failing}</td>
                  <td className="py-3 px-4 font-semibold">{row.passing_rate}%</td>
                  <td className="py-3 px-4">{row.average_gwa}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
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