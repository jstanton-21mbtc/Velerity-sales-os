import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UnitForm } from "@/components/inventory/unit-form";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function NewUnitPage() {
  const session = await requireSession();

  const suppliers = await prisma.supplier.findMany({
    where: { orgId: session.orgId, qualificationStatus: "QUALIFIED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Package className="w-4 h-4" />
        <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Add unit</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Inventory Unit</h1>
      <UnitForm suppliers={suppliers} />
    </div>
  );
}
