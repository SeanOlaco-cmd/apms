import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function SystemAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "dean",
    school_id: "",
    program_id: "",
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    loadData();
    api.get("/schools").then((res) => setSchools(res.data));
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
    setForm({ ...form, school_id: schoolId, program_id: "" });
    if (schoolId) {
      const res = await api.get(`/programs?school_id=${schoolId}`);
      setPrograms(res.data);
    } else {
      setPrograms([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    try {
      if (editUser) {
        // Password is NEVER sent on edit — System Admin can't change it,
        // by design. The key must be omitted entirely, not just blank:
        // the backend checks $request->has('password'), which is true
        // even for an empty string. Sending the key at all would 403
        // every edit, not just password changes.
        const { password, ...payload } = form;
        await api.put(`/users/${editUser.id}`, payload);
        setSuccess("User updated successfully!");
      } else {
        await api.post("/users", form);
        setSuccess("User created successfully!");
      }
      setShowForm(false);
      setEditUser(null);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please check all fields.");
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // never sent on edit — see handleSubmit
      role: user.role,
      school_id: user.school_id ?? "",
      program_id: user.program_id ?? "",
      is_active: user.is_active,
    });
    if (user.school_id) {
      api.get(`/programs?school_id=${user.school_id}`).then((res) => setPrograms(res.data));
    }
    setShowForm(true);
  };

  const handleToggleActive = async (user) => {
    await api.put(`/users/${user.id}`, { is_active: !user.is_active });
    loadData();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#7b1113] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">User Management 👤</h1>
        <p className="text-red-200 text-sm mt-1">
          Create, edit, activate, and deactivate accounts. Passwords are set once at creation — each account
          owner changes their own password afterward from their Change Password page.
        </p>
      </div>

      {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      <div className="flex justify-end">
        <button
          onClick={() => { setShowForm(!showForm); setEditUser(null); setForm(emptyForm); }}
          className="bg-[#7b1113] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#5e0d0f] transition"
        >
          {showForm && !editUser ? "Cancel" : "+ Add New User"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">{editUser ? "Edit User" : "New User"}</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded-lg mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="Full name..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]"
                placeholder="email@cct.edu.ph" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {editUser ? "Password" : "Initial Password"}
              </label>
              <input
                type="password"
                name="password"
                value={editUser ? "" : form.password}
                onChange={handleChange}
                disabled={!!editUser}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113] disabled:bg-gray-100 disabled:text-gray-400"
                placeholder={editUser ? "Not editable — account owner changes their own" : "••••••••"}
              />
              {editUser && (
                <p className="text-xs text-gray-400 mt-1">
                  System Admin cannot change passwords. The account owner uses their own Change Password page.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="president">President</option>
                <option value="dean">Dean</option>
                <option value="vpaa">VPAA</option>
                <option value="department_head">Department Head</option>
                <option value="system_admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">School</label>
              <select name="school_id" value={form.school_id} onChange={handleSchoolChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="">None</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Required for Dean and Department Head accounts.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Program</label>
              <select name="program_id" value={form.program_id} onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1113]">
                <option value="">None</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Required for Department Head accounts (their specific program).</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit}
              className="bg-[#7b1113] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#5e0d0f] transition">
              {editUser ? "Update User" : "Create User"}
            </button>
            <button onClick={() => { setShowForm(false); setEditUser(null); }}
              className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">All Users</h3>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p>
        : users.length === 0 ? <p className="text-gray-400 text-sm">No users found.</p>
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">School</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 capitalize">{user.role.replace('_', ' ')}</td>
                  <td className="py-3 px-4">{user.school?.code ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(user)}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                        Edit
                      </button>
                      <button onClick={() => handleToggleActive(user)}
                        className={`text-white text-xs px-3 py-1 rounded-lg transition
                          ${user.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
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