import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, ExternalLink } from "lucide-react";
import { formatDate, formatUsd } from "@/lib/utils";
import { UnitForm } from "@/components/inventory/unit-form";
import { UnitStatusBadge, GradeBadge, CertBadge } from "@/components/inventory/status-badges";
import { UnitStatusControls, ReleaseButton } from "@/components/inventory/unit-status-controls";

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [unit, suppliers, openDeals] = await Promise.all([
    prisma.inventoryUnit.findUnique({
      where: { id, orgId: session.orgId },
      include: {
        supplier: true,
        reservations: {
          include: { deal: { select: { id: true, title: true } } },
          orderBy: { reservedAt: "desc" },
        },
      },
    }),
    prisma.supplier.findMany({
      where: { orgId: session.orgId, qualificationStatus: "QUALIFIED" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.deal.findMany({
      where: {
        orgId: session.orgId,
        stage: { notIn: ["DEPLOYED_EXPANSION", "CLOSED_LOST"] },
      },
      select: { id: true, title: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!unit) notFound();

  const activeReservation = unit.reservations.find((r) => !r.releasedAt);
  const pastReservations = unit.reservations.filter((r) => r.releasedAt);

  const margin =
    unit.costUsd != null && unit.listPriceUsd != null
      ? ((unit.listPriceUsd - unit.costUsd) / unit.listPriceUsd) * 100
      : null;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Package className="w-4 h-4" />
        <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium font-mono">{unit.serialNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {unit.oem} {unit.model}
            {unit.isSampleData && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-3 align-middle font-normal">
                sample
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3">
            <UnitStatusBadge status={unit.status} />
            <GradeBadge grade={unit.conditionGrade} />
            <CertBadge status={unit.certStatus} />
          </div>
          <p className="text-slate-500 text-sm mt-2">
            {unit.gpuType} × {unit.gpuCount} GPU{unit.gpuCount !== 1 ? "s" : ""}
            {unit.location && ` · ${unit.location}`}
          </p>
        </div>
        {unit.listPriceUsd != null && (
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{formatUsd(unit.listPriceUsd)}</p>
            {unit.costUsd != null && (
              <p className="text-xs text-slate-400 mt-0.5">
                Cost: {formatUsd(unit.costUsd)}
                {margin != null && (
                  <span className="ml-1.5 text-emerald-600 font-medium">{margin.toFixed(1)}% margin</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 space-y-6">
          {/* Edit form */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Unit details</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <UnitForm
                mode="edit"
                unitId={unit.id}
                suppliers={suppliers}
                defaultValues={{
                  oem: unit.oem,
                  model: unit.model,
                  gpuType: unit.gpuType,
                  gpuCount: unit.gpuCount,
                  conditionGrade: unit.conditionGrade,
                  warrantyType: unit.warrantyType,
                  warrantyTermMonths: unit.warrantyTermMonths,
                  location: unit.location,
                  costUsd: unit.costUsd,
                  listPriceUsd: unit.listPriceUsd,
                  notes: unit.notes,
                  supplierId: unit.supplierId,
                }}
              />
            </div>
          </section>

          {/* Reservation history */}
          {(activeReservation || pastReservations.length > 0) && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Reservation history</h2>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {activeReservation && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <div>
                      <Link
                        href={`/crm/deals/${activeReservation.deal.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {activeReservation.deal.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Reserved {formatDate(activeReservation.reservedAt)} · Active
                      </p>
                    </div>
                    <ReleaseButton
                      unitId={unit.id}
                      dealId={activeReservation.deal.id}
                      dealTitle={activeReservation.deal.title}
                    />
                  </div>
                )}
                {pastReservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <Link
                        href={`/crm/deals/${r.deal.id}`}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        {r.deal.title}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(r.reservedAt)} → {r.releasedAt ? formatDate(r.releasedAt) : "—"} · Released
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Status controls */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Update status</h2>
            <UnitStatusControls
              unitId={unit.id}
              currentStatus={unit.status}
              currentCertStatus={unit.certStatus}
              openDeals={openDeals}
            />
          </section>

          {/* Facts */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h2>
            <dl className="space-y-2 text-sm">
              <Fact label="Serial" value={<span className="font-mono text-xs">{unit.serialNumber}</span>} />
              <Fact label="Supplier" value={unit.supplier?.name ?? "—"} />
              <Fact label="Warranty" value={
                unit.warrantyType
                  ? `${unit.warrantyType.replace(/_/g, " ")}${unit.warrantyTermMonths ? ` · ${unit.warrantyTermMonths}mo` : ""}`
                  : "—"
              } />
              {unit.healthReportUrl && (
                <Fact label="Health report" value={
                  <a
                    href={unit.healthReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                } />
              )}
              <Fact label="Added" value={formatDate(unit.createdAt)} />
              <Fact label="Updated" value={formatDate(unit.updatedAt)} />
            </dl>
          </section>

          {/* Notes */}
          {unit.notes && (
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notes</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{unit.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className="text-slate-700 text-right">{value}</dd>
    </div>
  );
}
