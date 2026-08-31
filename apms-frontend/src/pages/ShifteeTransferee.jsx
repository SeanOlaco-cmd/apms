import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ShifteeTransferee() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/shiftee-transferee")
      .then((res) => setData(res.data.filter(d => d.status === 'approved')))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Shiftee & Transferee Data 🔄</h1>
        <p className="text-red-200 text-sm mt-1">Shiftee and transferee data across all schools and programs.</p>
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Shiftees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Shiftees In</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Shiftees Out</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Total Transferees</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Transferees In</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Transferees Out</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropouts</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.total_shiftees}</td>
                  <td className="py-3 px-4 text-green-600">{row.shiftees_in}</td>
                  <td className="py-3 px-4 text-red-500">{row.shiftees_out}</td>
                  <td className="py-3 px-4">{row.total_transferees}</td>
                  <td className="py-3 px-4 text-green-600">{row.transferees_in}</td>
                  <td className="py-3 px-4 text-red-500">{row.transferees_out}</td>
                  <td className="py-3 px-4 text-red-500 font-semibold">{row.total_dropouts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}