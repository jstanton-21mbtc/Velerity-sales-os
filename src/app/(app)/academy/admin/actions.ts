"use server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function verifyGpuSpec({
  id,
  sourceUrl,
  verifiedById,
}: {
  id: string;
  sourceUrl: string;
  verifiedById: string;
}) {
  await requireRole("ADMIN");

  await prisma.gpuSpec.update({
    where: { id },
    data: {
      verified: true,
      sourceUrl: sourceUrl || null,
      verifiedById,
      verifiedAt: new Date(),
    },
  });

  revalidatePath("/academy/gpus");
  revalidatePath("/academy/admin");
}

export async function verifyPlatformSpec({
  id,
  sourceUrl,
  verifiedById,
}: {
  id: string;
  sourceUrl: string;
  verifiedById: string;
}) {
  await requireRole("ADMIN");

  await prisma.platformSpec.update({
    where: { id },
    data: {
      verified: true,
      sourceUrl: sourceUrl || null,
      verifiedById,
      verifiedAt: new Date(),
    },
  });

  revalidatePath("/academy/platforms");
  revalidatePath("/academy/admin");
}

export async function updateGpuSpec({
  id,
  sourceUrl,
}: {
  id: string;
  sourceUrl: string;
}) {
  await requireRole("ADMIN");

  await prisma.gpuSpec.update({
    where: { id },
    data: { sourceUrl: sourceUrl || null },
  });

  revalidatePath("/academy/admin");
}

export async function updatePlatformSpec({
  id,
  sourceUrl,
}: {
  id: string;
  sourceUrl: string;
}) {
  await requireRole("ADMIN");

  await prisma.platformSpec.update({
    where: { id },
    data: { sourceUrl: sourceUrl || null },
  });

  revalidatePath("/academy/admin");
}
