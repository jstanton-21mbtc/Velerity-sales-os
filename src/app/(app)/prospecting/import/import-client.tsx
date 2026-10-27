"use client";

import { useState, useRef, useTransition } from "react";
import Papa from "papaparse";
import { importAccountsCsv, type CsvImportRow } from "@/app/(app)/prospecting/actions";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

type ParsedRow = CsvImportRow & { _rowNum: number };
type ImportResult = { imported: number; skipped: number };

// Normalise header → field name (case-insensitive, strips whitespace)
const HEADER_MAP: Record<string, keyof CsvImportRow> = {
  name: "name",
  company: "name",
  "company name": "name",
  domain: "domain",
  website: "website",
  url: "website",
  industry: "industry",
  sector: "industry",
  city: "hqCity",
  hqcity: "hqCity",
  "hq city": "hqCity",
  country: "hqCountry",
  hqcountry: "hqCountry",
  "hq country": "hqCountry",
  notes: "notes",
  note: "notes",
};

export function ImportClient() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError("");
    setResult(null);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`Parse error: ${results.errors[0].message}`);
          return;
        }

        const parsed: ParsedRow[] = [];
        let rowNum = 0;
        for (const raw of results.data) {
          rowNum++;
          const row: Partial<CsvImportRow> = {};
          for (const [rawKey, val] of Object.entries(raw)) {
            const key = HEADER_MAP[rawKey.trim().toLowerCase()];
            if (key && val?.trim()) {
              (row as Record<string, string>)[key] = val.trim();
            }
          }
          if (row.name) {
            parsed.push({ ...row, name: row.name, _rowNum: rowNum });
          }
        }

        if (parsed.length === 0) {
          setParseError(
            'No valid rows found. Ensure the CSV has a "name" or "company" column.'
          );
        } else {
          setRows(parsed);
        }
      },
      error: (err: Error) => {
        setParseError(err.message);
      },
    });
  }

  function handleImport() {
    if (rows.length === 0) return;
    startTransition(async () => {
      const res = await importAccountsCsv(rows.map(({ _rowNum: _r, ...rest }) => rest));
      setResult(res);
    });
  }

  function reset() {
    setRows([]);
    setFileName("");
    setParseError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="max-w-3xl">
      {/* Upload zone */}
      {rows.length === 0 && !result && (
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-12 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-700">Drop a CSV or click to upload</p>
            <p className="text-sm text-slate-400 mt-1">
              Required column: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">name</code>{" "}
              or <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">company</code>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Optional: domain, industry, hqCity, hqCountry, website, notes
            </p>
          </div>
        </label>
      )}

      {/* Parse error */}
      {parseError && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {parseError}
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && !result && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{fileName}</span>
              <span className="text-xs text-slate-400">
                {rows.length} row{rows.length !== 1 ? "s" : ""} ready to import
              </span>
            </div>
            <button onClick={reset} className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Domain</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Industry</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">HQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 10).map((row) => (
                  <tr key={row._rowNum} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.domain ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{row.industry ?? "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {[row.hqCity, row.hqCountry].filter(Boolean).join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-400">
                Showing 10 of {rows.length} rows — all will be imported.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              {isPending ? "Importing…" : `Import ${rows.length} account${rows.length !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h2 className="font-semibold text-emerald-900 text-lg mb-1">Import complete</h2>
          <p className="text-emerald-700 text-sm">
            <strong>{result.imported}</strong> account{result.imported !== 1 ? "s" : ""} imported
            {result.skipped > 0 && (
              <> · <strong>{result.skipped}</strong> skipped (already exist or no name)</>
            )}
          </p>
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Import more
            </button>
            <a
              href="/crm/accounts"
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              View accounts →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
