"use client";

import { useState, useTransition } from "react";
import { addLineItem, removeLineItem, updateLineItem } from "@/app/(app)/inventory/actions";
import { formatUsd } from "@/lib/utils";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import type { LineItemCategory } from "@prisma/client";

const CATEGORIES: { value: LineItemCategory; label: string }[] = [
  { value: "SERVER", label: "Server" },
  { value: "GPU_COMPONENT", label: "GPU component" },
  { value: "WARRANTY", label: "Warranty" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "OTHER", label: "Other" },
];

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceUsd: number;
  category: LineItemCategory;
};

export function QuoteBuilder({
  dealId,
  initialItems,
}: {
  dealId: string;
  initialItems: LineItem[];
}) {
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [addDesc, setAddDesc] = useState("");
  const [addQty, setAddQty] = useState("1");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState<LineItemCategory>("SERVER");

  // Edit form state
  const [editDesc, setEditDesc] = useState("");
  const [editQty, setEditQty] = useState("1");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState<LineItemCategory>("SERVER");

  const total = items.reduce((s, i) => s + i.quantity * i.unitPriceUsd, 0);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addDesc.trim() || !addPrice) return;
    startTransition(async () => {
      await addLineItem(dealId, {
        description: addDesc.trim(),
        quantity: parseInt(addQty) || 1,
        unitPriceUsd: parseFloat(addPrice),
        category: addCategory,
      });
      const newItem: LineItem = {
        id: crypto.randomUUID(),
        description: addDesc.trim(),
        quantity: parseInt(addQty) || 1,
        unitPriceUsd: parseFloat(addPrice),
        category: addCategory,
      };
      setItems((prev) => [...prev, newItem]);
      setAddDesc("");
      setAddQty("1");
      setAddPrice("");
      setShowAdd(false);
    });
  }

  function startEdit(item: LineItem) {
    setEditingId(item.id);
    setEditDesc(item.description);
    setEditQty(String(item.quantity));
    setEditPrice(String(item.unitPriceUsd));
    setEditCategory(item.category);
  }

  function handleEditSave(id: string) {
    startTransition(async () => {
      const updated = {
        description: editDesc.trim(),
        quantity: parseInt(editQty) || 1,
        unitPriceUsd: parseFloat(editPrice),
        category: editCategory,
      };
      await updateLineItem(id, dealId, updated);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
      );
      setEditingId(null);
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeLineItem(id, dealId);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <div>
      {/* Line items table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3 font-medium text-slate-500">Description</th>
              <th className="text-left px-5 py-3 font-medium text-slate-500">Category</th>
              <th className="text-center px-4 py-3 font-medium text-slate-500">Qty</th>
              <th className="text-right px-5 py-3 font-medium text-slate-500">Unit price</th>
              <th className="text-right px-5 py-3 font-medium text-slate-500">Total</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No line items yet. Add hardware, warranty, and shipping below.
                </td>
              </tr>
            )}
            {items.map((item) =>
              editingId === item.id ? (
                <tr key={item.id} className="bg-blue-50/30">
                  <td className="px-3 py-2">
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as LineItemCategory)}
                      className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      type="number" min="1"
                      className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      type="number" min="0"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-5 py-2 text-right text-slate-600 text-xs">
                    {formatUsd((parseInt(editQty) || 1) * (parseFloat(editPrice) || 0))}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleEditSave(item.id)}
                        disabled={isPending}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{item.description}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{formatUsd(item.unitPriceUsd)}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">
                    {formatUsd(item.quantity * item.unitPriceUsd)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isPending}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-slate-700 text-right">
                Total
              </td>
              <td className="px-5 py-3 text-right text-lg font-bold text-slate-900">
                {formatUsd(total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add row */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add line item
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 mb-3">New line item</p>
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-4">
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <input
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                required
                placeholder="Dell XE8545 w/ 4× A100 SXM4"
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Category</label>
              <select
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value as LineItemCategory)}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-500 mb-1">Qty</label>
              <input
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                type="number" min="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Unit price (USD)</label>
              <input
                value={addPrice}
                onChange={(e) => setAddPrice(e.target.value)}
                required type="number" min="0"
                placeholder="850000"
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-3 flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-3 py-1.5 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
              >
                {isPending ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
