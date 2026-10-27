import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { VerificationBadge } from "@/components/academy/verification-badge";
import { Cpu, ChevronRight, AlertCircle } from "lucide-react";
import type { GpuGeneration } from "@prisma/client";

const GEN_ORDER: GpuGeneration[] = ["A100", "H100", "H200", "OTHER"];

const GEN_COLORS: Record<GpuGeneration, { badge: string; ring: string }> = {
  A100: { badge: "bg-slate-100 text-slate-700", ring: "border-slate-200" },
  H100: { badge: "bg-blue-100 text-blue-700", ring: "border-blue-200" },
  H200: { badge: "bg-violet-100 text-violet-700", ring: "border-violet-200" },
  OTHER: { badge: "bg-gray-100 text-gray-600", ring: "border-gray-200" },
};

export default async function GpusPage() {
  await requireSession();

  const gpus = await prisma.gpuSpec.findMany({
    orderBy: [{ generation: "asc" }, { memoryGb: "asc" }],
  });

  const grouped = GEN_ORDER.reduce<Record<GpuGeneration, typeof gpus>>(
    (acc, gen) => {
      acc[gen] = gpus.filter((g) => g.generation === gen);
      return acc;
    },
    { A100: [], H100: [], H200: [], OTHER: [] }
  );

  const unverifiedCount = gpus.filter((g) => !g.verified).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <Cpu className="w-4 h-4" />
          <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>GPU Reference</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">GPU Reference</h1>
            <p className="text-slate-500 mt-1">
              Complete specs for all NVIDIA AI GPU generations we sell.
            </p>
          </div>
          {unverifiedCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm">
              <AlertCircle className="w-4 h-4" />
              {unverifiedCount} unverified spec{unverifiedCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {GEN_ORDER.filter((gen) => grouped[gen].length > 0).map((gen) => (
          <section key={gen}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {gen === "OTHER" ? "Other" : `NVIDIA ${gen}`} Series
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {grouped[gen].map((gpu) => (
                <Link
                  key={gpu.slug}
                  href={`/academy/gpus/${gpu.slug}`}
                  className={`block bg-white border ${GEN_COLORS[gpu.generation].ring} rounded-xl p-5 hover:shadow-md transition-all group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${GEN_COLORS[gpu.generation].badge}`}>
                      {gpu.generation}
                    </span>
                    <VerificationBadge verified={gpu.verified} sourceUrl={gpu.sourceUrl} size="xs" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {gpu.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">{gpu.variant}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400">Memory</span>
                      <p className="font-medium text-slate-700">{gpu.memoryGb}GB {gpu.memoryType}</p>
                    </div>
                    {gpu.fp16TflopsStr && (
                      <div>
                        <span className="text-slate-400">FP16</span>
                        <p className="font-medium text-slate-700">{gpu.fp16TflopsStr}</p>
                      </div>
                    )}
                    {gpu.tdpWatts && (
                      <div>
                        <span className="text-slate-400">TDP</span>
                        <p className="font-medium text-slate-700">{gpu.tdpWatts}W</p>
                      </div>
                    )}
                    {gpu.migSupport && (
                      <div>
                        <span className="text-slate-400">MIG</span>
                        <p className="font-medium text-slate-700">Up to {gpu.migMaxInstances} instances</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
