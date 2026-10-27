import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Plus, Truck } from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { UnitStatusBadge, GradeBadge } from "@/components/inventory/status-badges";
import type { UnitStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: UnitStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "INCOMING", label: "Incoming" },
  { value: "TESTING", label: "Testing" },
  { value: "CERTIFIED", label: "Certified" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
  { value: "SHIPPED", label: "Shipped" },
];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireSession();
  const { status } = await searchParams;
  const filter = status as UnitStatus | undefined;

  const units = await prisma.inventoryUnit.findMany({
    where: {
      orgId: session.orgId,
      ...(filter && filter !== ("ALL" as string) ? { status: filter } : {}),
    },
    include: {
      supplier: { select: { name: true } },
      reservations: {
        where: { releasedAt: null },
        include: { deal: { select: { id: true, title: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const counts = await prisma.inventoryUnit.groupBy({
    by: ["status"],
    where: { orgId: session.orgId },
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((s, c) => s + c._count, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Package className="w-4 h-4" />
            <span>Inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory/suppliers"
            className="flex items-center gap-1.5 text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <Truck className="w-4 h-4" />
            Suppliers
          </Link>
          <Link
            href="/inventory/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add unit
          </Link>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-lg p-1 w-fit">
        {STATUS_OPTIONS.map((opt) => {
          const active = (!filter && opt.value === "ALL") || filter === opt.value;
          const count =
            opt.value === "ALL"
              ? totalCount
              : (countMap[opt.value as UnitStatus] ?? 0);
          return (
            <Link
              key={opt.value}
              href={opt.value === "ALL" ? "/inventory" : `/inventory?status=${opt.value}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.label}
              <span className="ml-1.5 text-slate-400">{count}</span>
            </Link>
          );
        })}
      </div>

      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No units</h3>
          <p className="text-slate-500 text-sm mb-4">
            Add your first inventory unit to get started.
          </p>
          <Link
            href="/inventory/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add unit
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Unit</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">GPU</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Grade</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Reserved for</th>
                <th className="text-right px-5 py-3 font-medium text-slate-500">List price</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((unit) => {
                const activeRes = unit.reservations[0];
                return (
                  <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/inventory/${unit.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {unit.oem} {unit.model}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{unit.serialNumber}</p>
                      {unit.isSampleData && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">
                          sample
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {unit.gpuType} × {unit.gpuCount}
                    </td>
                    <td className="px-5 py-3">
                      <GradeBadge grade={unit.conditionGrade} />
                    </td>
                    <td className="px-5 py-3">
                      <UnitStatusBadge status={unit.status} />
                    </td>
                    <td className="px-5 py-3">
                      {activeRes ? (
                        <Link
                          href={`/crm/deals/${activeRes.deal.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {activeRes.deal.title}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-900 font-medium">
                      {unit.listPriceUsd != null ? formatUsd(unit.listPriceUsd) : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{unit.location ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
