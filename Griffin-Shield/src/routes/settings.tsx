import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Save } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage API keys and integration configurations.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <SettingsIcon className="h-5 w-5 text-[#0f1b3d]" />
            <h2 className="text-lg font-semibold text-slate-900">Integrations</h2>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-700">VirusTotal API Key</label>
              <div className="mt-1">
                <input
                  type="password"
                  defaultValue="********************************"
                  className="block w-full rounded-md border-slate-200 shadow-sm focus:border-[#0f1b3d] focus:ring-[#0f1b3d] sm:text-sm bg-slate-50 py-2 px-3 border"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Used for attachment and URL analysis.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">IMAP Monitor Address</label>
              <div className="mt-1">
                <input
                  type="text"
                  defaultValue="richardovensehi@gmail.com"
                  className="block w-full rounded-md border-slate-200 shadow-sm focus:border-[#0f1b3d] focus:ring-[#0f1b3d] sm:text-sm bg-slate-50 py-2 px-3 border"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#0f1b3d] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e3a5f]"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
