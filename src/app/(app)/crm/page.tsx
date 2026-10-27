import { Users } from "lucide-react";

export default function CrmPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        <Users className="w-4 h-4" />
        <span>CRM</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">CRM</h1>
      <p className="text-slate-500 mt-2">Coming in Phase 2 — Accounts, Contacts, Deals, and Pipeline.</p>
    </div>
  );
}
