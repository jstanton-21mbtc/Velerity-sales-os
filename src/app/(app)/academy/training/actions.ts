"use server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveQuizResult(moduleId: string, score: number, total: number) {
  const session = await requireSession();

  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  await prisma.trainingProgress.upsert({
    where: { userId_moduleId: { userId: session.id, moduleId } },
    create: {
      userId: session.id,
      moduleId,
      orgId: session.orgId,
      completed: passed,
      score: pct,
      completedAt: passed ? new Date() : null,
    },
    update: {
      score: pct,
      completed: passed,
      completedAt: passed ? new Date() : null,
    },
  });

  revalidatePath("/academy/training");
  revalidatePath(`/academy/training/${moduleId}`);

  return { passed, pct };
}
