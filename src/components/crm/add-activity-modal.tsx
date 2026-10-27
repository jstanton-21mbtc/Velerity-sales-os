"use client";

import { useState, useTransition } from "react";
import { addActivity } from "@/app/(app)/crm/actions";
import { X, Plus } from "lucide-react";
import type { ActivityType } from "@prisma/client";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "CALL", label: "Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "NOTE", label: "Note" },
  { value: "TASK", label: "Task" },
];

export function AddActivityModal({
  dealId,
  accountId,
  onDone,
}: {
  dealId?: string;
  accountId?: string;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ActivityType>("NOTE");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) { setError("Subject is required"); return; }
    setError("");

    startTransition(async () => {
      await addActivity({ type, subject, body: body || undefined, dealId, accountId });
      setSubject("");
      setBody("");
      setType("NOTE");
      setOpen(false);
      onDone?.();
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Log activity
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Log Activity</h3>
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    type === t.value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder={type === "CALL" ? "Call with Sarah Chen" : type === "EMAIL" ? "Sent follow-up re: H100 config" : "Notes from discovery"}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">Notes</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Add details..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
