import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, FlaskConical, ChevronRight, ArrowRight } from "lucide-react";

export default async function ResearchLandingPage() {
  const session = await requireSession();

  const [recentBriefs, accounts] = await Promise.all([
    prisma.accountBrief.findMany({
      where: { orgId: session.orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        account: { select: { id: true, name: true } },
        generatedBy: { select: { name: true, email: true } },
      },
    }),
    prisma.crmAccount.findMany({
      where: { orgId: session.orgId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, domain: true, industry: true },
      take: 50,
    }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <Link href="/prospecting" className="hover:text-slate-600">Prospecting</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">AI Account Research</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-violet-600" />
          <h1 className="text-2xl font-bold text-slate-900">AI Account Research</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Generate a research brief for any account using Claude + Tavily web search.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-5xl">
        {/* Account list */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Pick an account to research
          </h2>
          {accounts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm">No accounts yet.</p>
              <Link href="/crm/accounts/new" className="text-xs text-blue-600 hover:underline mt-1 block">
                Add an account →
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {accounts.map((a) => (
                <Link
                  key={a.id}
                  href={`/prospecting/research/${a.id}`}
                  className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-violet-300 hover:bg-violet-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.name}</p>
                    {(a.domain || a.industry) && (
                      <p className="text-xs text-slate-400 truncate">
                        {[a.domain, a.industry].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent briefs */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Recent briefs</h2>
          {recentBriefs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm">No briefs generated yet.</p>
              <p className="text-xs mt-1">Pick an account on the left to generate one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBriefs.map((brief) => (
                <Link
                  key={brief.id}
                  href={`/prospecting/research/${brief.account.id}`}
                  className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-violet-300 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {brief.account.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(brief.createdAt).toLocaleDateString()} ·{" "}
                      {brief.generatedBy.name ?? brief.generatedBy.email}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
