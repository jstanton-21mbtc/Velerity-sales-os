"use client";

import { useState, useTransition } from "react";
import { createAccount, updateAccount } from "@/app/(app)/crm/actions";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "AI / Machine Learning",
  "Autonomous Vehicles & Robotics",
  "Bitcoin / Crypto",
  "Cloud & Hosting",
  "Energy & Oil/Gas",
  "Financial Services",
  "Government / Defense",
  "Healthcare & Life Sciences",
  "Media / VFX / Rendering",
  "Research & Academia",
  "SaaS / Technology",
  "Telecommunications",
  "Other",
];

type AccountFormProps = {
  mode?: "create";
} | {
  mode: "edit";
  accountId: string;
  defaultValues: {
    name: string;
    domain?: string | null;
    industry?: string | null;
    hqCountry?: string | null;
    hqCity?: string | null;
    website?: string | null;
    linkedinUrl?: string | null;
    notes?: string | null;
  };
};

export function AccountForm(props: AccountFormProps) {
  const mode = "mode" in props && props.mode === "edit" ? "edit" : "create";
  const defaults = mode === "edit" && "defaultValues" in props ? props.defaultValues : undefined;

  const [name, setName] = useState(defaults?.name ?? "");
  const [domain, setDomain] = useState(defaults?.domain ?? "");
  const [industry, setIndustry] = useState(defaults?.industry ?? "");
  const [hqCity, setHqCity] = useState(defaults?.hqCity ?? "");
  const [hqCountry, setHqCountry] = useState(defaults?.hqCountry ?? "");
  const [website, setWebsite] = useState(defaults?.website ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(defaults?.linkedinUrl ?? "");
  const [notes, setNotes] = useState(defaults?.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Account name is required"); return; }
    setError("");

    const formData = {
      name: name.trim(),
      domain: domain.trim() || undefined,
      industry: industry || undefined,
      hqCity: hqCity.trim() || undefined,
      hqCountry: hqCountry.trim() || undefined,
      website: website.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    startTransition(async () => {
      if (mode === "edit" && "accountId" in props) {
        await updateAccount(props.accountId, formData);
        router.refresh();
      } else {
        await createAccount(formData);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Account name <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Acme AI Labs"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Domain</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.ai"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">— Select —</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">HQ City</label>
          <input
            value={hqCity}
            onChange={(e) => setHqCity(e.target.value)}
            placeholder="San Francisco"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">HQ Country</label>
          <input
            value={hqCountry}
            onChange={(e) => setHqCountry(e.target.value)}
            placeholder="US"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://acme.ai"
          type="url"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
        <input
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/company/acme-ai"
          type="url"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Context on the account, buying team, GPU needs..."
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
          {isPending ? "Saving…" : mode === "edit" ? "Save changes" : "Create account"}
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
