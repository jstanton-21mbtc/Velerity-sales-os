"use client";

import Link from "next/link";
import { STAGE_LABELS, STAGE_ORDER, STAGE_COLORS } from "@/lib/compliance";
import { formatUsd } from "@/lib/utils";
import type { DealStage } from "@prisma/client";
import { Shield } from "lucide-react";

type DealCard = {
  id: string;
  title: string;
  stage: DealStage;
  valueUsd: number | null;
  targetGpuGeneration: string | null;
  gpuQuantity: number | null;
  isSampleData: boolean;
  account: { id: string; name: string };
  assignedRep: { name: string | null; email: string } | null;
};

const VISIBLE_STAGES = STAGE_ORDER.filter(
  (s) => s !== "CLOSED_LOST" && s !== "DEPLOYED_EXPANSION"
);

export function PipelineClient({ deals }: { deals: DealCard[] }) {
  const byStage = VISIBLE_STAGES.reduce<Record<string, DealCard[]>>((acc, stage) => {
    acc[stage] = deals.filter((d) => d.stage === stage);
    return acc;
  }, {});

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
      {VISIBLE_STAGES.map((stage) => {
        const cards = byStage[stage] ?? [];
        const colors = STAGE_COLORS[stage];
        const stageValue = cards.reduce((s, d) => s + (d.valueUsd ?? 0), 0);
        const isGate = stage === "CONFIGURATION_QUOTE";

        return (
          <div key={stage} className="flex flex-col shrink-0 w-64">
            {/* Column header */}
            <div className={`rounded-t-lg px-3 py-2.5 border ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${colors.text} flex items-center gap-1`}>
                  {isGate && <Shield className="w-3 h-3" />}
                  {STAGE_LABELS[stage]}
                </span>
                <span className={`text-xs font-medium ${colors.text} opacity-60`}>
                  {cards.length}
                </span>
              </div>
              {stageValue > 0 && (
                <p className={`text-xs mt-0.5 ${colors.text} opacity-60`}>
                  {formatUsd(stageValue)}
                </p>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 bg-slate-50 border border-t-0 border-slate-200 rounded-b-lg p-2 space-y-2">
              {cards.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Empty</p>
              )}
              {cards.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/crm/deals/${deal.id}`}
                  className="block bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-medium text-slate-900 leading-snug mb-1">
                    {deal.title}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">{deal.account.name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {deal.targetGpuGeneration && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {deal.targetGpuGeneration}
                          {deal.gpuQuantity ? ` ×${deal.gpuQuantity}` : ""}
                        </span>
                      )}
                      {deal.isSampleData && (
                        <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                          sample
                        </span>
                      )}
                    </div>
                    {deal.valueUsd != null && (
                      <span className="text-xs font-semibold text-slate-700">
                        {formatUsd(deal.valueUsd)}
                      </span>
                    )}
                  </div>
                  {deal.assignedRep && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      {deal.assignedRep.name ?? deal.assignedRep.email}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
