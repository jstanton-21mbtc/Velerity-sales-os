import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ChevronRight, ShieldCheck, ChevronDown } from "lucide-react";

const PATH_LABELS: Record<string, string> = {
  cloud: "Cloud alternative",
  "wait-blackwell": "Waiting for Blackwell",
  "refurb-risky": "Refurb risk",
  "lower-quote": "Lower competitor quote",
  "lead-time": "Lead time concern",
  compliance: "Compliance / export control",
  warranty: "Warranty concern",
  other: "Other",
};

const PATH_COLORS: Record<string, string> = {
  cloud: "bg-blue-50 text-blue-700 border-blue-200",
  "wait-blackwell": "bg-violet-50 text-violet-700 border-violet-200",
  "refurb-risky": "bg-amber-50 text-amber-700 border-amber-200",
  "lower-quote": "bg-rose-50 text-rose-700 border-rose-200",
  "lead-time": "bg-teal-50 text-teal-700 border-teal-200",
  compliance: "bg-orange-50 text-orange-700 border-orange-200",
  warranty: "bg-emerald-50 text-emerald-700 border-emerald-200",
  other: "bg-slate-50 text-slate-700 border-slate-200",
};

export default async function ObjectionsPage() {
  await requireSession();

  const objections = await prisma.objection.findMany({
    orderBy: [{ path: "asc" }, { title: "asc" }],
  });

  const byPath = objections.reduce<Record<string, typeof objections>>(
    (acc, obj) => {
      if (!acc[obj.path]) acc[obj.path] = [];
      acc[obj.path].push(obj);
      return acc;
    },
    {}
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Objection Library</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-rose-600" />
          <h1 className="text-2xl font-bold text-slate-900">Objection Library</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Ready responses to every common objection. Read, internalize, and adapt to your prospect.
        </p>
      </div>

      {objections.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No objections seeded yet. Run <code className="font-mono text-xs">npx tsx prisma/seed.ts</code></p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(byPath).map(([path, items]) => {
            const colorClass = PATH_COLORS[path] ?? PATH_COLORS.other;
            const pathLabel = PATH_LABELS[path] ?? path;
            return (
              <section key={path}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
                    {pathLabel}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{items.length} response{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-4">
                  {items.map((obj) => (
                    <details
                      key={obj.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden group"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                        <p className="font-semibold text-slate-900 text-sm">{obj.title}</p>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                      </summary>
                      <div className="px-5 pb-5 border-t border-slate-100">
                        <p className="text-slate-700 text-sm leading-relaxed mt-4 whitespace-pre-wrap">
                          {obj.response}
                        </p>
                        {obj.counterPoints.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Key points
                            </p>
                            <ul className="space-y-1.5">
                              {obj.counterPoints.map((point) => (
                                <li key={point} className="flex items-start gap-2 text-sm text-slate-600">
                                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
