"use client";

import { useState, useTransition } from "react";
import { createUnit, updateUnit } from "@/app/(app)/inventory/actions";
import { useRouter } from "next/navigation";
import type { ConditionGrade, WarrantyType } from "@prisma/client";

type Supplier = { id: string; name: string };

const GPU_TYPES = [
  "A100 40GB PCIe",
  "A100 80GB PCIe",
  "A100 80GB SXM4",
  "H100 80GB PCIe",
  "H100 80GB SXM5",
  "H100 NVL",
  "H200 141GB SXM",
  "H200 141GB NVL",
  "Other",
];

const CONDITION_GRADES: { value: ConditionGrade; label: string; desc: string }[] = [
  { value: "A", label: "Grade A", desc: "Like new. <100 GPU hours. Full cert." },
  { value: "B", label: "Grade B", desc: "Light use. Minor cosmetic. Full cert." },
  { value: "C", label: "Grade C", desc: "Moderate use. Cert complete. Reduced warranty." },
];

const WARRANTY_TYPES: { value: WarrantyType; label: string }[] = [
  { value: "NVIDIA_LIMITED", label: "NVIDIA Limited Warranty" },
  { value: "SELLER", label: "Seller Warranty (Velerity)" },
  { value: "AS_IS", label: "AS-IS — No warranty" },
];

type UnitFormProps =
  | { mode?: "create"; suppliers: Supplier[] }
  | {
      mode: "edit";
      unitId: string;
      suppliers: Supplier[];
      defaultValues: {
        oem: string;
        model: string;
        gpuType: string;
        gpuCount: number;
        conditionGrade: ConditionGrade;
        warrantyType?: WarrantyType | null;
        warrantyTermMonths?: number | null;
        location?: string | null;
        costUsd?: number | null;
        listPriceUsd?: number | null;
        notes?: string | null;
        supplierId?: string | null;
      };
    };

export function UnitForm(props: UnitFormProps) {
  const mode = "mode" in props && props.mode === "edit" ? "edit" : "create";
  const def = mode === "edit" && "defaultValues" in props ? props.defaultValues : undefined;

  const [serialNumber, setSerialNumber] = useState("");
  const [oem, setOem] = useState(def?.oem ?? "");
  const [model, setModel] = useState(def?.model ?? "");
  const [gpuType, setGpuType] = useState(def?.gpuType ?? GPU_TYPES[0]);
  const [gpuCount, setGpuCount] = useState(String(def?.gpuCount ?? "8"));
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>(def?.conditionGrade ?? "B");
  const [warrantyType, setWarrantyType] = useState<WarrantyType | "">(def?.warrantyType ?? "");
  const [warrantyTermMonths, setWarrantyTermMonths] = useState(String(def?.warrantyTermMonths ?? ""));
  const [location, setLocation] = useState(def?.location ?? "");
  const [costUsd, setCostUsd] = useState(def?.costUsd != null ? String(def.costUsd) : "");
  const [listPriceUsd, setListPriceUsd] = useState(def?.listPriceUsd != null ? String(def.listPriceUsd) : "");
  const [notes, setNotes] = useState(def?.notes ?? "");
  const [supplierId, setSupplierId] = useState(def?.supplierId ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "create" && !serialNumber.trim()) {
      setError("Serial number is required");
      return;
    }
    if (!oem.trim() || !model.trim()) {
      setError("OEM and model are required");
      return;
    }
    setError("");

    const shared = {
      oem: oem.trim(),
      model: model.trim(),
      gpuType,
      gpuCount: parseInt(gpuCount) || 1,
      conditionGrade,
      warrantyType: warrantyType || undefined,
      warrantyTermMonths: warrantyTermMonths ? parseInt(warrantyTermMonths) : undefined,
      location: location.trim() || undefined,
      costUsd: costUsd ? parseFloat(costUsd) : undefined,
      listPriceUsd: listPriceUsd ? parseFloat(listPriceUsd) : undefined,
      notes: notes.trim() || undefined,
      supplierId: supplierId || undefined,
    };

    startTransition(async () => {
      if (mode === "edit" && "unitId" in props) {
        await updateUnit(props.unitId, shared);
        router.refresh();
      } else {
        await createUnit({ serialNumber: serialNumber.trim(), ...shared });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Unit identity</h2>
        <div className="grid grid-cols-2 gap-4">
          {mode === "create" && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Serial number <span className="text-red-500">*</span>
              </label>
              <input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                placeholder="SN-A100-SXM4-0042"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">OEM <span className="text-red-500">*</span></label>
            <input
              value={oem}
              onChange={(e) => setOem(e.target.value)}
              required
              placeholder="Dell"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Model <span className="text-red-500">*</span></label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              placeholder="PowerEdge XE8545"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">GPU type</label>
            <select
              value={gpuType}
              onChange={(e) => setGpuType(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {GPU_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">GPU count</label>
            <input
              value={gpuCount}
              onChange={(e) => setGpuCount(e.target.value)}
              type="number" min="1" max="16"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Condition */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Condition</h2>
        <div className="flex gap-3">
          {CONDITION_GRADES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setConditionGrade(g.value)}
              className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                conditionGrade === g.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className={`text-sm font-semibold mb-0.5 ${conditionGrade === g.value ? "text-blue-700" : "text-slate-900"}`}>
                {g.label}
              </p>
              <p className="text-xs text-slate-500">{g.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Warranty */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Warranty</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty type</label>
            <select
              value={warrantyType}
              onChange={(e) => setWarrantyType(e.target.value as WarrantyType | "")}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— None —</option>
              {WARRANTY_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Term (months)</label>
            <input
              value={warrantyTermMonths}
              onChange={(e) => setWarrantyTermMonths(e.target.value)}
              type="number" min="1"
              placeholder="12"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Pricing & location */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Pricing & location</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost (USD)</label>
            <input
              value={costUsd}
              onChange={(e) => setCostUsd(e.target.value)}
              type="number" min="0"
              placeholder="850000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">List price (USD)</label>
            <input
              value={listPriceUsd}
              onChange={(e) => setListPriceUsd(e.target.value)}
              type="number" min="0"
              placeholder="1200000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Rack 12-A, PHX"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Supplier */}
      {props.suppliers.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Supplier</h2>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Unlinked —</option>
            {props.suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </section>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Intake notes, inspection findings..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Add unit"}
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
