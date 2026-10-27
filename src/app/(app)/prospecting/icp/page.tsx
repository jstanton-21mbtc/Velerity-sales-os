import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Target, ChevronRight, DollarSign, Cpu } from "lucide-react";

export default async function IcpSegmentsPage() {
  const segments = await prisma.icpSegment.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <Link href="/prospecting" className="hover:text-slate-600">Prospecting</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">ICP Segments</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">ICP Segments</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Ideal customer profiles — who buys certified-refurb GPU servers and why.
        </p>
      </div>

      {segments.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No ICP segments seeded yet.</p>
          <p className="text-sm mt-1">Run the Prisma seed to load default segments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-w-3xl">
          {segments.map((seg) => (
            <div key={seg.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-semibold text-slate-900 text-base">{seg.name}</h2>
                <div className="flex items-center gap-3 shrink-0">
                  {seg.typicalDealSize && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <DollarSign className="w-3 h-3" />
                      {seg.typicalDealSize}
                    </span>
                  )}
                  {seg.bestGpuFit && (
                    <span className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      <Cpu className="w-3 h-3" />
                      {seg.bestGpuFit}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-3 leading-relaxed">{seg.whyTheyBuy}</p>

              {seg.talkingPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Talking Points
                  </p>
                  <ul className="space-y-1">
                    {seg.talkingPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
