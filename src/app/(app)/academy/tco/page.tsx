import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, ChevronRight, BarChart2 } from "lucide-react";
import { TcoClient } from "./tco-client";

export default async function TcoPage() {
  await requireSession();

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>TCO Calculator</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-cyan-600" />
          <h1 className="text-2xl font-bold text-slate-900">TCO Calculator</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl">
          Compare total cost of ownership across all four paths to AI capacity:
          certified refurb, cloud on-demand, cloud reserved, and new OEM.
          Use this to build the financial case with your prospect.
        </p>
      </div>

      <TcoClient />
    </div>
  );
}
