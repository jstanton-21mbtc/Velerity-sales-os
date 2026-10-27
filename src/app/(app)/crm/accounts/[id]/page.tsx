import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ChevronRight, Building2, Globe, ExternalLink, Plus } from "lucide-react";
import { formatDate, formatUsd } from "@/lib/utils";
import { AccountForm } from "@/components/crm/account-form";
import { ActivityFeed } from "@/components/crm/activity-feed";
import { AddActivityModal } from "@/components/crm/add-activity-modal";
import { StageBadge } from "@/components/crm/stage-badge";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const account = await prisma.crmAccount.findUnique({
    where: { id, orgId: session.orgId },
    include: {
      contacts: { orderBy: { lastName: "asc" } },
      deals: {
        orderBy: { updatedAt: "desc" },
        include: { assignedRep: { select: { name: true, email: true } } },
      },
      activities: {
        orderBy: { occurredAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  if (!account) notFound();

  const openDeals = account.deals.filter(
    (d) => d.stage !== "DEPLOYED_EXPANSION" && d.stage !== "CLOSED_LOST"
  );
  const closedDeals = account.deals.filter(
    (d) => d.stage === "DEPLOYED_EXPANSION" || d.stage === "CLOSED_LOST"
  );

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/accounts" className="hover:text-slate-600">Accounts</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{account.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{account.name}</h1>
            {account.isSampleData && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                sample
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
            {account.industry && <span>{account.industry}</span>}
            {(account.hqCity || account.hqCountry) && (
              <span>{[account.hqCity, account.hqCountry].filter(Boolean).join(", ")}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {account.website && (
              <a
                href={account.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Globe className="w-3 h-3" />
                {account.domain ?? "Website"}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {account.linkedinUrl && (
              <a
                href={account.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/prospecting/research/${account.id}`}
            className="flex items-center gap-1.5 text-sm px-3 py-2 text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700 rounded-lg transition-colors"
          >
            AI Research
          </Link>
          <Link
            href={`/crm/deals/new?accountId=${account.id}`}
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New deal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-6">
          {/* Open deals */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Open deals ({openDeals.length})
            </h2>
            {openDeals.length === 0 ? (
              <p className="text-slate-400 text-sm">No open deals.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {openDeals.map((deal) => (
                  <div key={deal.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/crm/deals/${deal.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 text-sm"
                      >
                        {deal.title}
                      </Link>
                      {deal.assignedRep && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {deal.assignedRep.name ?? deal.assignedRep.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {deal.valueUsd != null && (
                        <span className="text-sm text-slate-600">{formatUsd(deal.valueUsd)}</span>
                      )}
                      <StageBadge stage={deal.stage} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activities */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Activity
              </h2>
              <AddActivityModal accountId={account.id} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ActivityFeed activities={account.activities} />
            </div>
          </section>

          {/* Closed deals */}
          {closedDeals.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Closed ({closedDeals.length})
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {closedDeals.map((deal) => (
                  <div key={deal.id} className="px-5 py-3 flex items-center justify-between">
                    <Link
                      href={`/crm/deals/${deal.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 text-sm"
                    >
                      {deal.title}
                    </Link>
                    <div className="flex items-center gap-4">
                      {deal.valueUsd != null && (
                        <span className="text-sm text-slate-500">{formatUsd(deal.valueUsd)}</span>
                      )}
                      <StageBadge stage={deal.stage} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contacts */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Contacts ({account.contacts.length})
              </h2>
              <Link
                href={`/crm/contacts/new?accountId=${account.id}`}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </Link>
            </div>
            {account.contacts.length === 0 ? (
              <p className="text-slate-400 text-sm">No contacts yet.</p>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {account.contacts.map((c) => (
                  <Link
                    key={c.id}
                    href={`/crm/contacts/${c.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-slate-600">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {c.firstName} {c.lastName}
                      </p>
                      {c.title && <p className="text-xs text-slate-400">{c.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Edit form */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Edit account
            </h2>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <AccountForm
                mode="edit"
                accountId={account.id}
                defaultValues={{
                  name: account.name,
                  domain: account.domain,
                  industry: account.industry,
                  hqCity: account.hqCity,
                  hqCountry: account.hqCountry,
                  website: account.website,
                  linkedinUrl: account.linkedinUrl,
                  notes: account.notes,
                }}
              />
            </div>
          </section>

          {/* Notes */}
          {account.notes && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Notes
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {account.notes}
                </p>
              </div>
            </section>
          )}

          <p className="text-xs text-slate-400">Updated {formatDate(account.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
