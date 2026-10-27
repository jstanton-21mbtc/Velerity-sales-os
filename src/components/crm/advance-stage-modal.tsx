"use client";

import { useState, useTransition } from "react";
import { advanceDealStage } from "@/app/(app)/crm/actions";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/compliance";
import { ChevronRight, ShieldCheck, X, AlertTriangle } from "lucide-react";
import type { DealStage } from "@prisma/client";

export function AdvanceStageModal({
  dealId,
  currentStage,
  hasCompliance,
  currentUserId,
  onAdvanced,
}: {
  dealId: string;
  currentStage: DealStage;
  hasCompliance: boolean;
  currentUserId: string;
  onAdvanced?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [complianceNotes, setComplianceNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const nextStage = currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIdx + 1]
    : null;

  const needsCompliance =
    currentStage === "BUYER_COMPLIANCE_SCREENING" && !hasCompliance;

  if (!nextStage || currentStage === "DEPLOYED_EXPANSION") return null;

  function handleAdvance(e: React.FormEvent) {
    e.preventDefault();
    if (needsCompliance && complianceNotes.trim().length < 10) {
      setError("Compliance notes must be at least 10 characters.");
      return;
    }
    setError("");

    startTransition(async () => {
      const result = await advanceDealStage(
        dealId,
        nextStage!,
        needsCompliance
          ? { complianceReviewedById: currentUserId, complianceNotes }
          : undefined
      );
      if (!result.ok) {
        setError(result.error ?? "Could not advance stage");
        return;
      }
      setOpen(false);
      onAdvanced?.();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
      >
        Advance to {STAGE_LABELS[nextStage]}
        <ChevronRight className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Advance Stage</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500">{STAGE_LABELS[currentStage]}</div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-sm font-semibold text-slate-900">{STAGE_LABELS[nextStage]}</div>
            </div>

            <form onSubmit={handleAdvance}>
              {needsCompliance && (
                <div className="mb-5">
                  <div className="flex items-start gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Compliance review required</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        This deal cannot advance past Compliance Screening without a completed export control review.
                      </p>
                    </div>
                  </div>

                  <label className="block text-slate-700 text-sm font-medium mb-1.5">
                    Compliance notes <span className="text-slate-400 font-normal">(min 10 chars)</span>
                  </label>
                  <textarea
                    value={complianceNotes}
                    onChange={(e) => setComplianceNotes(e.target.value)}
                    rows={4}
                    required
                    placeholder="e.g. Buyer is US domestic entity. No restricted parties identified. End-use is commercial AI training. Approved to proceed."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    You are recording that export control screening has been completed.
                    This is logged in the audit trail.
                  </p>
                </div>
              )}

              {!needsCompliance && (
                <p className="text-slate-500 text-sm mb-5">
                  Move this deal from <strong>{STAGE_LABELS[currentStage]}</strong> to{" "}
                  <strong>{STAGE_LABELS[nextStage]}</strong>?
                </p>
              )}

              {error && (
                <div className="flex items-center gap-1.5 text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

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
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
                >
                  {isPending ? "Moving…" : `Move to ${STAGE_LABELS[nextStage]}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
