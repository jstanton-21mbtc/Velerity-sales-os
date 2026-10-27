"use client";

import { useState } from "react";
import { VerificationBadge } from "@/components/academy/verification-badge";
import { Scale, X, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { GpuSpec, PlatformSpec } from "@prisma/client";

type PlatformWithGpus = PlatformSpec & {
  gpus: { gpuSpec: { generation: string } }[];
};

type Mode = "gpu" | "platform";

const GPU_ROWS = [
  { key: "memoryGb", label: "Memory", format: (v: unknown) => v != null ? `${v} GB` : "—" },
  { key: "memoryType", label: "Memory type", format: (v: unknown) => String(v ?? "—") },
  { key: "memoryBwTbps", label: "Memory bandwidth", format: (v: unknown) => v != null ? `${v} TB/s` : "—" },
  { key: "fp64TflopsStr", label: "FP64", format: (v: unknown) => String(v ?? "—") },
  { key: "fp32TflopsStr", label: "FP32", format: (v: unknown) => String(v ?? "—") },
  { key: "tf32TflopsStr", label: "TF32", format: (v: unknown) => String(v ?? "—") },
  { key: "bf16TflopsStr", label: "BF16", format: (v: unknown) => String(v ?? "—") },
  { key: "fp16TflopsStr", label: "FP16", format: (v: unknown) => String(v ?? "—") },
  { key: "fp8TflopsStr", label: "FP8", format: (v: unknown) => String(v ?? "—") },
  { key: "int8TopsStr", label: "INT8", format: (v: unknown) => String(v ?? "—") },
  { key: "nvlinkGeneration", label: "NVLink", format: (v: unknown) => String(v ?? "—") },
  { key: "nvlinkBwGbps", label: "NVLink BW", format: (v: unknown) => v != null ? `${v} GB/s` : "—" },
  { key: "tdpWatts", label: "TDP", format: (v: unknown) => v != null ? `${v} W` : "—" },
  { key: "formFactor", label: "Form factor", format: (v: unknown) => String(v ?? "—") },
  { key: "migSupport", label: "MIG support", format: (v: unknown) => v ? "Yes" : "No" },
  { key: "migMaxInstances", label: "MIG instances", format: (v: unknown) => v != null ? `Up to ${v}` : "—" },
  { key: "transformerEngine", label: "Transformer Engine", format: (v: unknown) => v ? "Yes (FP8)" : "No" },
] as const;

const PLATFORM_ROWS = [
  { key: "gpuCount", label: "GPU count", format: (v: unknown) => v != null ? `${v}×` : "—" },
  { key: "cpuOptions", label: "CPU", format: (v: unknown) => String(v ?? "—") },
  { key: "maxRamGb", label: "Max RAM", format: (v: unknown) => v != null ? `${v} GB` : "—" },
  { key: "storageConfig", label: "Storage", format: (v: unknown) => String(v ?? "—") },
  { key: "networkingConfig", label: "Networking", format: (v: unknown) => String(v ?? "—") },
  { key: "hasDpu", label: "DPU", format: (v: unknown) => v ? "Yes" : "No" },
  { key: "dpuModel", label: "DPU model", format: (v: unknown) => String(v ?? "—") },
  { key: "tdpWatts", label: "Power draw", format: (v: unknown) => v != null ? `${(v as number).toLocaleString()} W` : "—" },
  { key: "psuConfig", label: "PSU", format: (v: unknown) => String(v ?? "—") },
  { key: "coolingType", label: "Cooling", format: (v: unknown) => String(v ?? "—") },
  { key: "formFactorU", label: "Form factor", format: (v: unknown) => v != null ? `${v}U` : "—" },
  { key: "weightKg", label: "Weight", format: (v: unknown) => v != null ? `${v} kg` : "—" },
] as const;

export function CompareClient({
  gpus,
  platforms,
}: {
  gpus: GpuSpec[];
  platforms: PlatformWithGpus[];
}) {
  const [mode, setMode] = useState<Mode>("gpu");
  const [selectedGpuSlugs, setSelectedGpuSlugs] = useState<string[]>([]);
  const [selectedPlatformSlugs, setSelectedPlatformSlugs] = useState<string[]>([]);

  const selectedGpus = gpus.filter((g) => selectedGpuSlugs.includes(g.slug));
  const selectedPlatforms = platforms.filter((p) =>
    selectedPlatformSlugs.includes(p.slug)
  );

  function toggleGpu(slug: string) {
    setSelectedGpuSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 4
        ? [...prev, slug]
        : prev
    );
  }

  function togglePlatform(slug: string) {
    setSelectedPlatformSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 4
        ? [...prev, slug]
        : prev
    );
  }

  const hasSelection =
    mode === "gpu" ? selectedGpus.length > 0 : selectedPlatforms.length > 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <Scale className="w-4 h-4" />
          <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Compare</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Compare</h1>
        <p className="text-slate-500 mt-1">
          Select up to 4 GPUs or platforms for side-by-side comparison.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        <button
          onClick={() => setMode("gpu")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "gpu"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          GPUs
        </button>
        <button
          onClick={() => setMode("platform")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "platform"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Platforms
        </button>
      </div>

      <div className="flex gap-6">
        {/* Selector panel */}
        <div className="w-64 shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {mode === "gpu" ? "Select GPUs" : "Select Platforms"} (max 4)
          </p>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {mode === "gpu"
              ? gpus.map((gpu) => {
                  const selected = selectedGpuSlugs.includes(gpu.slug);
                  return (
                    <button
                      key={gpu.slug}
                      onClick={() => toggleGpu(gpu.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        selected
                          ? "bg-blue-50 border-blue-300 text-blue-900"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium leading-snug">{gpu.name}</span>
                        {selected ? (
                          <X className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{gpu.memoryGb}GB {gpu.memoryType}</span>
                    </button>
                  );
                })
              : platforms.map((platform) => {
                  const selected = selectedPlatformSlugs.includes(platform.slug);
                  return (
                    <button
                      key={platform.slug}
                      onClick={() => togglePlatform(platform.slug)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        selected
                          ? "bg-blue-50 border-blue-300 text-blue-900"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium leading-snug">{platform.name}</span>
                        {selected ? (
                          <X className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-2" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{platform.oem} · {platform.gpuCount}× GPU</span>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Comparison table */}
        <div className="flex-1 overflow-x-auto">
          {!hasSelection ? (
            <div className="flex items-center justify-center h-64 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
              Select at least one {mode} to begin comparing
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {/* Column headers */}
              <div
                className="grid border-b border-slate-200"
                style={{
                  gridTemplateColumns: `200px repeat(${
                    mode === "gpu" ? selectedGpus.length : selectedPlatforms.length
                  }, 1fr)`,
                }}
              >
                <div className="p-4 bg-slate-50" />
                {mode === "gpu"
                  ? selectedGpus.map((gpu) => (
                      <div key={gpu.slug} className="p-4 border-l border-slate-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-snug">{gpu.name}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{gpu.variant}</p>
                          </div>
                          <VerificationBadge verified={gpu.verified} size="xs" />
                        </div>
                      </div>
                    ))
                  : selectedPlatforms.map((platform) => (
                      <div key={platform.slug} className="p-4 border-l border-slate-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-snug">{platform.name}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{platform.oem}</p>
                          </div>
                          <VerificationBadge verified={platform.verified} size="xs" />
                        </div>
                      </div>
                    ))}
              </div>

              {/* Rows */}
              {(mode === "gpu" ? GPU_ROWS : PLATFORM_ROWS).map((row, i) => (
                <div
                  key={row.key}
                  className={`grid border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  style={{
                    gridTemplateColumns: `200px repeat(${
                      mode === "gpu" ? selectedGpus.length : selectedPlatforms.length
                    }, 1fr)`,
                  }}
                >
                  <div className="px-4 py-3 text-xs font-medium text-slate-500">
                    {row.label}
                  </div>
                  {mode === "gpu"
                    ? selectedGpus.map((gpu) => (
                        <div
                          key={gpu.slug}
                          className="px-4 py-3 text-sm text-slate-800 border-l border-slate-100"
                        >
                          {row.format((gpu as Record<string, unknown>)[row.key])}
                        </div>
                      ))
                    : selectedPlatforms.map((platform) => (
                        <div
                          key={platform.slug}
                          className="px-4 py-3 text-sm text-slate-800 border-l border-slate-100"
                        >
                          {row.format((platform as Record<string, unknown>)[row.key])}
                        </div>
                      ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
