"use server";

import { requireSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkComplianceGate, STAGE_ORDER } from "@/lib/compliance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DealStage, ActivityType, GpuGeneration } from "@prisma/client";

// ============================================================
// ACCOUNTS
// ============================================================

export async function createAccount(formData: {
  name: string;
  domain?: string;
  industry?: string;
  hqCountry?: string;
  hqCity?: string;
  website?: string;
  linkedinUrl?: string;
  notes?: string;
}) {
  const session = await requireSession();

  const account = await prisma.crmAccount.create({
    data: {
      ...formData,
      domain: formData.domain || null,
      industry: formData.industry || null,
      hqCountry: formData.hqCountry || null,
      hqCity: formData.hqCity || null,
      website: formData.website || null,
      linkedinUrl: formData.linkedinUrl || null,
      notes: formData.notes || null,
      orgId: session.orgId,
    },
  });

  revalidatePath("/crm/accounts");
  redirect(`/crm/accounts/${account.id}`);
}

export async function updateAccount(
  id: string,
  formData: {
    name: string;
    domain?: string;
    industry?: string;
    hqCountry?: string;
    hqCity?: string;
    website?: string;
    linkedinUrl?: string;
    notes?: string;
  }
) {
  const session = await requireSession();

  await prisma.crmAccount.update({
    where: { id, orgId: session.orgId },
    data: {
      ...formData,
      domain: formData.domain || null,
      industry: formData.industry || null,
      hqCountry: formData.hqCountry || null,
      hqCity: formData.hqCity || null,
      website: formData.website || null,
      linkedinUrl: formData.linkedinUrl || null,
      notes: formData.notes || null,
    },
  });

  revalidatePath(`/crm/accounts/${id}`);
  revalidatePath("/crm/accounts");
}

// ============================================================
// CONTACTS
// ============================================================

export async function createContact(formData: {
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  accountId?: string;
  notes?: string;
}) {
  const session = await requireSession();

  const contact = await prisma.contact.create({
    data: {
      ...formData,
      title: formData.title || null,
      email: formData.email || null,
      phone: formData.phone || null,
      linkedinUrl: formData.linkedinUrl || null,
      accountId: formData.accountId || null,
      notes: formData.notes || null,
      orgId: session.orgId,
    },
  });

  revalidatePath("/crm/contacts");
  redirect(`/crm/contacts/${contact.id}`);
}

export async function updateContact(
  id: string,
  formData: {
    firstName: string;
    lastName: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    accountId?: string;
    notes?: string;
  }
) {
  const session = await requireSession();

  await prisma.contact.update({
    where: { id, orgId: session.orgId },
    data: {
      ...formData,
      title: formData.title || null,
      email: formData.email || null,
      phone: formData.phone || null,
      linkedinUrl: formData.linkedinUrl || null,
      accountId: formData.accountId || null,
      notes: formData.notes || null,
    },
  });

  revalidatePath(`/crm/contacts/${id}`);
  revalidatePath("/crm/contacts");
}

// ============================================================
// DEALS
// ============================================================

export async function createDeal(formData: {
  title: string;
  accountId: string;
  targetGpuGeneration?: GpuGeneration;
  gpuQuantity?: number;
  nodeQuantity?: number;
  workloadType?: string;
  deploymentCountry?: string;
  deploymentSite?: string;
  timeline?: string;
  budgetUsd?: number;
  competingPaths?: string[];
  valueUsd?: number;
}) {
  const session = await requireSession();

  const deal = await prisma.deal.create({
    data: {
      title: formData.title,
      accountId: formData.accountId,
      orgId: session.orgId,
      assignedRepId: session.id,
      stage: "PROSPECT",
      targetGpuGeneration: formData.targetGpuGeneration || null,
      gpuQuantity: formData.gpuQuantity || null,
      nodeQuantity: formData.nodeQuantity || null,
      workloadType: formData.workloadType || null,
      deploymentCountry: formData.deploymentCountry || null,
      deploymentSite: formData.deploymentSite || null,
      timeline: formData.timeline || null,
      budgetUsd: formData.budgetUsd || null,
      competingPaths: formData.competingPaths ?? [],
      valueUsd: formData.valueUsd || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      dealId: deal.id,
      userId: session.id,
      action: "deal_created",
      toValue: "PROSPECT",
      notes: "Deal created",
    },
  });

  revalidatePath("/crm/deals");
  revalidatePath("/crm/pipeline");
  redirect(`/crm/deals/${deal.id}`);
}

export async function updateDeal(
  id: string,
  formData: {
    title?: string;
    targetGpuGeneration?: GpuGeneration | null;
    gpuQuantity?: number | null;
    nodeQuantity?: number | null;
    workloadType?: string;
    deploymentCountry?: string;
    deploymentSite?: string;
    powerReadiness?: boolean | null;
    coolingReadiness?: boolean | null;
    timeline?: string;
    budgetUsd?: number | null;
    competingPaths?: string[];
    valueUsd?: number | null;
    winLossReason?: string;
  }
) {
  const session = await requireSession();

  await prisma.deal.update({
    where: { id, orgId: session.orgId },
    data: {
      ...formData,
      workloadType: formData.workloadType || null,
      deploymentCountry: formData.deploymentCountry || null,
      deploymentSite: formData.deploymentSite || null,
      timeline: formData.timeline || null,
      winLossReason: formData.winLossReason || null,
    },
  });

  revalidatePath(`/crm/deals/${id}`);
  revalidatePath("/crm/pipeline");
}

/**
 * Advance a deal to the next stage.
 *
 * COMPLIANCE GATE: Cannot advance past BUYER_COMPLIANCE_SCREENING without
 * complianceReviewedById, complianceReviewedAt, and complianceNotes (min 10 chars).
 */
export async function advanceDealStage(
  dealId: string,
  nextStage: DealStage,
  options?: {
    complianceReviewedById?: string;
    complianceNotes?: string;
    winLossReason?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();

  const deal = await prisma.deal.findUnique({
    where: { id: dealId, orgId: session.orgId },
    select: {
      id: true,
      stage: true,
      complianceReviewedById: true,
      complianceReviewedAt: true,
      complianceNotes: true,
    },
  });

  if (!deal) return { ok: false, error: "Deal not found" };

  // Build merged compliance data for the gate check
  const checkDeal = {
    stage: deal.stage,
    complianceReviewedById:
      options?.complianceReviewedById ?? deal.complianceReviewedById,
    complianceReviewedAt:
      options?.complianceReviewedById ? new Date() : deal.complianceReviewedAt,
    complianceNotes: options?.complianceNotes ?? deal.complianceNotes,
  };

  const gate = checkComplianceGate(checkDeal, nextStage);
  if (!gate.ok) return gate;

  const isClosing =
    nextStage === "DEPLOYED_EXPANSION" || nextStage === "CLOSED_LOST";

  await prisma.$transaction(async (tx) => {
    await tx.deal.update({
      where: { id: dealId },
      data: {
        stage: nextStage,
        ...(options?.complianceReviewedById && {
          complianceReviewedById: options.complianceReviewedById,
          complianceReviewedAt: new Date(),
          complianceNotes: options.complianceNotes,
        }),
        ...(isClosing && {
          closeDate: new Date(),
          winLossReason: options?.winLossReason ?? null,
        }),
      },
    });

    await tx.auditLog.create({
      data: {
        dealId,
        userId: session.id,
        action: "stage_change",
        fromValue: deal.stage,
        toValue: nextStage,
        notes:
          options?.complianceReviewedById
            ? `Compliance complete. ${options.complianceNotes ?? ""}`
            : undefined,
      },
    });
  });

  revalidatePath(`/crm/deals/${dealId}`);
  revalidatePath("/crm/pipeline");
  return { ok: true };
}

// ============================================================
// ACTIVITIES
// ============================================================

export async function addActivity(formData: {
  type: ActivityType;
  subject: string;
  body?: string;
  dealId?: string;
  accountId?: string;
  contactId?: string;
  occurredAt?: Date;
}) {
  const session = await requireSession();

  await prisma.activity.create({
    data: {
      type: formData.type,
      subject: formData.subject,
      body: formData.body || null,
      dealId: formData.dealId || null,
      accountId: formData.accountId || null,
      contactId: formData.contactId || null,
      occurredAt: formData.occurredAt ?? new Date(),
      orgId: session.orgId,
      userId: session.id,
    },
  });

  if (formData.dealId) {
    revalidatePath(`/crm/deals/${formData.dealId}`);
  }
  if (formData.accountId) {
    revalidatePath(`/crm/accounts/${formData.accountId}`);
  }
}

export async function deleteActivity(id: string) {
  const session = await requireSession();

  await prisma.activity.delete({
    where: { id, orgId: session.orgId },
  });

  revalidatePath("/crm");
}

// ============================================================
// MANAGER: close lost
// ============================================================

export async function closeLost(dealId: string, winLossReason: string) {
  await requireSession();
  return advanceDealStage(dealId, "CLOSED_LOST", { winLossReason });
}
