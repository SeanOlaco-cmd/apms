import { useState } from "react";
import api from "../api/axios";

// Same rule the server enforces: 7-12 characters, letters/numbers/common symbols.
const PASSWORD_PATTERN = /^[A-Za-z0-9_@$!%*#?&.\-]{7,12}$/;

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (form.new_password !== form.new_password_confirmation) {
      setError("New password and confirmation don't match.");
      setLoading(false);
      return;
    }

    if (!PASSWORD_PATTERN.test(form.new_password)) {
      setError("Password must be 7-12 characters, using letters, numbers, and common symbols like _ @ $ ! % * # ? & . -");
      setLoading(false);
      return;
    }

    try {
      await api.post("/change-password", form);
      setSuccess("Password changed successfully.");
      setForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to change password. Check your current password and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Change Password 🔒</h1>
        <p className="text-red-200 text-sm mt-1">Update your account password.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              required
              minLength={7}
              maxLength={12}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
            />
            <p className="text-xs text-gray-400 mt-1">7–12 characters. Letters, numbers, and symbols like _ @ $ ! % * # ? & . -</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              name="new_password_confirmation"
              value={form.new_password_confirmation}
              onChange={handleChange}
              required
              minLength={7}
              maxLength={12}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition disabled:opacity-50 mt-2"
          >
            {loading ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}