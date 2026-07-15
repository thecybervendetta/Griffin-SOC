import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/indicators")({
  component: Indicators,
});

function Indicators() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Indicators of Compromise (IoCs)
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Database of malicious URLs, IPs, and Hashes extracted from scanned emails.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search indicators..."
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0f1b3d] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Value</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">First Seen</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {[
              { type: "URL", value: "hxxps[://]paypa1-secure-login[.]co/verify", date: "2 mins ago" },
              { type: "Hash (SHA256)", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", date: "1 hour ago" },
              { type: "IP", value: "103.224.182.251", date: "4 hours ago" },
              { type: "Domain", value: "bec-actor.top", date: "12 hours ago" },
            ].map((ioc, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{ioc.type}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-red-600">{ioc.value}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{ioc.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-[#0f1b3d] hover:underline font-semibold text-xs">Block Globally</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
