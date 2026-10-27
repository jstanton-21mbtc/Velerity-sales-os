"use client";

import { useState, useTransition } from "react";
import { createDeal } from "@/app/(app)/crm/actions";
import { useRouter } from "next/navigation";
import type { GpuGeneration } from "@prisma/client";

type Account = { id: string; name: string };

const GPU_GENERATIONS: { value: GpuGeneration; label: string }[] = [
  { value: "A100", label: "A100 (Ampere)" },
  { value: "H100", label: "H100 (Hopper)" },
  { value: "H200", label: "H200 (Hopper HBM3e)" },
  { value: "OTHER", label: "Other / TBD" },
];

const COMPETING_PATH_OPTIONS = [
  "New OEM (NVIDIA / Dell / HPE)",
  "Cloud GPU rental (AWS / Azure / GCP)",
  "Gray-market / uncertified",
  "No purchase (delay or cancel)",
];

const WORKLOAD_TYPES = [
  "LLM pre-training",
  "LLM fine-tuning",
  "LLM inference",
  "Computer vision training",
  "Scientific HPC",
  "Rendering / VFX",
  "Multi-modal AI",
  "RAG / embedding",
  "Other",
];

export function DealForm({ accounts }: { accounts: Account[] }) {
  const [title, setTitle] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [gpuGeneration, setGpuGeneration] = useState<GpuGeneration | "">("");
  const [gpuQuantity, setGpuQuantity] = useState("");
  const [nodeQuantity, setNodeQuantity] = useState("");
  const [workloadType, setWorkloadType] = useState("");
  const [deploymentCountry, setDeploymentCountry] = useState("");
  const [deploymentSite, setDeploymentSite] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [valueUsd, setValueUsd] = useState("");
  const [competingPaths, setCompetingPaths] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function togglePath(path: string) {
    setCompetingPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Deal title is required"); return; }
    if (!accountId) { setError("Account is required"); return; }
    setError("");

    startTransition(async () => {
      await createDeal({
        title: title.trim(),
        accountId,
        targetGpuGeneration: gpuGeneration || undefined,
        gpuQuantity: gpuQuantity ? parseInt(gpuQuantity) : undefined,
        nodeQuantity: nodeQuantity ? parseInt(nodeQuantity) : undefined,
        workloadType: workloadType || undefined,
        deploymentCountry: deploymentCountry.trim() || undefined,
        deploymentSite: deploymentSite.trim() || undefined,
        timeline: timeline.trim() || undefined,
        budgetUsd: budgetUsd ? parseFloat(budgetUsd) : undefined,
        valueUsd: valueUsd ? parseFloat(valueUsd) : undefined,
        competingPaths,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Deal basics</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Deal title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Acme AI — 8× H100 SXM5 cluster"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Account <span className="text-red-500">*</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">— Select account —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Workload */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Workload</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">GPU generation</label>
              <select
                value={gpuGeneration}
                onChange={(e) => setGpuGeneration(e.target.value as GpuGeneration | "")}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Unknown —</option>
                {GPU_GENERATIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Workload type</label>
              <select
                value={workloadType}
                onChange={(e) => setWorkloadType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Unknown —</option>
                {WORKLOAD_TYPES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">GPU count</label>
              <input
                value={gpuQuantity}
                onChange={(e) => setGpuQuantity(e.target.value)}
                type="number"
                min="1"
                placeholder="8"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Node count</label>
              <input
                value={nodeQuantity}
                onChange={(e) => setNodeQuantity(e.target.value)}
                type="number"
                min="1"
                placeholder="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Deployment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
            <input
              value={deploymentCountry}
              onChange={(e) => setDeploymentCountry(e.target.value)}
              placeholder="US"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Site / Colo</label>
            <input
              value={deploymentSite}
              onChange={(e) => setDeploymentSite(e.target.value)}
              placeholder="Equinix SV5"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Financials */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Financials & timing</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deal value (USD)</label>
            <input
              value={valueUsd}
              onChange={(e) => setValueUsd(e.target.value)}
              type="number"
              min="0"
              placeholder="1500000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget (USD)</label>
            <input
              value={budgetUsd}
              onChange={(e) => setBudgetUsd(e.target.value)}
              type="number"
              min="0"
              placeholder="2000000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Timeline</label>
            <input
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              placeholder="Q1 2025"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Competing paths */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Competing paths</h2>
        <div className="flex flex-wrap gap-2">
          {COMPETING_PATH_OPTIONS.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() => togglePath(path)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                competingPaths.includes(path)
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {path}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Creating…" : "Create deal"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
