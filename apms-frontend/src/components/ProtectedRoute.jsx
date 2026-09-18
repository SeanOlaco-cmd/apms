import { Navigate } from "react-router-dom";

const HOME_BY_ROLE = {
  president: "/dashboard",
  dean: "/dean/dashboard",
  vpaa: "/vpaa/dashboard",
  system_admin: "/admin/dashboard",
  department_head: "/dh/dashboard",
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] || "/login"} replace />;
  }

  return children;
}