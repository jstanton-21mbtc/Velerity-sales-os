import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactForm } from "@/components/crm/contact-form";
import { Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const session = await requireSession();
  const { accountId } = await searchParams;

  const accounts = await prisma.crmAccount.findMany({
    where: { orgId: session.orgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/contacts" className="hover:text-slate-600">Contacts</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>New contact</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">New Contact</h1>
      <ContactForm accounts={accounts} defaultAccountId={accountId} />
    </div>
  );
}
