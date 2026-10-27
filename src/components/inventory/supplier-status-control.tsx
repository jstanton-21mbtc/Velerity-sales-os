"use client";

import { useTransition } from "react";
import { updateSupplierStatus } from "@/app/(app)/inventory/actions";
import type { SupplierStatus } from "@prisma/client";

export function SupplierStatusControl({
  supplierId,
  currentStatus,
}: {
  supplierId: string;
  currentStatus: SupplierStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function set(status: SupplierStatus) {
    startTransition(() => updateSupplierStatus(supplierId, status));
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => set("QUALIFIED")}
        disabled={isPending || currentStatus === "QUALIFIED"}
        className="flex-1 px-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors"
      >
        Qualify
      </button>
      <button
        onClick={() => set("PENDING")}
        disabled={isPending || currentStatus === "PENDING"}
        className="flex-1 px-3 py-2 text-xs border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-medium rounded-lg transition-colors"
      >
        Set Pending
      </button>
      <button
        onClick={() => set("DISQUALIFIED")}
        disabled={isPending || currentStatus === "DISQUALIFIED"}
        className="flex-1 px-3 py-2 text-xs bg-red-600 hover:bg-red-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors"
      >
        Disqualify
      </button>
    </div>
  );
}
