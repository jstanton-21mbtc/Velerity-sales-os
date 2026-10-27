"use server";

import { requireSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  ConditionGrade,
  UnitStatus,
  CertStatus,
  WarrantyType,
  SupplierStatus,
  LineItemCategory,
} from "@prisma/client";

// ============================================================
// INVENTORY UNITS
// ============================================================

export async function createUnit(formData: {
  serialNumber: string;
  oem: string;
  model: string;
  gpuType: string;
  gpuCount: number;
  conditionGrade: ConditionGrade;
  warrantyType?: WarrantyType;
  warrantyTermMonths?: number;
  location?: string;
  costUsd?: number;
  listPriceUsd?: number;
  notes?: string;
  supplierId?: string;
}) {
  const session = await requireSession();

  const unit = await prisma.inventoryUnit.create({
    data: {
      ...formData,
      warrantyType: formData.warrantyType ?? null,
      warrantyTermMonths: formData.warrantyTermMonths ?? null,
      location: formData.location || null,
      costUsd: formData.costUsd ?? null,
      listPriceUsd: formData.listPriceUsd ?? null,
      notes: formData.notes || null,
      supplierId: formData.supplierId || null,
      orgId: session.orgId,
    },
  });

  revalidatePath("/inventory");
  redirect(`/inventory/${unit.id}`);
}

export async function updateUnit(
  id: string,
  formData: {
    oem?: string;
    model?: string;
    gpuType?: string;
    gpuCount?: number;
    conditionGrade?: ConditionGrade;
    warrantyType?: WarrantyType | null;
    warrantyTermMonths?: number | null;
    location?: string;
    costUsd?: number | null;
    listPriceUsd?: number | null;
    notes?: string;
    supplierId?: string | null;
  }
) {
  const session = await requireSession();

  await prisma.inventoryUnit.update({
    where: { id, orgId: session.orgId },
    data: {
      ...formData,
      location: formData.location || null,
      notes: formData.notes || null,
    },
  });

  revalidatePath(`/inventory/${id}`);
  revalidatePath("/inventory");
}

export async function updateUnitStatus(
  id: string,
  status: UnitStatus,
  certStatus?: CertStatus
) {
  const session = await requireSession();

  await prisma.inventoryUnit.update({
    where: { id, orgId: session.orgId },
    data: {
      status,
      ...(certStatus && { certStatus }),
    },
  });

  revalidatePath(`/inventory/${id}`);
  revalidatePath("/inventory");
}

export async function reserveUnit(unitId: string, dealId: string) {
  const session = await requireSession();

  // Verify both belong to org
  const [unit, deal] = await Promise.all([
    prisma.inventoryUnit.findUnique({ where: { id: unitId, orgId: session.orgId } }),
    prisma.deal.findUnique({ where: { id: dealId, orgId: session.orgId } }),
  ]);

  if (!unit) return { ok: false, error: "Unit not found" };
  if (!deal) return { ok: false, error: "Deal not found" };
  if (unit.status === "SOLD" || unit.status === "SHIPPED") {
    return { ok: false, error: "Unit is already sold or shipped" };
  }
  if (unit.status === "RESERVED") {
    return { ok: false, error: "Unit is already reserved" };
  }

  await prisma.$transaction([
    prisma.inventoryReservation.create({ data: { unitId, dealId } }),
    prisma.inventoryUnit.update({ where: { id: unitId }, data: { status: "RESERVED" } }),
  ]);

  revalidatePath(`/inventory/${unitId}`);
  revalidatePath(`/crm/deals/${dealId}`);
  return { ok: true };
}

export async function releaseUnit(unitId: string, dealId: string) {
  const session = await requireSession();

  await prisma.inventoryUnit.findUnique({
    where: { id: unitId, orgId: session.orgId },
  });

  await prisma.$transaction([
    prisma.inventoryReservation.updateMany({
      where: { unitId, dealId, releasedAt: null },
      data: { releasedAt: new Date() },
    }),
    prisma.inventoryUnit.update({
      where: { id: unitId },
      data: { status: "CERTIFIED" },
    }),
  ]);

  revalidatePath(`/inventory/${unitId}`);
  revalidatePath(`/crm/deals/${dealId}`);
  return { ok: true };
}

// ============================================================
// SUPPLIERS
// ============================================================

export async function createSupplier(formData: {
  name: string;
  domain?: string;
  notes?: string;
}) {
  const session = await requireSession();

  const supplier = await prisma.supplier.create({
    data: {
      name: formData.name,
      domain: formData.domain || null,
      notes: formData.notes || null,
      orgId: session.orgId,
    },
  });

  revalidatePath("/inventory/suppliers");
  redirect(`/inventory/suppliers/${supplier.id}`);
}

export async function updateSupplier(
  id: string,
  formData: { name?: string; domain?: string; notes?: string }
) {
  const session = await requireSession();

  await prisma.supplier.update({
    where: { id, orgId: session.orgId },
    data: {
      name: formData.name,
      domain: formData.domain || null,
      notes: formData.notes || null,
    },
  });

  revalidatePath(`/inventory/suppliers/${id}`);
}

export async function updateSupplierStatus(id: string, status: SupplierStatus) {
  await requireRole("MANAGER");
  const session = await requireSession();

  await prisma.supplier.update({
    where: { id, orgId: session.orgId },
    data: {
      qualificationStatus: status,
      qualifiedAt: status === "QUALIFIED" ? new Date() : null,
    },
  });

  revalidatePath(`/inventory/suppliers/${id}`);
  revalidatePath("/inventory/suppliers");
}

// ============================================================
// QUOTE LINE ITEMS
// ============================================================

export async function addLineItem(
  dealId: string,
  formData: {
    description: string;
    quantity: number;
    unitPriceUsd: number;
    category: LineItemCategory;
  }
) {
  const session = await requireSession();

  // Verify deal belongs to org
  await prisma.deal.findUniqueOrThrow({ where: { id: dealId, orgId: session.orgId } });

  await prisma.quoteLineItem.create({
    data: { dealId, ...formData },
  });

  revalidatePath(`/inventory/quote/${dealId}`);
}

export async function updateLineItem(
  id: string,
  dealId: string,
  formData: {
    description?: string;
    quantity?: number;
    unitPriceUsd?: number;
    category?: LineItemCategory;
  }
) {
  const session = await requireSession();

  // Verify deal belongs to org
  await prisma.deal.findUniqueOrThrow({ where: { id: dealId, orgId: session.orgId } });

  await prisma.quoteLineItem.update({ where: { id }, data: formData });

  revalidatePath(`/inventory/quote/${dealId}`);
}

export async function removeLineItem(id: string, dealId: string) {
  const session = await requireSession();

  await prisma.deal.findUniqueOrThrow({ where: { id: dealId, orgId: session.orgId } });
  await prisma.quoteLineItem.delete({ where: { id } });

  revalidatePath(`/inventory/quote/${dealId}`);
}
