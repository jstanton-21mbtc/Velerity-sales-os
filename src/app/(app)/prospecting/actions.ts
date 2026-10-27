"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SignalType } from "@prisma/client";

// ============================================================
// BUYING SIGNALS
// ============================================================

export async function createSignal(formData: {
  type: SignalType;
  title: string;
  summary?: string;
  sourceUrl?: string;
  accountId?: string;
  detectedAt?: Date;
}) {
  const session = await requireSession();

  await prisma.buyingSignal.create({
    data: {
      type: formData.type,
      title: formData.title,
      summary: formData.summary || null,
      sourceUrl: formData.sourceUrl || null,
      accountId: formData.accountId || null,
      detectedAt: formData.detectedAt ?? new Date(),
      orgId: session.orgId,
    },
  });

  revalidatePath("/prospecting/signals");
}

export async function deleteSignal(id: string) {
  const session = await requireSession();
  await prisma.buyingSignal.delete({ where: { id, orgId: session.orgId } });
  revalidatePath("/prospecting/signals");
}

// ============================================================
// CSV ACCOUNT IMPORT
// ============================================================

export type CsvImportRow = {
  name: string;
  domain?: string;
  industry?: string;
  hqCity?: string;
  hqCountry?: string;
  website?: string;
  notes?: string;
};

export async function importAccountsCsv(rows: CsvImportRow[]) {
  const session = await requireSession();

  if (rows.length === 0) return { imported: 0, skipped: 0 };

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name?.trim()) { skipped++; continue; }

    // Skip if account with same name already exists in org
    const existing = await prisma.crmAccount.findFirst({
      where: { orgId: session.orgId, name: row.name.trim() },
      select: { id: true },
    });
    if (existing) { skipped++; continue; }

    await prisma.crmAccount.create({
      data: {
        name: row.name.trim(),
        domain: row.domain?.trim() || null,
        industry: row.industry?.trim() || null,
        hqCity: row.hqCity?.trim() || null,
        hqCountry: row.hqCountry?.trim() || null,
        website: row.website?.trim() || null,
        notes: row.notes?.trim() || null,
        orgId: session.orgId,
      },
    });
    imported++;
  }

  revalidatePath("/crm/accounts");
  return { imported, skipped };
}
