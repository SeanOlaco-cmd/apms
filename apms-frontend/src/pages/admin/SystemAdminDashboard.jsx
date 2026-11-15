import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, UserCheck, UserX, Users } from "lucide-react";
import useApi from "../../lib/useApi";
import { useAcademic } from "../../context/AcademicContext";
import { num } from "../../lib/format";
import { Card, Loading, Notice, PageHeader, SectionTitle, Tile, TileGrid } from "../../components/ui";

const ROLES = [
  { value: "president", label: "College President" },
  { value: "vpaa", label: "VPAA" },
  { value: "dean", label: "Deans" },
  { value: "department_head", label: "Department Heads" },
  { value: "system_admin", label: "System Admins" },
];

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const { activePeriod, periods, ready } = useAcademic();
  const { data: users, loading, error } = useApi("/users");

  const active = users.filter((u) => u.is_active).length;
  const semester = activePeriod
    ? (activePeriod.semester === "Summer" ? "Summer" : `${activePeriod.semester} Semester`)
    : "";

  const links = [
    { label: "User Management", note: "Create accounts and switch them on or off.", path: "/admin/users", icon: Users },
    { label: "Academic Periods", note: "Set the school year and semester everyone reports against.", path: "/admin/academic-periods", icon: CalendarDays },
  ];

  return (
    <>
      <PageHeader eyebrow="System Admin Dashboard" title="System Overview" showYear={false}
        subtitle="Manage user accounts and the academic period used across the system." />

      {error && <Notice kind="error">{error}</Notice>}
      {ready && !activePeriod && (
        <Notice kind="error">
          No academic period is active. Department Heads cannot submit reports until you set one in Academic Periods.
        </Notice>
      )}

      <Card>
        <SectionTitle icon={Users} tone="lavender" title="User Accounts" subtitle="Everyone who can sign in to the system." />
        {loading ? <Loading /> : (
          <TileGrid min="10rem">
            <Tile icon={Users} tone="lavender" label="Total Users" value={num(users.length)} note="all accounts" />
            <Tile icon={UserCheck} tone="green" label="Active" value={num(active)} note="can sign in" />
            <Tile icon={UserX} tone="red" label="Inactive" value={num(users.length - active)} note="sign-in blocked" />
            <Tile icon={CalendarDays} tone="blue" label="Active Period"
              value={activePeriod ? activePeriod.school_year.replace("-", "–") : "None"}
              note={activePeriod ? semester : `${num(periods.length)} period${periods.length === 1 ? "" : "s"} on record`} />
          </TileGrid>
        )}
      </Card>

      <Card>
        <SectionTitle icon={UserCheck} tone="green" title="Accounts by Role" subtitle="How many accounts each role has." />
        {loading ? <Loading /> : (
          <TileGrid min="9.5rem">
            {ROLES.map((r) => (
              <Tile key={r.value} small label={r.label} value={num(users.filter((u) => u.role === r.value).length)} />
            ))}
          </TileGrid>
        )}
      </Card>

      <Card>
        <SectionTitle icon={ArrowRight} tone="orange" title="Quick Access" />
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))" }}>
          {links.map((l) => (
            <button key={l.path} type="button" className="ap-card text-left" style={{ cursor: "pointer" }} onClick={() => navigate(l.path)}>
              <div className="flex items-center justify-between">
                <l.icon size={18} />
                <ArrowRight size={14} />
              </div>
              <p className="ap-card-title" style={{ marginTop: "0.5rem" }}>{l.label}</p>
              <p className="ap-hint">{l.note}</p>
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}