import { AccountForm } from "@/components/crm/account-form";
import { Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { requireSession } from "@/lib/auth";

export default async function NewAccountPage() {
  await requireSession();
  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/accounts" className="hover:text-slate-600">Accounts</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>New account</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Account</h1>
      <AccountForm />
    </div>
  );
}
