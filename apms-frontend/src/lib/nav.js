import {
  Award, Briefcase, CalendarDays, ClipboardCheck, ClipboardList, LayoutDashboard, TrendingUp, UserMinus, Users,
} from "lucide-react";

// A Dean whose school only has board-exam modules (SED, SAS) sees "Board Exams".
export const achievementLabel = (modules = []) =>
  modules.length > 0 && modules.every((m) => m.kind === "board_exam") ? "Board Exams" : "Departmental Achievements";

export function navFor(role, { modules = [] } = {}) {
  switch (role) {
    case "department_head":
      return [
        { label: "Overview", path: "/dh/dashboard", icon: LayoutDashboard },
        { label: "Enrollment Data", path: "/dh/enrollment", icon: Users },
        { label: "Retention", path: "/dh/retention", icon: UserMinus },
      ];
    case "dean":
      return [
        { label: "Overview", path: "/dean/dashboard", icon: LayoutDashboard },
        { label: "Approval of Reports", path: "/dean/approvals", icon: ClipboardCheck },
        { label: "Retention", path: "/dean/retention", icon: UserMinus },
        { label: "Faculty Employment Status", path: "/dean/faculty", icon: Briefcase },
        { label: achievementLabel(modules), path: "/dean/achievements", icon: Award },
      ];
    case "vpaa":
      return [
        { label: "Overview", path: "/vpaa/dashboard", icon: LayoutDashboard },
        { label: "Approval of Reports", path: "/vpaa/approvals", icon: ClipboardCheck },
        { label: "Faculty Employment Status", path: "/vpaa/faculty", icon: Briefcase },
        { label: "Departmental Achievements", path: "/vpaa/achievements", icon: Award },
        { label: "Class Monitoring", path: "/vpaa/class-monitoring", icon: ClipboardList },
      ];
    case "president":
      return [
        { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { label: "Reports per Department", path: "/dashboard/reports", icon: TrendingUp },
      ];
    case "system_admin":
      return [
        { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "User Management", path: "/admin/users", icon: Users },
        { label: "Academic Periods", path: "/admin/academic-periods", icon: CalendarDays },
      ];
    default:
      return [];
  }
}

export const sidebarLabel = (role, school) =>
  ({
    department_head: "Department Head",
    dean: `Dean${school ? ` · ${school.code}` : ""}`,
    vpaa: "VPAA",
    president: "College President",
    system_admin: "System Admin",
  })[role] ?? "";

export const accountLabel = (role, school) =>
  ({
    department_head: "Department Head",
    dean: `Dean${school ? ` · ${school.name}` : ""}`,
    vpaa: "VPAA",
    president: "College President",
    system_admin: "System Administrator",
  })[role] ?? "";

export const HAS_BELL = ["department_head", "dean", "vpaa"];