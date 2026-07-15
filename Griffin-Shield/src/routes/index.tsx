import { createFileRoute } from "@tanstack/react-router";
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Radio,
  FileWarning,
  Link2,
  CheckCircle2,
  Activity,
  LayoutDashboard,
  Inbox,
  Crosshair,
  Fingerprint,
  BookOpen,
  Settings,
  Search,
  Bell,
  ChevronRight,
  TrendingUp,
  Timer,
  Archive,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Incident = {
  id: string;
  severity: "High" | "Critical";
  timestamp: string;
  sender: string;
  subject: string;
  confidence: number;
  classification: string;
  vtFlagged: number;
  vtTotal: number;
  fileName: string;
  fileHash?: string;
  indicators: string[];
};

const INCIDENTS: Incident[] = [
  {
    id: "INC-20261-0842",
    severity: "High",
    timestamp: "2 mins ago",
    sender: "billing-support@paypa1-secure.co",
    subject: "Urgent: Your account access will be suspended within 24 hours",
    confidence: 98,
    classification: "MALICIOUS / CREDENTIAL PHISHING",
    vtFlagged: 12,
    vtTotal: 64,
    fileName: "invoice_9821.html",
    indicators: [
      "hxxps[://]paypa1-secure-login[.]co/verify",
      "hxxp[://]cdn-assets[.]malicious-site[.]com/track.js",
      "hxxps[://]login-portal[.]evil-cdn[.]xyz/auth",
    ],
  },
  {
    id: "INC-20261-0839",
    severity: "High",
    timestamp: "17 mins ago",
    sender: "no-reply@microsft-teams-alerts.net",
    subject: "You have 3 pending voicemail messages — click to review",
    confidence: 94,
    classification: "MALICIOUS / CREDENTIAL PHISHING",
    vtFlagged: 9,
    vtTotal: 64,
    fileName: "voicemail_notice.htm",
    indicators: [
      "hxxps[://]teams-msft-portal[.]net/vm/listen",
      "hxxp[://]tracker[.]phish-kit[.]ru/pixel.gif",
    ],
  },
  {
    id: "INC-20261-0834",
    severity: "Critical",
    timestamp: "1 hr ago",
    sender: "hr.payroll@internaI-corp-mail.com",
    subject: "Q3 Bonus Disbursement — Confirm Direct Deposit Details",
    confidence: 99,
    classification: "MALICIOUS / BUSINESS EMAIL COMPROMISE",
    vtFlagged: 21,
    vtTotal: 64,
    fileName: "bonus_authorization_Q3.docm",
    indicators: [
      "hxxps[://]payroll-confirm[.]internaI-corp[.]com/auth",
      "hxxp[://]103[.]224[.]182[.]251/loader.php",
      "hxxps[://]docs-share[.]bec-actor[.]top/open",
    ],
  },
];





function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 100;
  const h = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <path d={area} fill={color} fillOpacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaDir,
  icon: Icon,
  spark,
  sparkColor,
  footnote,
}: {
  label: string;
  value: string;
  delta: string;
  deltaDir: "up" | "down" | "flat";
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  spark: number[];
  sparkColor: string;
  footnote: string;
}) {
  const deltaColor =
    deltaDir === "up"
      ? "text-red-600 bg-red-50"
      : deltaDir === "down"
      ? "text-green-700 bg-green-50"
      : "text-slate-600 bg-slate-100";

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-[#0f1b3d]">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${deltaColor}`}
        >
          <TrendingUp
            className={`h-3 w-3 ${deltaDir === "down" ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
          {delta}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-1.5">
        <p className="text-3xl font-bold tracking-tight text-slate-900 font-display">
          {value}
        </p>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{footnote}</p>

      <div className="mt-3">
        <Sparkline points={spark} color={sparkColor} />
      </div>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Model confidence</span>
        <span className="font-mono font-semibold text-red-600">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-red-600" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:shadow-[0_6px_20px_-8px_rgba(15,23,42,0.12)]">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-red-600" />
      <div className="p-5 pl-6 sm:p-6 sm:pl-7">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 ring-1 ring-inset ring-red-100">
              <AlertTriangle className="h-4.5 w-4.5 text-red-600" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {incident.severity}
                </span>
                <span className="font-mono text-xs font-medium text-slate-500">
                  {incident.id}
                </span>
                <span className="hidden h-3 w-px bg-slate-200 sm:block" />
                <span className="hidden text-[11px] font-medium text-slate-500 sm:inline">
                  Intercepted · Quarantined · Pending review
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 sm:hidden">
                Intercepted · Quarantined · Pending review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{incident.timestamp}</span>
            </div>
            <button className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex">
              Investigate
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sender + Subject */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              From
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-800 ring-1 ring-inset ring-slate-200">
              {incident.sender}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Subject
            </span>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-slate-900 font-display">
              {incident.subject}
            </p>
          </div>
        </div>

        {/* AI Classification */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                AI Classification
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-red-600">
              {incident.classification}
            </span>
          </div>
          <ConfidenceBar value={incident.confidence} />
        </div>

        {/* Intelligence Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-slate-500" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Attachment Analysis
              </h4>
            </div>
            <div className="mt-2.5 space-y-1.5">
              <p className="font-mono text-xs text-slate-800 break-all">{incident.fileName}</p>
              {incident.fileHash && (
                <p className="font-mono text-[10px] text-slate-500 break-all bg-slate-50 p-1 rounded border border-slate-100">
                  {incident.fileHash}
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-red-600"
                    style={{ width: `${(incident.vtFlagged / (incident.vtTotal || 1)) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] font-semibold text-red-600">
                  {incident.vtFlagged}/{incident.vtTotal}
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500">
                Flagged malicious · VirusTotal · Hybrid Analysis · ANY.RUN
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-slate-500" />
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Extracted Indicators
              </h4>
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {incident.indicators.map((ioc) => (
                <li
                  key={ioc}
                  className="break-all rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700"
                >
                  {ioc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
        <CheckCircle2 className="h-9 w-9 text-green-600" strokeWidth={2.25} />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 font-display">
        No Active Incidents
      </h3>
      <p className="mt-1.5 text-sm text-slate-500">
        Telemetry stream is secure. No phishing signatures detected.
      </p>
    </div>
  );
}

function mapBackendToFrontend(alert: any): Incident {
  let vtFlagged = 0;
  let vtTotal = 64;
  let fileName = "Analyzed Attachment";
  let fileHash = undefined;

  if (alert.intel) {
    const vtMatch = alert.intel.match(/by (\d+) engines/);
    if (vtMatch) vtFlagged = parseInt(vtMatch[1]);

    const statsMatch = alert.intel.match(/Malicious: (\d+), Suspicious: (\d+), Clean: (\d+)/);
    if (statsMatch) {
      vtTotal = parseInt(statsMatch[1]) + parseInt(statsMatch[2]) + parseInt(statsMatch[3]);
    }

    const fileMatch = alert.intel.match(/<b>File:<\/b> (.*?)\n/);
    if (fileMatch) fileName = fileMatch[1];

    const hashMatch = alert.intel.match(/<b>SHA256:<\/b> <code>(.*?)<\/code>/);
    if (hashMatch) fileHash = hashMatch[1];
  }
  
  let parsedUrls = [];
  try { parsedUrls = JSON.parse(alert.urls); } catch(e) {}

  return {
    id: `INC-${alert.id}`,
    severity: alert.confidence > 0.9 ? "Critical" : "High",
    timestamp: new Date(alert.timestamp).toLocaleTimeString(),
    sender: alert.sender,
    subject: alert.subject,
    confidence: Math.round(alert.confidence * 100),
    classification: alert.verdict,
    vtFlagged: vtFlagged,
    vtTotal: vtTotal,
    fileName: fileName,
    fileHash: fileHash,
    indicators: parsedUrls,
  };
}

function Index() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        const mappedData = data.map(mapBackendToFrontend).reverse();
        setIncidents(mappedData);
      })
      .catch(console.error);

    const eventSource = new EventSource("http://localhost:5000/stream");
    
    eventSource.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      const mapped = mapBackendToFrontend(newAlert);
      setIncidents((prev) => {
        if (prev.some(inc => inc.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    };

    return () => eventSource.close();
  }, []);

  const clearData = () => {
    if (confirm("Are you sure you want to clear all historical incidents?")) {
      fetch("http://localhost:5000/api/alerts", { method: "DELETE" })
        .then(() => setIncidents([]))
        .catch(console.error);
    }
  };

  const exportReport = () => {
    if (incidents.length === 0) {
      alert("No data to export");
      return;
    }
    
    const headers = ["ID", "Timestamp", "Severity", "Classification", "Sender", "Subject", "Confidence"];
    
    const rows = incidents.map(inc => [
      inc.id,
      `"${inc.timestamp}"`,
      inc.severity,
      `"${inc.classification}"`,
      `"${inc.sender}"`,
      `"${inc.subject.replace(/"/g, '""')}"`,
      `${inc.confidence}%`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `griffin-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const threatsIntercepted = incidents.length.toString();
  const quarantinedCount = incidents.filter(i => i.classification.includes("MALICIOUS")).length.toString();
  const lastIncidentTime = incidents.length > 0 ? incidents[0].timestamp : "N/A";

  return (
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <span>Console</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-700">Overview</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 font-display">
                Threat Operations Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time triage of intercepted phishing attempts across your organization.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearData} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                Clear History
              </button>
              <button onClick={exportReport} className="inline-flex items-center gap-1.5 rounded-md bg-[#0f1b3d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3a5f]">
                Export report
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Threats Intercepted"
              value={threatsIntercepted}
              delta="+Live"
              deltaDir="up"
              icon={ShieldAlert}
              spark={[12, 18, 15, 22, 19, 28, 24, 30, 26, 34, 31, Math.max(42, incidents.length)]}
              sparkColor="#dc2626"
              footnote="Total threats caught"
            />
            <KpiCard
              label="Last Incident"
              value={lastIncidentTime}
              delta="Live"
              deltaDir="flat"
              icon={Activity}
              spark={[3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10]}
              sparkColor="#0f1b3d"
              footnote="Time of last detection"
            />
            <KpiCard
              label="Mean Time to Detect"
              value="1.4s"
              delta="-12%"
              deltaDir="down"
              icon={Timer}
              spark={[3.2, 2.8, 3.0, 2.4, 2.6, 2.1, 1.9, 2.0, 1.7, 1.6, 1.5, 1.4]}
              sparkColor="#16a34a"
              footnote="Live Engine Execution Time"
            />
            <KpiCard
              label="Quarantined"
              value={quarantinedCount}
              delta="Active"
              deltaDir="up"
              icon={Archive}
              spark={[42, 55, 61, 70, 82, 90, 95, 104, 110, 118, 122, Math.max(128, incidents.length)]}
              sparkColor="#0f1b3d"
              footnote="Successfully moved to IMAP Spam"
            />
          </section>

          {/* Feed */}
          <section id="incidents-feed" className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 font-display">
                  Incident Feed
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">{incidents.length} active</span>
                <span className="h-3 w-px bg-slate-200" />
                <button className="font-semibold text-[#0f1b3d] hover:underline">View all</button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {incidents.length === 0 ? (
                <EmptyState />
              ) : (
                incidents.map((inc) => <IncidentCard key={inc.id} incident={inc} />)
              )}
            </div>
          </section>

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
            <span>Griffin SOC · Enterprise Security Operations · v1.0</span>
            <span className="font-mono">
              Region: us-east-1 · Session: {new Date().getUTCFullYear()}
            </span>
          </footer>
        </main>
  );
}
