import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Recruitment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/recruitment")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Recruitment Data 🎯</h1>
        <p className="text-red-200 text-sm mt-1">Student recruitment statistics per school.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Recruitment Records</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No recruitment data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Applicants</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Accepted</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Enrolled</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Walk-in</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Online</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Referrals</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.school?.code}</td>
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.applicants}</td>
                  <td className="py-3 px-4">{row.accepted}</td>
                  <td className="py-3 px-4 font-semibold">{row.enrolled}</td>
                  <td className="py-3 px-4">{row.walk_in}</td>
                  <td className="py-3 px-4">{row.online}</td>
                  <td className="py-3 px-4">{row.referrals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}