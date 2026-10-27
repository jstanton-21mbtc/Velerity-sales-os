"use client";

import { useState, useTransition } from "react";
import { createContact, updateContact } from "@/app/(app)/crm/actions";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string };

type ContactFormProps = {
  accounts: Account[];
  mode?: "create";
  defaultAccountId?: string;
} | {
  accounts: Account[];
  mode: "edit";
  contactId: string;
  defaultValues: {
    firstName: string;
    lastName: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    accountId?: string | null;
    notes?: string | null;
  };
};

export function ContactForm(props: ContactFormProps) {
  const mode = "mode" in props && props.mode === "edit" ? "edit" : "create";
  const defaults = mode === "edit" && "defaultValues" in props ? props.defaultValues : undefined;
  const defaultAccountId = "defaultAccountId" in props ? props.defaultAccountId : undefined;

  const [firstName, setFirstName] = useState(defaults?.firstName ?? "");
  const [lastName, setLastName] = useState(defaults?.lastName ?? "");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(defaults?.linkedinUrl ?? "");
  const [accountId, setAccountId] = useState(defaults?.accountId ?? defaultAccountId ?? "");
  const [notes, setNotes] = useState(defaults?.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }
    setError("");

    const formData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      accountId: accountId || undefined,
      notes: notes.trim() || undefined,
    };

    startTransition(async () => {
      if (mode === "edit" && "contactId" in props) {
        await updateContact(props.contactId, formData);
        router.refresh();
      } else {
        await createContact(formData);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            First name <span className="text-red-500">*</span>
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Sarah"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Last name <span className="text-red-500">*</span>
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Chen"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VP of Infrastructure"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— No account —</option>
          {props.accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="sarah@acme.ai"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="+1 415 555 0100"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
        <input
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          type="url"
          placeholder="https://linkedin.com/in/sarah-chen"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Role, buying authority, context..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Create contact"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
