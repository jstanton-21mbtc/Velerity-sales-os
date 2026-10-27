"use client";

import { useState } from "react";
import { calcTco, CLOUD_BENCHMARKS } from "@/lib/calculators/tco";
import type { TcoResult } from "@/lib/calculators/tco";
import { DollarSign, TrendingDown, Check } from "lucide-react";

function usd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const GPU_PRESETS = Object.entries(CLOUD_BENCHMARKS).map(([key, v]) => ({
  key,
  label: v.label,
  onDemand: v.onDemand,
  reserved: v.reserved,
}));

const REFURB_PRESETS: { label: string; totalUsd: number; gpus: number }[] = [
  { label: "8× A100 80GB SXM4", totalUsd: 650_000, gpus: 8 },
  { label: "8× H100 80GB SXM5", totalUsd: 1_200_000, gpus: 8 },
  { label: "8× H200 141GB SXM", totalUsd: 1_800_000, gpus: 8 },
  { label: "4× H100 80GB SXM5", totalUsd: 620_000, gpus: 4 },
  { label: "Custom", totalUsd: 0, gpus: 8 },
];

export function TcoClient() {
  const [gpuCount, setGpuCount] = useState("8");
  const [utilPct, setUtilPct] = useState("70");
  const [years, setYears] = useState("3");
  const [refurbPreset, setRefurbPreset] = useState(REFURB_PRESETS[1].label);
  const [refurbUsd, setRefurbUsd] = useState("1200000");
  const [gpuPreset, setGpuPreset] = useState("h100_sxm");
  const [onDemandRate, setOnDemandRate] = useState(
    String(CLOUD_BENCHMARKS.h100_sxm.onDemand)
  );
  const [reservedRate, setReservedRate] = useState(
    String(CLOUD_BENCHMARKS.h100_sxm.reserved)
  );
  const [result, setResult] = useState<TcoResult | null>(null);

  function handleRefurbPreset(p: typeof REFURB_PRESETS[number]) {
    setRefurbPreset(p.label);
    if (p.totalUsd) {
      setRefurbUsd(String(p.totalUsd));
      setGpuCount(String(p.gpus));
    }
  }

  function handleGpuPreset(key: string) {
    setGpuPreset(key);
    const b = CLOUD_BENCHMARKS[key];
    setOnDemandRate(String(b.onDemand));
    setReservedRate(String(b.reserved));
  }

  function calculate() {
    const r = calcTco({
      gpuCount: parseInt(gpuCount) || 8,
      utilizationPct: parseFloat(utilPct) || 70,
      years: parseFloat(years) || 3,
      refurbTotalUsd: parseFloat(refurbUsd) || 1_200_000,
      cloudOnDemandPerGpuHr: parseFloat(onDemandRate),
      cloudReservedPerGpuHr: parseFloat(reservedRate),
    });
    setResult(r);
  }

  const maxCost = result ? Math.max(...result.paths.map((p) => p.totalCostUsd)) : 1;

  return (
    <div className="space-y-6">
      {/* Config panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-5">Configure scenario</h2>
        <div className="grid grid-cols-3 gap-6">
          {/* Hardware */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Hardware</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Refurb config preset</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {REFURB_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleRefurbPreset(p)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      refurbPreset === p.label
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">GPU count</label>
                <input
                  value={gpuCount}
                  onChange={(e) => setGpuCount(e.target.value)}
                  type="number" min="1"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Refurb total ($)</label>
                <input
                  value={refurbUsd}
                  onChange={(e) => { setRefurbUsd(e.target.value); setRefurbPreset("Custom"); }}
                  type="number" min="0"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cloud rates */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Cloud rates</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">GPU type preset ($/GPU/hr)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {GPU_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handleGpuPreset(p.key)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      gpuPreset === p.key
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {p.label.split(" ")[0]} {p.label.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">On-demand ($/GPU/hr)</label>
                <input
                  value={onDemandRate}
                  onChange={(e) => { setOnDemandRate(e.target.value); setGpuPreset("custom"); }}
                  type="number" min="0" step="0.01"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">1-yr reserved ($/GPU/hr)</label>
                <input
                  value={reservedRate}
                  onChange={(e) => { setReservedRate(e.target.value); setGpuPreset("custom"); }}
                  type="number" min="0" step="0.01"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Usage</p>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Utilization: {utilPct}%
              </label>
              <input
                value={utilPct}
                onChange={(e) => setUtilPct(e.target.value)}
                type="range" min="10" max="100" step="5"
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>10%</span><span>100%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Period (years)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setYears(String(y))}
                    className={`flex-1 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                      years === String(y)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {y}yr
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={calculate}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors mt-2"
            >
              Calculate TCO
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {result.paths.map((path, i) => {
              const isRefurb = path.name.includes("Refurb");
              const barPct = (path.totalCostUsd / maxCost) * 100;
              return (
                <div
                  key={path.name}
                  className={`bg-white border rounded-xl p-5 ${
                    isRefurb
                      ? "border-emerald-300 ring-2 ring-emerald-100"
                      : "border-slate-200"
                  }`}
                >
                  {isRefurb && (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium mb-2">
                      <TrendingDown className="w-3 h-3" />
                      Best value
                    </span>
                  )}
                  <p className="text-xs font-semibold text-slate-500 leading-snug mb-2">{path.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{usd(path.totalCostUsd)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {years}yr total · {path.upfrontUsd > 0 ? `${usd(path.upfrontUsd)} upfront` : "no upfront"}
                  </p>

                  <div className="mt-3 mb-3">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isRefurb ? "bg-emerald-500" : "bg-slate-400"}`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>

                  {path.savingsVsOnDemand > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Saves {usd(path.savingsVsOnDemand)} vs on-demand
                      {path.pctCheaperThanOnDemand > 0 && ` (${path.pctCheaperThanOnDemand}% cheaper)`}
                    </p>
                  )}

                  <div className="mt-3 space-y-1">
                    {path.notes.slice(0, 2).map((note) => (
                      <p key={note} className="text-xs text-slate-500 flex items-start gap-1">
                        <Check className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">
            {parseInt(gpuCount)} GPUs · {utilPct}% utilization ·{" "}
            {result.totalGpuHours.toLocaleString()} total GPU-hours over {years} year{parseInt(years) !== 1 ? "s" : ""}.
            Cloud rates based on major provider list pricing (AWS/Azure/GCP).
            Refurb pricing is illustrative — contact Velerity for a custom quote.
          </p>
        </>
      )}
    </div>
  );
}
