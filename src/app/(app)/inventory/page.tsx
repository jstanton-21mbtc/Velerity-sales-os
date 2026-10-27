import { Package } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        <Package className="w-4 h-4" />
        <span>Inventory</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
      <p className="text-slate-500 mt-2">Coming in Phase 3 — Serialized units, certification tracking, and quote builder.</p>
    </div>
  );
}
