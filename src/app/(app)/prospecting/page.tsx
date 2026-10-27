import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Target, Zap, Upload, FlaskConical, ArrowRight } from "lucide-react";

export default async function ProspectingPage() {
  const session = await requireSession();

  const [signalCount, accountCount, briefCount] = await Promise.all([
    prisma.buyingSignal.count({ where: { orgId: session.orgId } }),
    prisma.crmAccount.count({ where: { orgId: session.orgId } }),
    prisma.accountBrief.count({ where: { orgId: session.orgId } }),
  ]);

  const cards = [
    {
      href: "/prospecting/icp",
      icon: Target,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      hoverBorder: "hover:border-indigo-300",
      arrowHover: "group-hover:text-indigo-400",
      title: "ICP Segments",
      description: "Who buys GPUs, why they buy, and how to talk to them.",
    },
    {
      href: "/prospecting/signals",
      icon: Zap,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBorder: "hover:border-emerald-300",
      arrowHover: "group-hover:text-emerald-400",
      title: "Buying Signals",
      description: `${signalCount} signal${signalCount !== 1 ? "s" : ""} tracked — funding rounds, job posts, DC expansions.`,
    },
    {
      href: "/prospecting/research",
      icon: FlaskConical,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      hoverBorder: "hover:border-violet-300",
      arrowHover: "group-hover:text-violet-400",
      title: "AI Account Research",
      description: `${briefCount} brief${briefCount !== 1 ? "s" : ""} generated — Claude + Tavily web research on any account.`,
    },
    {
      href: "/prospecting/import",
      icon: Upload,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBorder: "hover:border-blue-300",
      arrowHover: "group-hover:text-blue-400",
      title: "CSV Import",
      description: `Import accounts from a spreadsheet. ${accountCount} account${accountCount !== 1 ? "s" : ""} in CRM.`,
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <span className="text-slate-700 font-medium">Prospecting</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Prospecting</h1>
        <p className="text-slate-500 mt-1">
          Find, research, and track your next GPU cloud customer.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`group bg-white border border-slate-200 rounded-xl p-5 ${card.hoverBorder} hover:shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <ArrowRight className={`w-4 h-4 text-slate-300 ${card.arrowHover} transition-colors`} />
            </div>
            <h2 className="font-semibold text-slate-900 mb-1">{card.title}</h2>
            <p className="text-sm text-slate-500">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
