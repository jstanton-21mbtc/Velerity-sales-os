import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Search, FlaskConical, ChevronRight, Globe, Building2 } from "lucide-react";
import { ResearchActions, BriefContent } from "./research-client";
import type { Prisma } from "@prisma/client";

type Source = { title: string; url: string; score: number };

function parseSources(raw: Prisma.JsonValue): Source[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "title" in item &&
      "url" in item &&
      "score" in item &&
      typeof item.title === "string" &&
      typeof item.url === "string" &&
      typeof item.score === "number"
    ) {
      return [{ title: item.title, url: item.url, score: item.score }];
    }
    return [];
  });
}

export default async function AccountResearchPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const session = await requireSession();
  const { accountId } = await params;

  const account = await prisma.crmAccount.findUnique({
    where: { id: accountId, orgId: session.orgId },
  });
  if (!account) notFound();

  const latestBrief = await prisma.accountBrief.findFirst({
    where: { accountId: account.id, orgId: session.orgId },
    orderBy: { createdAt: "desc" },
    include: { generatedBy: { select: { name: true, email: true } } },
  });

  const sources = latestBrief ? parseSources(latestBrief.sources) : [];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <Link href="/prospecting" className="hover:text-slate-600">Prospecting</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/prospecting/research" className="hover:text-slate-600">AI Research</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{account.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8 max-w-3xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-violet-600" />
            <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {account.domain && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Globe className="w-3.5 h-3.5" />
                {account.domain}
              </span>
            )}
            {account.industry && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                {account.industry}
              </span>
            )}
            {(account.hqCity || account.hqCountry) && (
              <span className="text-xs text-slate-500">
                {[account.hqCity, account.hqCountry].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/crm/accounts/${account.id}`}
            className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            View in CRM
          </Link>
          <ResearchActions accountId={account.id} hasBrief={!!latestBrief} />
        </div>
      </div>

      {/* Brief */}
      <div className="max-w-3xl">
        {latestBrief ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Research Brief</h2>
              <span className="text-xs text-slate-400">
                by {latestBrief.generatedBy.name ?? latestBrief.generatedBy.email}
              </span>
            </div>
            <BriefContent
              content={latestBrief.content}
              sources={sources}
              generatedAt={latestBrief.createdAt}
            />
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-600">No research brief yet.</p>
            <p className="text-sm mt-1">
              Click "Generate research brief" to run Claude + Tavily web research on this account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
