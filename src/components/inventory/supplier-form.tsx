"use client";

import { useState, useTransition } from "react";
import { createSupplier, updateSupplier } from "@/app/(app)/inventory/actions";
import { useRouter } from "next/navigation";

type SupplierFormProps =
  | { mode?: "create" }
  | {
      mode: "edit";
      supplierId: string;
      defaultValues: { name: string; domain?: string | null; notes?: string | null };
    };

export function SupplierForm(props: SupplierFormProps) {
  const mode = "mode" in props && props.mode === "edit" ? "edit" : "create";
  const def = mode === "edit" && "defaultValues" in props ? props.defaultValues : undefined;

  const [name, setName] = useState(def?.name ?? "");
  const [domain, setDomain] = useState(def?.domain ?? "");
  const [notes, setNotes] = useState(def?.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Supplier name is required"); return; }
    setError("");

    startTransition(async () => {
      if (mode === "edit" && "supplierId" in props) {
        await updateSupplier(props.supplierId, {
          name: name.trim(),
          domain: domain.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        router.refresh();
      } else {
        await createSupplier({
          name: name.trim(),
          domain: domain.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Supplier name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="GPU Wholesale Partners"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Domain</label>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="gpuwholesale.com"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Qualification notes, contact info, sourcing details..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Add supplier"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
