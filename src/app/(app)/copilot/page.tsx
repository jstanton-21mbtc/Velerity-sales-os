import { Bot } from "lucide-react";

export default function CopilotPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        <Bot className="w-4 h-4" />
        <span>Rep Copilot</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Rep Copilot</h1>
      <p className="text-slate-500 mt-2">Coming in Phase 5 — AI-powered hardware Q&A, call prep, and outreach drafts.</p>
    </div>
  );
}
