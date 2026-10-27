import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Plus, Truck, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SupplierStatusBadge } from "@/components/inventory/status-badges";

export default async function SuppliersPage() {
  const session = await requireSession();

  const suppliers = await prisma.supplier.findMany({
    where: { orgId: session.orgId },
    include: { _count: { select: { units: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Package className="w-4 h-4" />
            <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Suppliers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
        </div>
        <Link
          href="/inventory/suppliers/new"
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add supplier
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Truck className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No suppliers yet</h3>
          <p className="text-slate-500 text-sm mb-4">Track your sourcing partners and their qualification status.</p>
          <Link
            href="/inventory/suppliers/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add supplier
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Supplier</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Status</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Units</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Qualified</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/inventory/suppliers/${s.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {s.name}
                    </Link>
                    {s.domain && <p className="text-xs text-slate-400 mt-0.5">{s.domain}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <SupplierStatusBadge status={s.qualificationStatus} />
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600">{s._count.units}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {s.qualifiedAt ? formatDate(s.qualifiedAt) : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
