import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FacultyPerformance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/faculty-performance")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Faculty Performance 👨‍🏫</h1>
        <p className="text-red-200 text-sm mt-1">Faculty evaluation and qualifications per school.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Faculty Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No faculty performance data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Faculty</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Full Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Part Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Avg Score</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Masters</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Doctorate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Licensed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4 font-semibold">{row.total_faculty}</td>
                  <td className="py-3 px-4">{row.full_time}</td>
                  <td className="py-3 px-4">{row.part_time}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.average_evaluation_score}</td>
                  <td className="py-3 px-4">{row.with_masters}</td>
                  <td className="py-3 px-4">{row.with_doctorate}</td>
                  <td className="py-3 px-4">{row.with_board_license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}