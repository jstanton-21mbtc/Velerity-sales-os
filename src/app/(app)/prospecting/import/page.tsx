import Link from "next/link";
import { Search, Upload, ChevronRight } from "lucide-react";
import { ImportClient } from "./import-client";

export default function ImportPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <Search className="w-4 h-4" />
        <Link href="/prospecting" className="hover:text-slate-600">Prospecting</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">CSV Import</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">CSV Account Import</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Import a list of prospect accounts from a spreadsheet. Duplicates (same name) are skipped automatically.
        </p>
      </div>

      <ImportClient />
    </div>
  );
}
