import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, FileText, Download } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { QuoteBuilder } from "@/components/inventory/quote-builder";
import { StageBadge } from "@/components/crm/stage-badge";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const session = await requireSession();
  const { dealId } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId, orgId: session.orgId },
    include: {
      account: { select: { id: true, name: true } },
      lineItems: { orderBy: { createdAt: "asc" } },
      reservations: {
        where: { releasedAt: null },
        include: {
          unit: {
            select: {
              id: true,
              serialNumber: true,
              oem: true,
              model: true,
              gpuType: true,
              gpuCount: true,
              conditionGrade: true,
              listPriceUsd: true,
            },
          },
        },
      },
    },
  });

  if (!deal) notFound();

  const subtotal = deal.lineItems.reduce(
    (s, i) => s + i.quantity * i.unitPriceUsd,
    0
  );

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Package className="w-4 h-4" />
        <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Quote</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/crm/deals/${deal.id}`} className="hover:text-slate-600">
          {deal.title}
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{deal.title}</h1>
          <div className="flex items-center gap-3">
            <Link
              href={`/crm/accounts/${deal.account.id}`}
              className="text-slate-500 hover:text-blue-600 text-sm"
            >
              {deal.account.name}
            </Link>
            <StageBadge stage={deal.stage} />
          </div>
        </div>
        <a
          href={`/api/quote/${deal.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Line items
            </h2>
          </div>
          <QuoteBuilder dealId={deal.id} initialItems={deal.lineItems} />
        </div>

        <div className="space-y-5">
          {/* Reserved units */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Reserved units ({deal.reservations.length})
            </h2>
            {deal.reservations.length === 0 ? (
              <p className="text-xs text-slate-400">No units reserved for this deal.</p>
            ) : (
              <div className="space-y-3">
                {deal.reservations.map((res) => (
                  <div key={res.id} className="border border-slate-100 rounded-lg p-3">
                    <Link
                      href={`/inventory/${res.unit.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600"
                    >
                      {res.unit.oem} {res.unit.model}
                    </Link>
                    <p className="text-xs text-slate-400 font-mono">{res.unit.serialNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {res.unit.gpuType} × {res.unit.gpuCount} · Grade {res.unit.conditionGrade}
                    </p>
                    {res.unit.listPriceUsd != null && (
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {formatUsd(res.unit.listPriceUsd)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Summary */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Line items</dt>
                <dd className="text-slate-700">{deal.lineItems.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Deal value</dt>
                <dd className="text-slate-700">
                  {deal.valueUsd != null ? formatUsd(deal.valueUsd) : "—"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                <dt className="font-semibold text-slate-900">Quote total</dt>
                <dd className="font-bold text-slate-900 text-base">{formatUsd(subtotal)}</dd>
              </div>
            </dl>
          </section>

          <Link
            href={`/crm/deals/${deal.id}`}
            className="block text-center text-sm text-blue-600 hover:underline"
          >
            Back to deal
          </Link>
        </div>
      </div>
    </div>
  );
}
