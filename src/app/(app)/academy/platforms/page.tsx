import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { VerificationBadge } from "@/components/academy/verification-badge";
import { Server, ChevronRight, AlertCircle, Zap, Thermometer } from "lucide-react";

const OEM_ORDER = ["NVIDIA", "Dell", "HPE", "Supermicro", "Lenovo", "Gigabyte", "ASUS", "Other"];

export default async function PlatformsPage() {
  await requireSession();

  const platforms = await prisma.platformSpec.findMany({
    include: { gpus: { include: { gpuSpec: { select: { name: true, generation: true } } } } },
    orderBy: [{ oem: "asc" }, { name: "asc" }],
  });

  const grouped: Record<string, typeof platforms> = {};
  for (const p of platforms) {
    const key = OEM_ORDER.includes(p.oem) ? p.oem : "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  const unverifiedCount = platforms.filter((p) => !p.verified).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <Server className="w-4 h-4" />
          <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Platform Catalog</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Catalog</h1>
            <p className="text-slate-500 mt-1">
              HGX and DGX servers from all major OEMs with verified specs.
            </p>
          </div>
          {unverifiedCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm">
              <AlertCircle className="w-4 h-4" />
              {unverifiedCount} unverified
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {OEM_ORDER.filter((oem) => grouped[oem]?.length).map((oem) => (
          <section key={oem}>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {oem}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {grouped[oem].map((platform) => {
                const gpuNames = [...new Set(platform.gpus.map((g) => g.gpuSpec.generation))];
                return (
                  <Link
                    key={platform.slug}
                    href={`/academy/platforms/${platform.slug}`}
                    className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {platform.oem}
                      </span>
                      <VerificationBadge verified={platform.verified} sourceUrl={platform.sourceUrl} size="xs" />
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {platform.name}
                    </h3>

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">GPUs</span>
                        <p className="font-medium text-slate-700">
                          {platform.gpuCount}× {gpuNames.join("/")}
                        </p>
                      </div>
                      {platform.formFactorU && (
                        <div>
                          <span className="text-slate-400">Form factor</span>
                          <p className="font-medium text-slate-700">{platform.formFactorU}U</p>
                        </div>
                      )}
                      {platform.tdpWatts && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <p className="font-medium text-slate-700">{platform.tdpWatts.toLocaleString()}W</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-blue-400" />
                        <p className="font-medium text-slate-700 capitalize">
                          {platform.coolingType.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
