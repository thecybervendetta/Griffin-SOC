import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Crosshair,
  Fingerprint,
  BookOpen,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [incidentCount, setIncidentCount] = useState(0);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then((res) => res.json())
      .then((data) => setIncidentCount(data.length))
      .catch(() => {});

    const eventSource = new EventSource("http://localhost:5000/stream");
    eventSource.onmessage = () => {
      setIncidentCount((prev) => prev + 1);
    };
    return () => eventSource.close();
  }, []);

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", to: "/" },
    { icon: Inbox, label: "Incidents", badge: incidentCount.toString(), to: "/#incidents-feed" },
    { icon: Crosshair, label: "Threat Intel", to: "/threat-intel" },
    { icon: Fingerprint, label: "Indicators", to: "/indicators" },
    { icon: BookOpen, label: "Playbooks", to: "/playbooks" },
  ];

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
          <img src="/griffin-logo.png" alt="Griffin Logo" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-slate-900 font-display">Griffin</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Security Ops</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Console
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.to || (item.to === "/#incidents-feed" && currentPath === "/");
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`group flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <item.icon
                  className={`h-4 w-4 ${isActive ? "text-[#0f1b3d]" : "text-slate-400 group-hover:text-slate-600"}`}
                  strokeWidth={2}
                />
                {item.label}
              </span>
              {item.badge && item.badge !== "0" && (
                <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white leading-4">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <p className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        <Link 
          to="/settings" 
          className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition ${
            currentPath === "/settings"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings 
             className={`h-4 w-4 ${currentPath === "/settings" ? "text-[#0f1b3d]" : "text-slate-400 group-hover:text-slate-600"}`}
             strokeWidth={2} 
          />
          Settings
        </Link>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center justify-between rounded-md px-2 py-2 group hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.username || "Analyst"}</p>
              <p className="truncate text-[10px] text-slate-500">Tier 2 · SOC East</p>
            </div>
          </div>
          <button 
            onClick={logout}
            title="Sign out"
            className="text-slate-400 hover:text-red-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
