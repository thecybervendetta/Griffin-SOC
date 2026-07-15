import { createFileRoute } from "@tanstack/react-router";
import { Globe, Activity } from "lucide-react";

export const Route = createFileRoute("/threat-intel")({
  component: ThreatIntel,
});

function ThreatIntel() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Global Threat Intelligence
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Live analysis of emerging phishing campaigns and global actor signatures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-[#0f1b3d]" />
              <h2 className="text-lg font-semibold text-slate-900">Active Campaigns</h2>
            </div>
            <div className="space-y-4">
              {[
                { name: "Fake Microsoft Teams Voicemail", risk: "Critical", trend: "+24%" },
                { name: "Q3 HR Payroll Bonus Scam", risk: "High", trend: "+12%" },
                { name: "PayPal Billing Suspended (Variant C)", risk: "Medium", trend: "-5%" },
              ].map(campaign => (
                <div key={campaign.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{campaign.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">First seen: 48 hours ago</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-600">Trend: <span className={campaign.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}>{campaign.trend}</span></span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${campaign.risk === 'Critical' ? 'bg-red-600 text-white' : campaign.risk === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-slate-900'}`}>
                      {campaign.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-[#0f1b3d]" />
              <h2 className="text-lg font-semibold text-slate-900">Feed Status</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600">VirusTotal Database</span>
                <span className="text-green-600 font-semibold text-xs flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Synced</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Griffin Global Feeds</span>
                <span className="text-green-600 font-semibold text-xs flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Synced</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Hybrid Analysis</span>
                <span className="text-green-600 font-semibold text-xs flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Synced</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
