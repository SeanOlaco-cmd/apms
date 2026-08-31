import { useEffect, useState } from "react";
import api from "../api/axios";

export default function BoardExam() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/board-exam-results")
      .then((res) => setData(res.data.filter(d => d.status === 'approved')))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Board Exam Results 📝</h1>
        <p className="text-red-200 text-sm mt-1">Board exam results across all schools and programs.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Exam Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Examinees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passers</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Passing Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.exam_name ?? "—"}</td>
                  <td className="py-3 px-4">{row.total_examinees}</td>
                  <td className="py-3 px-4 text-green-600">{row.total_passers}</td>
                  <td className="py-3 px-4 font-semibold">{row.passing_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}