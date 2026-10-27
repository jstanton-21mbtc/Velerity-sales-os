import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { formatDate, formatUsd } from "@/lib/utils";
import { SupplierForm } from "@/components/inventory/supplier-form";
import { SupplierStatusBadge, UnitStatusBadge, GradeBadge } from "@/components/inventory/status-badges";
import { SupplierStatusControl } from "@/components/inventory/supplier-status-control";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id, orgId: session.orgId },
    include: {
      units: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!supplier) notFound();

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Package className="w-4 h-4" />
        <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/inventory/suppliers" className="hover:text-slate-600">Suppliers</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{supplier.name}</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{supplier.name}</h1>
        <SupplierStatusBadge status={supplier.qualificationStatus} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Units */}
        <div className="col-span-2 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Units from this supplier ({supplier.units.length})
            </h2>
            {supplier.units.length === 0 ? (
              <p className="text-slate-400 text-sm">No units sourced from this supplier yet.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-5 py-3 font-medium text-slate-500">Unit</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">GPU</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">Grade</th>
                      <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                      <th className="text-right px-5 py-3 font-medium text-slate-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplier.units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <Link
                            href={`/inventory/${unit.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600"
                          >
                            {unit.oem} {unit.model}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono">{unit.serialNumber}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{unit.gpuType} × {unit.gpuCount}</td>
                        <td className="px-5 py-3"><GradeBadge grade={unit.conditionGrade} /></td>
                        <td className="px-5 py-3"><UnitStatusBadge status={unit.status} /></td>
                        <td className="px-5 py-3 text-right text-slate-700">
                          {unit.costUsd != null ? formatUsd(unit.costUsd) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Qualification */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Qualification</h2>
            <SupplierStatusControl
              supplierId={supplier.id}
              currentStatus={supplier.qualificationStatus}
            />
            {supplier.qualifiedAt && (
              <p className="text-xs text-slate-400 mt-3">
                Qualified {formatDate(supplier.qualifiedAt)}
              </p>
            )}
          </section>

          {/* Edit */}
          <section className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Edit supplier</h2>
            <SupplierForm
              mode="edit"
              supplierId={supplier.id}
              defaultValues={{
                name: supplier.name,
                domain: supplier.domain,
                notes: supplier.notes,
              }}
            />
          </section>

          <p className="text-xs text-slate-400">Added {formatDate(supplier.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
