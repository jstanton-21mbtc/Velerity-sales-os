import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Zap, ChevronRight } from "lucide-react";
import { SignalsClient } from "./signals-client";

export default async function SignalsPage() {
  const session = await requireSession();

  const [signals, accounts] = await Promise.all([
    prisma.buyingSignal.findMany({
      where: { orgId: session.orgId },
      orderBy: { detectedAt: "desc" },
      include: { account: { select: { id: true, name: true } } },
    }),
    prisma.crmAccount.findMany({
      where: { orgId: session.orgId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <Link href="/prospecting" className="hover:text-slate-600">Prospecting</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">Buying Signals</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">Buying Signals</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Track funding rounds, job postings, data center expansions, and other GPU buying indicators.
        </p>
      </div>

      <SignalsClient
        initialSignals={signals.map((s) => ({
          ...s,
          detectedAt: s.detectedAt,
        }))}
        accounts={accounts}
      />
    </div>
  );
}
