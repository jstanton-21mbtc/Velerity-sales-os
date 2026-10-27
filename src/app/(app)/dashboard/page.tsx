import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUsd } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, Package, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireSession();

  const [dealCount, openValue, certifiedUnits, accountCount] = await Promise.all([
    prisma.deal.count({
      where: { orgId: session.orgId, stage: { notIn: ["CLOSED_LOST", "DEPLOYED_EXPANSION"] } },
    }),
    prisma.deal.aggregate({
      where: { orgId: session.orgId, stage: { notIn: ["CLOSED_LOST"] } },
      _sum: { valueUsd: true },
    }),
    prisma.inventoryUnit.count({
      where: { orgId: session.orgId, status: "CERTIFIED" },
    }),
    prisma.crmAccount.count({ where: { orgId: session.orgId } }),
  ]);

  const stats = [
    {
      label: "Open Deals",
      value: String(dealCount),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pipeline Value",
      value: formatUsd(openValue._sum.valueUsd),
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Certified Units",
      value: String(certifiedUnits),
      icon: Package,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Accounts",
      value: String(accountCount),
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session.name ? `, ${session.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening across your pipeline today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink
          href="/academy/gpus"
          title="GPU Reference"
          description="A100, H100, H200 specs and comparison"
          emoji="🔬"
        />
        <QuickLink
          href="/crm/pipeline"
          title="Pipeline"
          description="Kanban view of all active deals"
          emoji="📋"
        />
        <QuickLink
          href="/academy/compare"
          title="Compare Systems"
          description="Side-by-side platform comparison"
          emoji="⚖️"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <a
      href={href}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
        {title}
      </p>
      <p className="text-slate-500 text-sm mt-0.5">{description}</p>
    </a>
  );
}
