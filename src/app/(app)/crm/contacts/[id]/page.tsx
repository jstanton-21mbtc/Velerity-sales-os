import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ChevronRight, Mail, Phone, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ContactForm } from "@/components/crm/contact-form";
import { ActivityFeed } from "@/components/crm/activity-feed";
import { AddActivityModal } from "@/components/crm/add-activity-modal";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [contact, accounts] = await Promise.all([
    prisma.contact.findUnique({
      where: { id, orgId: session.orgId },
      include: {
        account: { select: { id: true, name: true } },
        activities: {
          orderBy: { occurredAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        },
        deals: {
          orderBy: { updatedAt: "desc" },
          select: { id: true, title: true, stage: true },
        },
      },
    }),
    prisma.crmAccount.findMany({
      where: { orgId: session.orgId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!contact) notFound();

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Users className="w-4 h-4" />
        <Link href="/crm/contacts" className="hover:text-slate-600">Contacts</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">
          {contact.firstName} {contact.lastName}
        </span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-semibold text-slate-600">
              {contact.firstName[0]}{contact.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {contact.firstName} {contact.lastName}
                {contact.isSampleData && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 ml-2 align-middle">
                    sample
                  </span>
                )}
              </h1>
              {contact.title && (
                <p className="text-slate-500 text-sm">{contact.title}</p>
              )}
              {contact.account && (
                <Link
                  href={`/crm/accounts/${contact.account.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {contact.account.name}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600">
                <Mail className="w-3.5 h-3.5" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600">
                <Phone className="w-3.5 h-3.5" />
                {contact.phone}
              </a>
            )}
            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main */}
        <div className="col-span-2 space-y-6">
          {/* Activities */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Activity</h2>
              <AddActivityModal accountId={contact.accountId ?? undefined} />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ActivityFeed activities={contact.activities} />
            </div>
          </section>

          {/* Deals */}
          {contact.deals.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Deals ({contact.deals.length})
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {contact.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/crm/deals/${deal.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 text-sm">{deal.title}</span>
                    <span className="text-xs text-slate-500">{deal.stage.replace(/_/g, " ")}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Edit contact</h2>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <ContactForm
                accounts={accounts}
                mode="edit"
                contactId={contact.id}
                defaultValues={{
                  firstName: contact.firstName,
                  lastName: contact.lastName,
                  title: contact.title,
                  email: contact.email,
                  phone: contact.phone,
                  linkedinUrl: contact.linkedinUrl,
                  accountId: contact.accountId,
                  notes: contact.notes,
                }}
              />
            </div>
          </section>

          {contact.notes && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Notes</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{contact.notes}</p>
              </div>
            </section>
          )}

          <p className="text-xs text-slate-400">Updated {formatDate(contact.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
