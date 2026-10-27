import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, LayoutList } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { PipelineClient } from "./pipeline-client";

export default async function PipelinePage() {
  const session = await requireSession();

  const deals = await prisma.deal.findMany({
    where: {
      orgId: session.orgId,
      stage: {
        notIn: ["DEPLOYED_EXPANSION", "CLOSED_LOST"],
      },
    },
    include: {
      account: { select: { id: true, name: true } },
      assignedRep: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalValue = deals.reduce((s, d) => s + (d.valueUsd ?? 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>CRM</span>
            <span>/</span>
            <span>Pipeline</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
            {totalValue > 0 && (
              <span className="text-slate-500 text-sm">
                {formatUsd(totalValue)} in {deals.length} open deal{deals.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crm/deals"
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <LayoutList className="w-4 h-4" />
            List view
          </Link>
          <Link
            href="/crm/deals/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New deal
          </Link>
        </div>
      </div>

      <PipelineClient deals={deals} />
    </div>
  );
}
