import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerificationBadge } from "@/components/academy/verification-badge";
import { Server, ChevronRight, ExternalLink, CheckCircle } from "lucide-react";

type SpecRow = { label: string; value: string | number | null | undefined };

function SpecTable({ rows }: { rows: SpecRow[] }) {
  const visible = rows.filter((r) => r.value != null && r.value !== "");
  if (visible.length === 0) return null;
  return (
    <div className="divide-y divide-slate-100">
      {visible.map((row) => (
        <div key={row.label} className="flex justify-between items-center py-2.5 text-sm">
          <span className="text-slate-500">{row.label}</span>
          <span className="font-medium text-slate-900 text-right">{String(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSession();
  const { slug } = await params;

  const platform = await prisma.platformSpec.findUnique({
    where: { slug },
    include: {
      verifiedBy: { select: { name: true, email: true } },
      gpus: {
        include: {
          gpuSpec: {
            select: {
              slug: true,
              name: true,
              generation: true,
              memoryGb: true,
              memoryType: true,
              fp16TflopsStr: true,
              tdpWatts: true,
            },
          },
        },
      },
    },
  });

  if (!platform) notFound();

  const formRows: SpecRow[] = [
    { label: "Form factor", value: platform.formFactorU ? `${platform.formFactorU}U` : null },
    { label: "Weight", value: platform.weightKg ? `${platform.weightKg} kg` : null },
    { label: "Rack units", value: platform.rackUnits },
  ];

  const computeRows: SpecRow[] = [
    { label: "GPU count", value: `${platform.gpuCount}×` },
    { label: "CPU options", value: platform.cpuOptions },
    { label: "Max RAM", value: platform.maxRamGb ? `${platform.maxRamGb} GB` : null },
    { label: "Storage", value: platform.storageConfig },
  ];

  const networkRows: SpecRow[] = [
    { label: "Networking", value: platform.networkingConfig },
    { label: "DPU", value: platform.hasDpu ? platform.dpuModel ?? "Yes" : "No" },
  ];

  const powerRows: SpecRow[] = [
    { label: "Total power draw", value: platform.tdpWatts ? `${platform.tdpWatts.toLocaleString()} W` : null },
    { label: "PSU configuration", value: platform.psuConfig },
    { label: "Cooling", value: platform.coolingType === "AIR" ? "Air cooled" : platform.coolingType === "LIQUID" ? "Liquid cooled" : "Hybrid" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Server className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/academy/platforms" className="hover:text-slate-600">Platform Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{platform.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {platform.oem}
            </span>
            <VerificationBadge verified={platform.verified} sourceUrl={platform.sourceUrl} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{platform.name}</h1>
          <p className="text-slate-500 mt-1">{platform.gpuCount}× GPU · {platform.coolingType.toLowerCase()} cooled</p>
        </div>
        {platform.sourceUrl && (
          <a
            href={platform.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5 hover:border-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Official source
          </a>
        )}
      </div>

      {/* Spec grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Form Factor</h2>
          <SpecTable rows={formRows} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Compute & Memory</h2>
          <SpecTable rows={computeRows} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Networking</h2>
          <SpecTable rows={networkRows} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Power & Cooling</h2>
          <SpecTable rows={powerRows} />
        </div>
      </div>

      {/* GPUs in this platform */}
      {platform.gpus.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">GPU Specification</h2>
          <div className="space-y-2">
            {platform.gpus.map(({ gpuSpec }: { gpuSpec: { slug: string; name: string; memoryGb: number; memoryType: string; fp16TflopsStr: string | null; tdpWatts: number | null } }) => (
              <Link
                key={gpuSpec.slug}
                href={`/academy/gpus/${gpuSpec.slug}`}
                className="flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-900 text-sm">{gpuSpec.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{gpuSpec.memoryGb}GB {gpuSpec.memoryType}</span>
                  {gpuSpec.fp16TflopsStr && <span>{gpuSpec.fp16TflopsStr} FP16</span>}
                  {gpuSpec.tdpWatts && <span>{gpuSpec.tdpWatts}W</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {platform.notes && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{platform.notes}</p>
        </div>
      )}

      {/* Verification footer */}
      <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        {platform.verified && platform.verifiedBy && platform.verifiedAt ? (
          <span>
            Verified by {platform.verifiedBy.name ?? platform.verifiedBy.email} on{" "}
            {new Date(platform.verifiedAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-amber-500">
            This spec has not been verified against an official source.
          </span>
        )}
      </div>
    </div>
  );
}
