import { Search } from "lucide-react";

export default function ProspectingPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        <Search className="w-4 h-4" />
        <span>Prospecting</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Prospecting</h1>
      <p className="text-slate-500 mt-2">Coming in Phase 5 — ICP library, buying signals, account scoring, and AI research.</p>
    </div>
  );
}
