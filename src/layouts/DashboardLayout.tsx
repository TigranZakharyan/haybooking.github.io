import { useState, useEffect, useMemo } from "react";
import { Outlet, NavLink, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Box,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  Menu,
  X,
  MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", Icon: Home, to: "/dashboard" },
  { label: "Services", Icon: Box, to: "/dashboard/services" },
  { label: "Branches", Icon: MapPin, to: "/dashboard/branches" },
  { label: "Specialists", Icon: Users, to: "/dashboard/specialists" },
  { label: "Analytics", Icon: BarChart2, to: "/dashboard/analytics" },
  { label: "Settings", Icon: Settings, to: "/dashboard/settings" },
];

export function DashboardLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const initials = useMemo(() => {
    if (!user) return "";
    return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  }, [user]);

  if (!user) return null;
  if(user.role !== "business") return <Navigate to="/" />;

  function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
    return (
      <div className="flex flex-col h-full overflow-hidden px-3">
        {/* Logo */}
        <Link
          to="/"
          onClick={onNavClick}
          className="flex items-center h-16"
        >
          <div className="h-11 px-2 rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>

          <span
            className={`text-xl font-semibold text-primary font-serif whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
              ${collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"}
            `}
          >
            Haybooking
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {NAV_ITEMS.map(({ label, Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center rounded-xl select-none h-11 px-3.5 transition-colors duration-200 ease-[cubic-bezier(0.65,0,0.35,1)]
                ${
                  isActive
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:bg-white/50 hover:text-gray-800"
                }`
              }
            >
              <span className="flex items-center justify-center w-5 h-5 shrink-0">
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </span>

              <span
                className={`whitespace-nowrap font-medium leading-none text-[13.5px] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
                  ${collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[180px] opacity-100 ml-2.5"}
                `}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-start justify-center p-5 bg-[linear-gradient(145deg,#ded4d7c5_0%,#c2cbcdff_100%)]">
      <div className="w-full flex rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-40px)] relative">

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/25 backdrop-blur-[2px] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-30 h-full flex flex-col border-r border-black/5 bg-[#efe9e8] md:hidden
          w-[260px] transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:bg-white/60 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block shrink-0 border-r border-black/5 bg-[#efe9e8] overflow-y-auto
          transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] overflow-x-hidden
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          `}
        >
          <SidebarContent />
        </aside>

        {/* Main Area */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 bg-white/30">

          {/* Header */}
          <header className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-lg">
            <div className="flex items-center gap-3">

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-white/60 transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop Collapse */}
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="hidden md:flex items-center justify-center w-[34px] h-[34px] rounded-xl bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow duration-200"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft
                  className={`w-4 h-4 text-gray-500 transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
                  ${collapsed ? "rotate-180" : "rotate-0"}
                  `}
                />
              </button>

              <h1 className="text-[17px] font-semibold tracking-tight text-gray-800 font-serif truncate">
                {user.business?.businessName}
              </h1>
            </div>

            {/* Avatar */}
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm bg-primary text-white select-none">
              {initials}
            </div>
          </header>

          {/* Content — only this scrolls */}
          <main className="flex-1 overflow-auto p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}