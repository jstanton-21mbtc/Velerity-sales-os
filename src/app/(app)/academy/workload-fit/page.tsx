import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, ChevronRight, BarChart2 } from "lucide-react";
import { WorkloadClient } from "./workload-client";

export default async function WorkloadFitPage() {
  await requireSession();

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Workload Fit Calculator</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-bold text-slate-900">Workload Fit / VRAM Calculator</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl">
          Estimate VRAM requirements for any model size, precision, and workload type.
          Get plain-English GPU recommendations from the Velerity catalog.
        </p>
      </div>

      <WorkloadClient />
    </div>
  );
}
