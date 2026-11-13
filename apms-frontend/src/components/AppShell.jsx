import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AcademicProvider, useAcademic } from "../context/AcademicContext";
import AccountMenu from "./AccountMenu";
import NotificationBell from "./NotificationBell";
import { HAS_BELL, accountLabel, navFor, sidebarLabel } from "../lib/nav";
import logo from "../assets/school-logo.png";

function Shell({ role }) {
  const { school, modules } = useAcademic();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = navFor(role, { modules });

  const isActive = (path) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(`${path}/`));

  return (
    <div className="ap-canvas">
      <header className="ap-header">
        <div className="ap-brand">
          <div className="ap-brand-logo"><img src={logo} alt="City College of Tagaytay crest" /></div>
          <div className="min-w-0">
            <div className="ap-brand-title">City College of Tagaytay <span className="ap-chip-cct">CCT</span></div>
            <div className="ap-brand-sub">CCT Academic Affairs</div>
          </div>
        </div>
        <div className="ap-header-tools">
          {HAS_BELL.includes(role) && <NotificationBell />}
          <AccountMenu label={accountLabel(role, school)} />
        </div>
      </header>

      <div className="ap-layout">
        <aside className="ap-sidebar" aria-label="Main navigation">
          <p className="ap-sidebar-label">{sidebarLabel(role, school)}</p>
          <nav className="ap-nav">
            {items.map(({ label, path, icon: Icon }) => (
              <button key={path} type="button" className="ap-nav-item"
                aria-current={isActive(path) ? "page" : undefined} onClick={() => navigate(path)}>
                <Icon size={20} className="shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="ap-content"><Outlet /></main>
      </div>
    </div>
  );
}

export default function AppShell({ role }) {
  return (
    <AcademicProvider>
      <Shell role={role} />
    </AcademicProvider>
  );
}