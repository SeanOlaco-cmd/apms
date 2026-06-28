import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Enrollment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/enrollment")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Enrollment Data 📋</h1>
        <p className="text-red-200 text-sm mt-1">
          Enrollment statistics across all schools and programs.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Enrollment Records
        </h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No enrollment data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Enrolled</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Male</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Female</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">New</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Old</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4 font-semibold">{row.total_enrolled}</td>
                  <td className="py-3 px-4">{row.male_count}</td>
                  <td className="py-3 px-4">{row.female_count}</td>
                  <td className="py-3 px-4">{row.new_students}</td>
                  <td className="py-3 px-4">{row.old_students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}