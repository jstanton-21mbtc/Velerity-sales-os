import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, Building2, Globe } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AccountsPage() {
  const session = await requireSession();

  const accounts = await prisma.crmAccount.findMany({
    where: { orgId: session.orgId },
    include: {
      _count: { select: { deals: true, contacts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>CRM</span>
            <span>/</span>
            <span>Accounts</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
        </div>
        <Link
          href="/crm/accounts/new"
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New account
        </Link>
      </div>

      {accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Account</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Industry</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Location</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Deals</th>
                <th className="text-center px-5 py-3 font-medium text-slate-500">Contacts</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/crm/accounts/${account.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {account.name}
                    </Link>
                    {account.domain && (
                      <p className="text-slate-400 text-xs mt-0.5">{account.domain}</p>
                    )}
                    {account.isSampleData && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">
                        sample
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{account.industry ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {[account.hqCity, account.hqCountry].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {account._count.deals}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-600">{account._count.contacts}</td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(account.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
        <Building2 className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">No accounts yet</h3>
      <p className="text-slate-500 text-sm mb-4">Add your first target account to get started.</p>
      <Link
        href="/crm/accounts/new"
        className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
      >
        <Globe className="w-4 h-4" />
        Add account
      </Link>
    </div>
  );
}
