import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function VPAABackup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/backups");
      setBackups(res.data);
    } catch {
      setError("Failed to load backups.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setMessage("");
    setError("");
    try {
      await api.post("/backups");
      setMessage("Backup created successfully.");
      loadBackups();
    } catch {
      setError("Failed to create backup.");
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const res = await api.get(`/backups/${filename}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Failed to download backup.");
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete backup "${filename}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/backups/${filename}`);
      setMessage("Backup deleted.");
      loadBackups();
    } catch {
      setError("Failed to delete backup.");
    }
  };

  const handleRestore = async (filename) => {
    const typed = window.prompt(
      `This will REPLACE all current academic data with the contents of "${filename}". This cannot be undone.\n\nType the filename exactly to confirm:`
    );
    if (typed !== filename) {
      if (typed !== null) setError("Filename didn't match — restore cancelled.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await api.post(`/backups/${filename}/restore`, { confirm: true });
      setMessage(`Restored successfully from ${filename}.`);
    } catch {
      setError("Restore failed.");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Backup & Recovery 💾</h1>
        <p className="text-red-200 text-sm mt-1">
          Create snapshots of all academic data (enrollment, retention, shiftee/transferee, faculty performance,
          achievements, board exam results, student performance, employees, class monitoring). Restoring
          replaces current data with a snapshot — this cannot be undone.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {message && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{message}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50"
        >
          {creating ? "Creating backup..." : "Create New Backup"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Existing Backups</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : backups.length === 0 ? (
          <p className="text-gray-400 text-sm">No backups yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Created</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">By</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Rows</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Size</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.filename} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4">{b.created_by_name}</td>
                  <td className="py-3 px-4">{b.total_rows}</td>
                  <td className="py-3 px-4">{formatSize(b.size_bytes)}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => handleDownload(b.filename)}
                      className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                      Download
                    </button>
                    <button onClick={() => handleRestore(b.filename)}
                      className="bg-amber-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-amber-600 transition">
                      Restore
                    </button>
                    <button onClick={() => handleDelete(b.filename)}
                      className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition">
                      Delete
                    </button>
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