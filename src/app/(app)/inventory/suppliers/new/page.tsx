import { requireSession } from "@/lib/auth";
import { SupplierForm } from "@/components/inventory/supplier-form";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function NewSupplierPage() {
  await requireSession();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Package className="w-4 h-4" />
        <Link href="/inventory" className="hover:text-slate-600">Inventory</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/inventory/suppliers" className="hover:text-slate-600">Suppliers</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>New supplier</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add Supplier</h1>
      <SupplierForm />
    </div>
  );
}
