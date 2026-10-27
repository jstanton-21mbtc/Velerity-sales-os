import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Users, ChevronRight, Shield, AlertTriangle,
  Clock, CheckCircle2, XCircle, FileText,
} from "lucide-react";
import { formatDate, formatUsd } from "@/lib/utils";
import { StageBadge } from "@/components/crm/stage-badge";
import { ActivityFeed } from "@/components/crm/activity-feed";
import { AddActivityModal } from "@/components/crm/add-activity-modal";
import { AdvanceStageModal } from "@/components/crm/advance-stage-modal";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/compliance";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id, orgId: session.orgId },
    include: {
      account: { select: { id: true, name: true } },
      assignedRep: { select: { id: true, name: true, email: true } },
      complianceReviewedBy: { select: { name: true, email: true } },
      contacts: true,
      activities: {
        orderBy: { occurredAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!deal) notFound();

  const hasCompliance = !!(
    deal.complianceReviewedById &&
    deal.complianceReviewedAt &&
    deal.complianceNotes &&
    deal.complianceNotes.length >= 10
  );

  const isClosed =
    deal.stage === "DEPLOYED_EXPANSION" || deal.stage === "CLOSED_LOST";

  const stageIdx = STAGE_ORDER.indexOf(deal.stage);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/deals" className="hover:text-slate-600">Deals</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/crm/accounts/${deal.account.id}`} className="hover:text-slate-600">
          {deal.account.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{deal.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
            {deal.isSampleData && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                sample
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StageBadge stage={deal.stage} />
            {deal.valueUsd != null && (
              <span className="text-slate-600 font-semibold">{formatUsd(deal.valueUsd)}</span>
            )}
            {deal.targetGpuGeneration && (
              <span className="text-sm text-slate-500">
                {deal.targetGpuGeneration}
                {deal.gpuQuantity ? ` × ${deal.gpuQuantity} GPUs` : ""}
                {deal.nodeQuantity ? ` / ${deal.nodeQuantity} nodes` : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/inventory/quote/${deal.id}`}
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Quote builder
          </Link>
          {!isClosed && (
            <AdvanceStageModal
              dealId={deal.id}
              currentStage={deal.stage}
              hasCompliance={hasCompliance}
              currentUserId={session.id}
            />
          )}
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {STAGE_ORDER.filter((s) => s !== "CLOSED_LOST").map((stage, idx) => {
            const isActive = stage === deal.stage;
            const isPast = idx < stageIdx && deal.stage !== "CLOSED_LOST";
            const isGate = stage === "CONFIGURATION_QUOTE";
            return (
              <div key={stage} className="flex items-center gap-0.5 min-w-0">
                <div
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isPast
                      ? "bg-slate-200 text-slate-500"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isGate && <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {STAGE_LABELS[stage]}
                </div>
                {idx < STAGE_ORDER.filter((s) => s !== "CLOSED_LOST").length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
          {deal.stage === "CLOSED_LOST" && (
            <div className="px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-600 whitespace-nowrap">
              <XCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
              Closed Lost
            </div>
          )}
        </div>
      </div>

      {/* Compliance gate warning */}
      {deal.stage === "BUYER_COMPLIANCE_SCREENING" && !hasCompliance && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Compliance review required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              This deal cannot advance past Compliance Screening without a completed export
              control review. Use "Advance Stage" to record the compliance decision.
            </p>
          </div>
        </div>
      )}

      {hasCompliance && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Compliance review complete</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Reviewed by {deal.complianceReviewedBy?.name ?? deal.complianceReviewedBy?.email} on{" "}
              {deal.complianceReviewedAt ? formatDate(deal.complianceReviewedAt) : "—"}
            </p>
            {deal.complianceNotes && (
              <p className="text-sm text-emerald-700 mt-1 italic">"{deal.complianceNotes}"</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 space-y-6">
          {/* Activities */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Activity</h2>
              <AddActivityModal dealId={deal.id} accountId={deal.account.id} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ActivityFeed activities={deal.activities} />
            </div>
          </section>

          {/* Audit log */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Audit trail
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {deal.auditLogs.length === 0 ? (
                <p className="text-slate-400 text-sm p-5">No audit entries.</p>
              ) : (
                deal.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">
                          {log.user.name ?? log.user.email}
                        </span>{" "}
                        {log.action === "stage_change" ? (
                          <>
                            moved from{" "}
                            <span className="font-medium">
                              {log.fromValue ? STAGE_LABELS[log.fromValue as keyof typeof STAGE_LABELS] ?? log.fromValue : "—"}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {log.toValue ? STAGE_LABELS[log.toValue as keyof typeof STAGE_LABELS] ?? log.toValue : "—"}
                            </span>
                          </>
                        ) : (
                          log.action.replace(/_/g, " ")
                        )}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-slate-400 mt-0.5">{log.notes}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Deal facts */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Deal details</h2>
            <dl className="space-y-2 text-sm">
              <Fact label="Account" value={
                <Link href={`/crm/accounts/${deal.account.id}`} className="text-blue-600 hover:underline">
                  {deal.account.name}
                </Link>
              } />
              <Fact label="Rep" value={deal.assignedRep?.name ?? deal.assignedRep?.email ?? "—"} />
              <Fact label="Value" value={deal.valueUsd != null ? formatUsd(deal.valueUsd) : "—"} />
              <Fact label="Budget" value={deal.budgetUsd != null ? formatUsd(deal.budgetUsd) : "—"} />
              <Fact label="Timeline" value={deal.timeline ?? "—"} />
              <Fact label="Workload" value={deal.workloadType ?? "—"} />
              <Fact label="Deployment" value={[deal.deploymentSite, deal.deploymentCountry].filter(Boolean).join(", ") || "—"} />
              {deal.competingPaths.length > 0 && (
                <div>
                  <dt className="text-slate-400 mb-1">Competing paths</dt>
                  <dd className="space-y-1">
                    {deal.competingPaths.map((p) => (
                      <span key={p} className="block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <Fact label="Created" value={formatDate(deal.createdAt)} />
              <Fact label="Updated" value={formatDate(deal.updatedAt)} />
              {deal.closeDate && <Fact label="Closed" value={formatDate(deal.closeDate)} />}
              {deal.winLossReason && <Fact label="Reason" value={deal.winLossReason} />}
            </dl>
          </section>

          {/* Contacts */}
          <section>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Contacts ({deal.contacts.length})
            </h2>
            {deal.contacts.length === 0 ? (
              <p className="text-slate-400 text-xs">No contacts linked.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {deal.contacts.map((c) => (
                  <Link
                    key={c.id}
                    href={`/crm/contacts/${c.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                      {c.title && <p className="text-xs text-slate-400">{c.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className="text-slate-700 text-right">{value}</dd>
    </div>
  );
}
