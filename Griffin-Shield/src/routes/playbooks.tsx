import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/playbooks")({
  component: Playbooks,
});

function Playbooks() {
  const [activePlaybooks, setActivePlaybooks] = useState<Record<string, boolean>>({
    pb1: true,
    pb2: false,
    pb3: true,
  });

  const toggle = (id: string) => {
    setActivePlaybooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
          Response Playbooks
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Automated rules and remediation actions for detected threats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: "pb1", name: "Auto-Quarantine BEC", desc: "Automatically move emails flagged as BEC to the IMAP spam folder." },
          { id: "pb2", name: "Block Sender Domain", desc: "If a sender domain has >3 critical alerts, block the domain at the gateway." },
          { id: "pb3", name: "Extract & Tag URLs", desc: "Automatically defang and extract URLs into the Indicators database." },
        ].map(pb => (
          <div key={pb.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-[#0f1b3d]" />
                <h3 className="font-semibold text-slate-900">{pb.name}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6">{pb.desc}</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold text-slate-600">Status</span>
              <button 
                onClick={() => toggle(pb.id)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${activePlaybooks[pb.id] ? 'bg-green-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${activePlaybooks[pb.id] ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
