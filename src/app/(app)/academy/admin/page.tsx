import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminVerifyClient } from "./admin-verify-client";
import { ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function AdminSpecPage() {
  const session = await requireRole("ADMIN");

  const [unverifiedGpus, unverifiedPlatforms, allGpus, allPlatforms] =
    await Promise.all([
      prisma.gpuSpec.findMany({
        where: { verified: false },
        orderBy: { generation: "asc" },
      }),
      prisma.platformSpec.findMany({
        where: { verified: false },
        orderBy: { oem: "asc" },
      }),
      prisma.gpuSpec.findMany({ orderBy: [{ generation: "asc" }, { name: "asc" }] }),
      prisma.platformSpec.findMany({ orderBy: [{ oem: "asc" }, { name: "asc" }] }),
    ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <ShieldCheck className="w-4 h-4" />
          <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Admin — Spec Verification</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Spec Verification</h1>
        <p className="text-slate-500 mt-1">
          Verify GPU and platform specs against official sources. Only verified specs
          are shown as trusted to reps.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total GPUs"
          value={allGpus.length}
          sub={`${allGpus.filter((g: { verified: boolean }) => g.verified).length} verified`}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="Total Platforms"
          value={allPlatforms.length}
          sub={`${allPlatforms.filter((p: { verified: boolean }) => p.verified).length} verified`}
          color="text-violet-600"
          bg="bg-violet-50"
        />
        <StatCard
          label="Needs Review"
          value={unverifiedGpus.length + unverifiedPlatforms.length}
          sub="unverified specs"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      <AdminVerifyClient
        unverifiedGpus={unverifiedGpus}
        unverifiedPlatforms={unverifiedPlatforms}
        currentUserId={session.id}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  bg,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} border rounded-xl p-5`}>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="font-semibold text-slate-800 mt-0.5">{label}</p>
      <p className="text-slate-500 text-sm">{sub}</p>
    </div>
  );
}
