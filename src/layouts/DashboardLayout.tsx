import { Outlet, Navigate, useLocation, NavLink, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Box,
  Users,
  BarChart2,
  Settings,
  Bell,
} from "lucide-react";

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",   Icon: Home,   to: "/dashboard" },
  { label: "Services",    Icon: Box,    to: "/dashboard/services" },
  { label: "Specialists", Icon: Users, to: "/dashboard/specialists" },
  { label: "Analytics",  Icon: BarChart2,   to: "/dashboard/analytics" },
  { label: "Settings",   Icon: Settings,    to: "/dashboard/settings" },
];

// ─────────────────────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const { user } = useAuth();

  if(!user) return null;

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    /* ── Page wrapper ─────────────────────────────────────────────────── */
    <div
      className="min-h-screen flex items-start justify-center p-5"
      style={{ background: "linear-gradient(145deg, #ded4d7c5 0%, #c2cbcdff 100%)" }}
    >
      {/* ── App shell ─────────────────────────────────────────────────── */}
      <div
        className="w-full flex rounded-2xl overflow-hidden shadow-2xl min-h-[calc(100vh-40px)] backdrop-blur-3xl"
      >
        {/* ══════════════════════ SIDEBAR ══════════════════════════════ */}
        <aside
          className="w-[220px] shrink-0 flex flex-col py-8 px-5 border-r border-black/7"
        >
          {/* Logo */}
          <Link to='/dashboard' className="flex items-center gap-2.5 mb-9 px-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            >
              <img src="/logo.png" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight text-gray-800 font-serif"
            >
              Haybooking
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {NAV_ITEMS.map(({ label, Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-[10px] rounded-xl text-sm font-medium transition-all duration-150 select-none",
                    isActive
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-[#8a7f76] hover:bg-white/60 hover:text-gray-800",
                  ].join(" ")
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ══════════════════════ MAIN AREA ═══════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* ── Top bar ────────────────────────────────────────────── */}
          <header
            className="flex items-center justify-between px-8 py-5 shrink-0 border-b border-black/7"
          >
            <h1
              className="text-xl font-semibold tracking-tight text-gray-800 font-serif"
            >
              {user.business?.businessName}
            </h1>

            <div className="flex items-center gap-3">
              {/* User avatar */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white shadow-sm bg-[#c8bfb5] text-text-body"
                >
                  {initials}
                </div>
              )}
            </div>
          </header>

          {/* ── Outlet ─────────────────────────────────────────────── */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}