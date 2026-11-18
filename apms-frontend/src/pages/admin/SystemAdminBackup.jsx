import { useState } from "react";
import { Database, Download, RotateCcw, Trash2, Upload } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { num } from "../../lib/format";
import { Button, Card, Empty, Loading, Notice, PageHeader, SectionTitle } from "../../components/ui";

const TABLE_LABELS = {
  schools: "Schools",
  programs: "Programs",
  academic_periods: "Academic periods",
  achievement_modules: "Achievement modules",
  enrollment_data: "Enrollment reports",
  retention_reports: "Retention reports",
  retention_records: "Retention records",
  employee_data: "Faculty records",
  dept_achievements: "Departmental achievements",
  class_monitoring_logs: "Class monitoring entries",
};

const when = (iso) => (iso ? new Date(iso).toLocaleString("en-US", {
  year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
}) : "—");
const size = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const RESTORE_WARNING = "This replaces every record in the system with the contents of the backup. "
  + "Anything entered after the backup was made will be lost. Continue?";

// Saves a backup kept on the server to this computer.
async function saveToComputer(filename) {
  const res = await api.get(`/backups/${filename}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function SystemAdminBackup() {
  const { data: backups, loading, error: loadError, reload } = useApi("/backups");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);      // { name, backup }
  const [fileError, setFileError] = useState("");
  const [understood, setUnderstood] = useState(false);

  const start = () => { setBusy(true); setError(""); setSuccess(""); };

  const create = async () => {
    start();
    try {
      const res = await api.post("/backups");
      await saveToComputer(res.data.filename);
      setSuccess(`Backup created with ${num(res.data.total_rows)} records and saved to this computer as ${res.data.filename}.`);
      reload();
    } catch (err) {
      setError(apiError(err, "Could not create the backup."));
    } finally {
      setBusy(false);
    }
  };

  const download = async (b) => {
    start();
    try {
      await saveToComputer(b.filename);
    } catch {
      setError(`Could not download ${b.filename}.`);
    } finally {
      setBusy(false);
    }
  };

  const restoreServer = async (b) => {
    if (!window.confirm(`Restore ${b.filename}?\n\n${RESTORE_WARNING}`)) return;
    start();
    try {
      await api.post(`/backups/${b.filename}/restore`, { confirm: true });
      setSuccess(`Restored from ${b.filename} (made ${when(b.created_at)}).`);
    } catch (err) {
      setError(apiError(err, "The restore failed. No records were changed."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete ${b.filename} from the server? Copies saved on computers are not affected.`)) return;
    start();
    try {
      await api.delete(`/backups/${b.filename}`);
      setSuccess(`${b.filename} deleted from the server.`);
      reload();
    } catch (err) {
      setError(apiError(err, "Could not delete the backup."));
    } finally {
      setBusy(false);
    }
  };

  const pickFile = async (e) => {
    const chosen = e.target.files?.[0];
    setFile(null); setFileError(""); setUnderstood(false);
    if (!chosen) return;
    try {
      const backup = JSON.parse(await chosen.text());
      if (!backup || typeof backup.tables !== "object") throw new Error("bad");
      setFile({ name: chosen.name, backup });
    } catch {
      setFileError("That file is not an APMS backup. Choose a .json file made by this page.");
    }
  };

  const restoreUpload = async () => {
    if (!window.confirm(RESTORE_WARNING)) return;
    start();
    try {
      await api.post("/backups/restore", { confirm: true, name: file.name, backup: file.backup });
      setSuccess(`Restored from ${file.name} (made ${when(file.backup.created_at)}).`);
      setFile(null); setUnderstood(false);
    } catch (err) {
      setError(apiError(err, "The restore failed. No records were changed."));
    } finally {
      setBusy(false);
    }
  };

  const fileTables = file ? Object.entries(file.backup.tables).filter(([t]) => TABLE_LABELS[t]) : [];

  return (
    <>
      <PageHeader crumb="Backup & Recovery" title="Backup & Recovery" showYear={false}
        subtitle="Save a copy of all system records, and restore it if data is lost or entered by mistake." />

      {loadError && <Notice kind="error">{loadError}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      <Card>
        <SectionTitle icon={Database} tone="green" title="Create a backup"
          subtitle="Saves every report and record, plus schools, programs and academic periods." />
        <Notice kind="info">
          The backup downloads to this computer. Keep it somewhere safe, such as a USB drive or the office's shared drive.
          User accounts are not included, so passwords are never rolled back.
        </Notice>
        <div className="ap-form-actions">
          <Button icon={Download} onClick={create} disabled={busy}>{busy ? "Working…" : "Create & Download Backup"}</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Upload} tone="orange" title="Restore from a backup file"
          subtitle="Choose a backup file saved earlier from this page." />
        <input type="file" accept=".json,application/json" onChange={pickFile} className="ap-input" style={{ paddingTop: "0.55rem" }} />
        {fileError && <div className="mt-3"><Notice kind="error">{fileError}</Notice></div>}

        {file && (
          <div className="mt-4">
            <p className="ap-label">
              {file.name} · made {when(file.backup.created_at)} by {file.backup.created_by_name ?? "unknown"}
            </p>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead><tr><th className="py-3 px-4">Contents</th><th className="py-3 px-4">Records</th></tr></thead>
                <tbody>
                  {fileTables.map(([t, rows]) => (
                    <tr key={t}>
                      <td className="py-3 px-4">{TABLE_LABELS[t]}</td>
                      <td className="py-3 px-4">{num(Array.isArray(rows) ? rows.length : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="flex items-center gap-2 mt-4" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
              <span className="ap-label" style={{ margin: 0 }}>
                I understand this replaces the current records with the ones in this file.
              </span>
            </label>
            <div className="ap-form-actions">
              <Button variant="reject" icon={RotateCcw} onClick={restoreUpload} disabled={busy || !understood}>
                {busy ? "Restoring…" : "Restore This Backup"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Database} tone="blue" title="Backups on the server"
          subtitle="Copies kept on the server. On Railway these are cleared whenever the system is redeployed." />
        {loading ? <Loading /> : backups.length === 0 ? <Empty>No backups on the server yet.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Created", "Created by", "Records", "Size", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.filename}>
                    <td className="py-3 px-4 strong">{when(b.created_at)}</td>
                    <td className="py-3 px-4">{b.created_by_name}</td>
                    <td className="py-3 px-4">{num(b.total_rows)}</td>
                    <td className="py-3 px-4">{size(b.size_bytes)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button small variant="ghost" icon={Download} onClick={() => download(b)} disabled={busy}>Download</Button>
                        <Button small variant="reject" icon={RotateCcw} onClick={() => restoreServer(b)} disabled={busy}>Restore</Button>
                        <Button small variant="ghost" icon={Trash2} onClick={() => remove(b)} disabled={busy}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}