import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

// Tiny GET hook: const { data, loading, error, reload } = useApi("/enrollment")
export default function useApi(path, { enabled = true, initial = [] } = {}) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!enabled || !path) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(path);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [path, enabled]);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}

// First validation message if there is one, otherwise the general message.
export const apiError = (err, fallback = "Something went wrong. Please try again.") => {
  const first = err?.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0];
  return first || err?.response?.data?.message || fallback;
};