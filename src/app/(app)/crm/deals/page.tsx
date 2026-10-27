import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, LayoutList } from "lucide-react";
import { formatDate, formatUsd } from "@/lib/utils";
import { StageBadge } from "@/components/crm/stage-badge";

export default async function DealsPage() {
  const session = await requireSession();

  const deals = await prisma.deal.findMany({
    where: { orgId: session.orgId },
    include: {
      account: { select: { id: true, name: true } },
      assignedRep: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const openDeals = deals.filter(
    (d) => d.stage !== "DEPLOYED_EXPANSION" && d.stage !== "CLOSED_LOST"
  );
  const closedDeals = deals.filter(
    (d) => d.stage === "DEPLOYED_EXPANSION" || d.stage === "CLOSED_LOST"
  );

  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.valueUsd ?? 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>CRM</span>
            <span>/</span>
            <span>Deals</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/crm/pipeline"
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <LayoutList className="w-4 h-4" />
            Pipeline view
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

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 mb-1">Open deals</p>
          <p className="text-2xl font-bold text-slate-900">{openDeals.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 mb-1">Pipeline value</p>
          <p className="text-2xl font-bold text-slate-900">{formatUsd(pipelineValue)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <p className="text-xs text-slate-500 mb-1">Closed won</p>
          <p className="text-2xl font-bold text-slate-900">
            {closedDeals.filter((d) => d.stage === "DEPLOYED_EXPANSION").length}
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <LayoutList className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No deals yet</h3>
          <p className="text-slate-500 text-sm mb-4">Create your first deal to start tracking the pipeline.</p>
          <Link
            href="/crm/deals/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            New deal
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Deal</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Account</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Stage</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">GPU</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">Value</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Rep</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/crm/deals/${deal.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {deal.title}
                    </Link>
                    {deal.isSampleData && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">
                        sample
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/crm/accounts/${deal.account.id}`}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {deal.account.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <StageBadge stage={deal.stage} />
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {deal.targetGpuGeneration
                      ? `${deal.targetGpuGeneration}${deal.gpuQuantity ? ` × ${deal.gpuQuantity}` : ""}`
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-900 font-medium">
                    {deal.valueUsd != null ? formatUsd(deal.valueUsd) : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {deal.assignedRep?.name ?? deal.assignedRep?.email ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(deal.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
