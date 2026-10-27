import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VerificationBadge } from "@/components/academy/verification-badge";
import { Cpu, ChevronRight, ExternalLink, CheckCircle, XCircle } from "lucide-react";

type SpecRow = { label: string; value: string | number | null | undefined; note?: string };

function SpecTable({ rows }: { rows: SpecRow[] }) {
  const visible = rows.filter((r) => r.value != null && r.value !== "");
  if (visible.length === 0) return null;
  return (
    <div className="divide-y divide-slate-100">
      {visible.map((row) => (
        <div key={row.label} className="flex justify-between items-start py-2.5 text-sm">
          <span className="text-slate-500 shrink-0 pr-4">{row.label}</span>
          <span className="font-medium text-slate-900 text-right">
            {String(row.value)}
            {row.note && <span className="text-slate-400 font-normal ml-1">({row.note})</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function GpuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSession();
  const { slug } = await params;

  const gpu = await prisma.gpuSpec.findUnique({
    where: { slug },
    include: {
      verifiedBy: { select: { name: true, email: true } },
      platforms: {
        include: { platform: { select: { slug: true, name: true, oem: true, gpuCount: true } } },
      },
    },
  });

  if (!gpu) notFound();

  const computeRows: SpecRow[] = [
    { label: "FP64 (double precision)", value: gpu.fp64TflopsStr },
    { label: "FP32 (single precision)", value: gpu.fp32TflopsStr },
    { label: "TF32 (Tensor Core)", value: gpu.tf32TflopsStr },
    { label: "BF16 (Tensor Core)", value: gpu.bf16TflopsStr },
    { label: "FP16 (Tensor Core)", value: gpu.fp16TflopsStr },
    { label: "FP8 (Transformer Engine)", value: gpu.fp8TflopsStr, note: gpu.transformerEngine ? "requires Transformer Engine" : undefined },
    { label: "INT8", value: gpu.int8TopsStr },
  ];

  const memoryRows: SpecRow[] = [
    { label: "Memory capacity", value: `${gpu.memoryGb} GB` },
    { label: "Memory type", value: gpu.memoryType },
    { label: "Memory bandwidth", value: gpu.memoryBwTbps ? `${gpu.memoryBwTbps} TB/s` : null },
  ];

  const interconnectRows: SpecRow[] = [
    { label: "NVLink generation", value: gpu.nvlinkGeneration },
    { label: "NVLink bandwidth", value: gpu.nvlinkBwGbps ? `${gpu.nvlinkBwGbps} GB/s` : null },
  ];

  const physicalRows: SpecRow[] = [
    { label: "Form factor", value: gpu.formFactor },
    { label: "TDP", value: gpu.tdpWatts ? `${gpu.tdpWatts} W` : null },
  ];

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Cpu className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/academy/gpus" className="hover:text-slate-600">GPU Reference</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{gpu.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wide">
              {gpu.generation}
            </span>
            <VerificationBadge verified={gpu.verified} sourceUrl={gpu.sourceUrl} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{gpu.name}</h1>
          <p className="text-slate-500 mt-1">{gpu.variant}</p>
        </div>
        {gpu.sourceUrl && (
          <a
            href={gpu.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5 hover:border-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Official source
          </a>
        )}
      </div>

      {/* Best for */}
      {gpu.bestFor && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 mb-1">Best for</p>
          <p className="text-blue-800 text-sm leading-relaxed">{gpu.bestFor}</p>
        </div>
      )}

      {/* Spec grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Memory</h2>
          <SpecTable rows={memoryRows} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Physical</h2>
          <SpecTable rows={physicalRows} />
          {/* Features */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <FeatureRow label="MIG support" enabled={gpu.migSupport} detail={gpu.migSupport && gpu.migMaxInstances ? `up to ${gpu.migMaxInstances} instances` : undefined} />
            <FeatureRow label="Transformer Engine (FP8)" enabled={gpu.transformerEngine} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 md:col-span-2">
          <h2 className="font-semibold text-slate-900 mb-3">Compute Throughput</h2>
          <SpecTable rows={computeRows} />
        </div>

        {(gpu.nvlinkGeneration || gpu.nvlinkBwGbps) && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-3">Interconnect</h2>
            <SpecTable rows={interconnectRows} />
          </div>
        )}
      </div>

      {/* Notes */}
      {gpu.notes && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{gpu.notes}</p>
        </div>
      )}

      {/* Available in platforms */}
      {gpu.platforms.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">Available in Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gpu.platforms.map(({ platform }: { platform: { slug: string; name: string; oem: string; gpuCount: number } }) => (
              <Link
                key={platform.slug}
                href={`/academy/platforms/${platform.slug}`}
                className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                <div>
                  <span className="font-medium text-slate-900">{platform.name}</span>
                  <span className="text-slate-400 ml-2">{platform.oem}</span>
                </div>
                <span className="text-slate-400 text-xs">{platform.gpuCount}× GPU</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Verification footer */}
      <div className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        {gpu.verified && gpu.verifiedBy && gpu.verifiedAt ? (
          <span>
            Verified by {gpu.verifiedBy.name ?? gpu.verifiedBy.email} on{" "}
            {new Date(gpu.verifiedAt).toLocaleDateString()}
            {gpu.sourceUrl && (
              <>
                {" · "}
                <a href={gpu.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  Source
                </a>
              </>
            )}
          </span>
        ) : (
          <span className="text-amber-500">
            This spec has not been verified against an official source. An admin can verify it in Server Academy Admin.
          </span>
        )}
      </div>
    </div>
  );
}

function FeatureRow({
  label,
  enabled,
  detail,
}: {
  label: string;
  enabled: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {enabled ? (
        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
      )}
      <span className={enabled ? "text-slate-800" : "text-slate-400"}>
        {label}
        {detail && <span className="text-slate-500 ml-1">({detail})</span>}
      </span>
    </div>
  );
}
