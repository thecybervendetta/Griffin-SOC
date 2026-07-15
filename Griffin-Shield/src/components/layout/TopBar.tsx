import { Search, Bell } from "lucide-react";
import { useState } from "react";

export function TopBar() {
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search incidents, indicators, senders…"
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0f1b3d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1b3d]/10"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <button 
          onClick={() => setHasNotifications(false)}
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-600 ring-2 ring-white" />
          )}
        </button>
      </div>
    </div>
  );
}
