import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DeanRetention() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const res = await api.get("/retention");
    const mine = res.data.filter(d => d.school_id == user.school_id);
    setSubmissions(mine);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    await api.put(`/retention/${id}`, { status: "approved", approved_by: user.id, approved_at: new Date().toISOString() });
    loadData();
  };

  const handleReject = async (id) => {
    await api.put(`/retention/${id}`, { status: "rejected", rejection_reason: rejectReason });
    setRejectId(null);
    setRejectReason("");
    loadData();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Retention Submissions 📈</h1>
        <p className="text-red-200 text-sm mt-1">Review and approve retention data.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : submissions.length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Program</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Retention Rate</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Continuing</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Dropped</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{row.academic_period?.school_year} - {row.academic_period?.semester}</td>
                  <td className="py-3 px-4">{row.program?.code}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{row.retention_rate}%</td>
                  <td className="py-3 px-4">{row.continuing_students}</td>
                  <td className="py-3 px-4 text-red-500">{row.dropped_students}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                      ${row.status === 'approved' ? 'bg-green-100 text-green-700' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {row.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(row.id)}
                          className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600 transition">
                          Approve
                        </button>
                        <button onClick={() => setRejectId(row.id)}
                          className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition">
                          Reject
                        </button>
                      </div>
                    )}
                    {row.status === 'rejected' && (
                      <p className="text-red-500 text-xs">{row.rejection_reason}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {rejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Reason for Rejection</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
              rows={4} placeholder="Enter reason for rejection..." />
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleReject(rejectId)}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Confirm Reject
              </button>
              <button onClick={() => { setRejectId(null); setRejectReason(""); }}
                className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}