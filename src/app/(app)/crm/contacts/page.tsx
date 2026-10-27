import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus, UserCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ContactsPage() {
  const session = await requireSession();

  const contacts = await prisma.contact.findMany({
    where: { orgId: session.orgId },
    include: {
      account: { select: { id: true, name: true } },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            <span>CRM</span>
            <span>/</span>
            <span>Contacts</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
        </div>
        <Link
          href="/crm/contacts/new"
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <UserCircle2 className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No contacts yet</h3>
          <p className="text-slate-500 text-sm mb-4">Add contacts to track buying team members.</p>
          <Link
            href="/crm/contacts/new"
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add contact
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3 font-medium text-slate-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Account</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-slate-500">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link
                      href={`/crm/contacts/${contact.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>
                    {contact.isSampleData && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full ml-1">
                        sample
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{contact.title ?? "—"}</td>
                  <td className="px-5 py-3">
                    {contact.account ? (
                      <Link
                        href={`/crm/accounts/${contact.account.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.account.name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{contact.email ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-400">{formatDate(contact.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
