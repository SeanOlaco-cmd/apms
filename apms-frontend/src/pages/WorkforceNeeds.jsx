import { useEffect, useState } from "react";
import api from "../api/axios";

export default function WorkforceNeeds() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workforce")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Workforce Needs 👥</h1>
        <p className="text-red-200 text-sm mt-1">Faculty vacancy and hiring needs per school.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Workforce Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No workforce data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Faculty Needed</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Vacant</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Filled</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Specialization</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Urgency</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.faculty_needed}</td>
                  <td className="py-3 px-4 text-red-500">{row.vacant_positions}</td>
                  <td className="py-3 px-4 text-green-500">{row.positions_filled}</td>
                  <td className="py-3 px-4">{row.specialization_needed ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${row.urgency === 'high' ? 'bg-red-100 text-red-700' :
                        row.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}`}>
                      {row.urgency}
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