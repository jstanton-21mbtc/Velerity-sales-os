"use client";

import { useState, useTransition } from "react";
import { createSignal, deleteSignal } from "@/app/(app)/prospecting/actions";
import { Zap, Plus, Trash2, ExternalLink, X } from "lucide-react";

type SignalType =
  | "FUNDING_ROUND"
  | "JOB_POSTING"
  | "DATA_CENTER_EXPANSION"
  | "POWER_ANNOUNCEMENT"
  | "PUBLIC_STATEMENT"
  | "PRODUCT_LAUNCH"
  | "OTHER";

type Signal = {
  id: string;
  type: SignalType;
  title: string;
  summary: string | null;
  sourceUrl: string | null;
  detectedAt: Date;
  account: { id: string; name: string } | null;
};

type Account = { id: string; name: string };

const TYPE_LABELS: Record<SignalType, string> = {
  FUNDING_ROUND: "Funding Round",
  JOB_POSTING: "Job Posting",
  DATA_CENTER_EXPANSION: "DC Expansion",
  POWER_ANNOUNCEMENT: "Power Announcement",
  PUBLIC_STATEMENT: "Public Statement",
  PRODUCT_LAUNCH: "Product Launch",
  OTHER: "Other",
};

const TYPE_COLORS: Record<SignalType, string> = {
  FUNDING_ROUND: "bg-emerald-100 text-emerald-800 border-emerald-200",
  JOB_POSTING: "bg-blue-100 text-blue-800 border-blue-200",
  DATA_CENTER_EXPANSION: "bg-violet-100 text-violet-800 border-violet-200",
  POWER_ANNOUNCEMENT: "bg-amber-100 text-amber-800 border-amber-200",
  PUBLIC_STATEMENT: "bg-slate-100 text-slate-700 border-slate-200",
  PRODUCT_LAUNCH: "bg-indigo-100 text-indigo-800 border-indigo-200",
  OTHER: "bg-slate-100 text-slate-600 border-slate-200",
};

const ALL_TYPES: SignalType[] = [
  "FUNDING_ROUND",
  "JOB_POSTING",
  "DATA_CENTER_EXPANSION",
  "POWER_ANNOUNCEMENT",
  "PUBLIC_STATEMENT",
  "PRODUCT_LAUNCH",
  "OTHER",
];

export function SignalsClient({
  initialSignals,
  accounts,
}: {
  initialSignals: Signal[];
  accounts: Account[];
}) {
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [type, setType] = useState<SignalType>("FUNDING_ROUND");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [accountId, setAccountId] = useState("");
  const [detectedAt, setDetectedAt] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setType("FUNDING_ROUND");
    setTitle("");
    setSummary("");
    setSourceUrl("");
    setAccountId("");
    setDetectedAt("");
    setError("");
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSignal(id);
      setSignals((prev) => prev.filter((s) => s.id !== id));
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    startTransition(async () => {
      await createSignal({
        type,
        title: title.trim(),
        summary: summary.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        accountId: accountId || undefined,
        detectedAt: detectedAt ? new Date(detectedAt) : undefined,
      });
      resetForm();
      setShowModal(false);
      // Optimistic: reload — revalidatePath handles actual refresh
    });
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {signals.length} signal{signals.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add signal
        </button>
      </div>

      {/* Feed */}
      {signals.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No buying signals yet.</p>
          <p className="text-sm mt-1">Add signals when you spot funding rounds, job posts, or DC expansions.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {signals.map((sig) => (
            <div
              key={sig.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[sig.type]}`}
                  >
                    {TYPE_LABELS[sig.type]}
                  </span>
                  {sig.account && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {sig.account.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">
                    {new Date(sig.detectedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="font-medium text-slate-900 text-sm">{sig.title}</p>
                {sig.summary && (
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{sig.summary}</p>
                )}
                {sig.sourceUrl && (
                  <a
                    href={sig.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                  >
                    Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button
                onClick={() => handleDelete(sig.id)}
                disabled={isPending}
                className="shrink-0 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Signal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Add Buying Signal</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Signal Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SignalType)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Acme AI raises $50M Series B"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  placeholder="Brief context about why this is a signal..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Source URL</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">— None —</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Detected At</label>
                  <input
                    type="date"
                    value={detectedAt}
                    onChange={(e) => setDetectedAt(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-medium rounded-lg transition-colors"
                >
                  {isPending ? "Saving…" : "Add Signal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
