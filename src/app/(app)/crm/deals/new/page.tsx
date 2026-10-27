import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DealForm } from "@/components/crm/deal-form";
import { Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function NewDealPage() {
  const session = await requireSession();

  const accounts = await prisma.crmAccount.findMany({
    where: { orgId: session.orgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/deals" className="hover:text-slate-600">Deals</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>New deal</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Deal</h1>
      {accounts.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <p className="text-amber-900 font-medium text-sm mb-1">No accounts yet</p>
          <p className="text-amber-700 text-sm">
            You need at least one account before creating a deal.{" "}
            <Link href="/crm/accounts/new" className="underline font-medium">
              Create an account first.
            </Link>
          </p>
        </div>
      ) : (
        <DealForm accounts={accounts} />
      )}
    </div>
  );
}
