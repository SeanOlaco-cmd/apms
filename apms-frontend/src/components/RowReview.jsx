import { useState } from "react";
import { Check, X } from "lucide-react";
import api from "../api/axios";
import { apiError } from "../lib/useApi";
import { Button, RejectDialog } from "./ui";

// Approve / Reject buttons for one pending row. `endpoint` is the PUT url,
// e.g. "/employees/5/vpaa-review". Reject opens the reason dialog.
export default function RowReview({ endpoint, onDone, onError }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [dialogError, setDialogError] = useState("");

  const send = async (body) => {
    setBusy(true); setDialogError("");
    try {
      await api.put(endpoint, body);
      setOpen(false); setReason("");
      onDone?.();
    } catch (err) {
      const msg = apiError(err);
      if (open) setDialogError(msg); else onError?.(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button small icon={Check} disabled={busy} onClick={() => send({ status: "approved" })}>Approve</Button>
        <Button small variant="reject" icon={X} disabled={busy} onClick={() => setOpen(true)}>Reject</Button>
      </div>
      {open && (
        <RejectDialog value={reason} onChange={setReason} busy={busy} error={dialogError}
          onCancel={() => { setOpen(false); setDialogError(""); }}
          onConfirm={() => send({ status: "rejected", rejection_reason: reason.trim() })} />
      )}
    </>
  );
}