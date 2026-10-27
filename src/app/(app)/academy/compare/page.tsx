import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { CompareClient } from "./compare-client";

export default async function ComparePage() {
  await requireSession();

  const [gpus, platforms] = await Promise.all([
    prisma.gpuSpec.findMany({
      orderBy: [{ generation: "asc" }, { memoryGb: "asc" }],
    }),
    prisma.platformSpec.findMany({
      include: { gpus: { include: { gpuSpec: { select: { generation: true } } } } },
      orderBy: [{ oem: "asc" }, { name: "asc" }],
    }),
  ]);

  return <CompareClient gpus={gpus} platforms={platforms} />;
}
