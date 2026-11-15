import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import api from "../../api/axios";
import useApi, { apiError } from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { programChip } from "../../lib/academic";
import {
  Button, Card, Empty, Field, Loading, Notice, PageHeader, Pills, SearchBox, SelectInput, TextInput,
} from "../../components/ui";

const ROLES = [
  { value: "president", label: "President" },
  { value: "vpaa", label: "VPAA" },
  { value: "dean", label: "Dean" },
  { value: "department_head", label: "Department Head" },
  { value: "system_admin", label: "System Admin" },
];
const roleLabel = (role) => ROLES.find((r) => r.value === role)?.label ?? role;
const ROLE_PILLS = [{ value: "all", label: "All" }, ...ROLES];

const emptyForm = { name: "", email: "", password: "", role: "dean", school_id: "", program_id: "", is_active: true };

export default function SystemAdminUsers() {
  const { user: me, schools, schoolPrograms } = useAcademic();
  const { data: users, loading, error: loadError, reload } = useApi("/users");

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setSchool = (value) => setForm((f) => ({ ...f, school_id: value, program_id: "" }));
  const programs = form.school_id ? schoolPrograms(form.school_id) : [];

  const closeForm = () => { setShowForm(false); setEditUser(null); setForm(emptyForm); setError(""); };
  const openNew = () => { setEditUser(null); setForm(emptyForm); setError(""); setSuccess(""); setShowForm(true); };

  const openEdit = (u) => {
    setEditUser(u); setError(""); setSuccess("");
    setForm({
      name: u.name, email: u.email, password: "", // never sent on edit — see save()
      role: u.role, school_id: u.school_id ? String(u.school_id) : "", program_id: u.program_id ? String(u.program_id) : "",
      is_active: u.is_active,
    });
    setShowForm(true);
    window.scrollTo?.(0, 0);
  };

  const canSave = !busy && form.name.trim() && form.email.trim() && (editUser || form.password);

  const save = async () => {
    setBusy(true); setError(""); setSuccess("");
    try {
      if (editUser) {
        // The password key must be left out entirely on edit: the server
        // rejects any update that contains it, even when it is blank.
        const { password, ...payload } = form;
        await api.put(`/users/${editUser.id}`, payload);
        setSuccess("User updated.");
      } else {
        await api.post("/users", form);
        setSuccess("User created.");
      }
      closeForm();
      reload();
    } catch (err) {
      setError(apiError(err, "Could not save. Please check all fields."));
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (u) => {
    if (u.is_active && !window.confirm(`Deactivate ${u.name}? They will not be able to sign in.`)) return;
    setError(""); setSuccess("");
    try {
      await api.put(`/users/${u.id}`, { is_active: !u.is_active });
      setSuccess(`${u.name} ${u.is_active ? "deactivated" : "activated"}.`);
      reload();
    } catch (err) {
      setError(apiError(err, `Could not ${u.is_active ? "deactivate" : "activate"} ${u.name}.`));
    }
  };

  const needle = query.trim().toLowerCase();
  const rows = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter((u) => !needle || u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle));

  return (
    <>
      <PageHeader crumb="User Management" title="User Management" showYear={false}
        subtitle="Create, edit, activate and deactivate accounts."
        right={!showForm && <Button icon={Plus} onClick={openNew}>Add New User</Button>} />

      <Notice kind="info">
        Passwords are set once, when the account is created. After that, each account owner changes their own password
        from their Change Password page.
      </Notice>
      {loadError && <Notice kind="error">{loadError}</Notice>}
      {success && <Notice kind="success">{success}</Notice>}
      {!showForm && error && <Notice kind="error">{error}</Notice>}

      {showForm && (
        <Card>
          <h2 className="ap-card-title mb-4">{editUser ? `Edit User · ${editUser.name}` : "New User"}</h2>
          {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}

          <div className="ap-form-grid">
            <Field label="Full name">
              <TextInput value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Enter full name…" />
            </Field>
            <Field label="Email">
              <input type="email" className="ap-input" value={form.email} onChange={(e) => set("email")(e.target.value)}
                placeholder="name@cct.edu.ph" />
            </Field>
            <Field label={editUser ? "Password" : "Initial password"}
              hint={editUser
                ? "Cannot be changed here. The account owner uses their own Change Password page."
                : "7–12 characters: letters, numbers and the symbols _ @ $ ! % * # ? & . -"}>
              <input type="password" className="ap-input" disabled={!!editUser} autoComplete="new-password"
                value={editUser ? "" : form.password} onChange={(e) => set("password")(e.target.value)}
                placeholder={editUser ? "Not editable" : "Enter initial password…"} />
            </Field>
            <Field label="Role">
              <SelectInput value={form.role} onChange={set("role")} options={ROLES} placeholder="Select role…" />
            </Field>
            <Field label="School" hint="Required for Dean and Department Head accounts.">
              <SelectInput value={form.school_id} onChange={setSchool} placeholder="None"
                options={schools.map((s) => ({ value: String(s.id), label: `${s.code} · ${s.name}` }))} />
            </Field>
            <Field label="Program" hint="Required for Department Head accounts (their own program).">
              <SelectInput value={form.program_id} onChange={set("program_id")} disabled={!form.school_id}
                placeholder={form.school_id ? "None" : "Select a school first"}
                options={programs.map((p) => ({ value: String(p.id), label: `${p.code} · ${p.name}` }))} />
            </Field>
          </div>
          <div className="ap-form-actions">
            <Button icon={Save} onClick={save} disabled={!canSave}>
              {busy ? "Saving…" : editUser ? "Update User" : "Create User"}
            </Button>
            <Button variant="ghost" icon={X} onClick={closeForm}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="ap-toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search name or email…" />
        <Pills label="Role" options={ROLE_PILLS} value={roleFilter} onChange={setRoleFilter} />
      </div>

      <Card>
        {loading ? <Loading /> : rows.length === 0 ? <Empty>No users match these filters.</Empty> : (
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>{["Name", "Email", "Role", "School", "Program", "Status", "Action"].map((h) => <th key={h} className="py-3 px-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-4 strong">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">{roleLabel(u.role)}</td>
                    <td className="py-3 px-4">{u.school?.code ?? "—"}</td>
                    <td className="py-3 px-4">{u.program ? programChip(u.program) : "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`ap-badge ${u.is_active ? "b-approved" : "b-rejected"}`}>{u.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button small variant="ghost" onClick={() => openEdit(u)}>Edit</Button>
                        {u.id === me?.id
                          ? <span className="ap-hint" style={{ alignSelf: "center", marginTop: 0 }}>Your account</span>
                          : (
                            <Button small variant={u.is_active ? "reject" : "primary"} onClick={() => toggleActive(u)}>
                              {u.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          )}
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