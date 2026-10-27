"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, RotateCcw, ExternalLink, AlertCircle } from "lucide-react";

type Source = { title: string; url: string; score: number };

export function ResearchActions({
  accountId,
  hasBrief,
}: {
  accountId: string;
  hasBrief: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function runResearch() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/research/${accountId}`);
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Research failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={runResearch}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <RotateCcw className="w-4 h-4 animate-spin" />
            Researching…
          </>
        ) : (
          <>
            <FlaskConical className="w-4 h-4" />
            {hasBrief ? "Regenerate brief" : "Generate research brief"}
          </>
        )}
      </button>
      {loading && (
        <p className="text-xs text-slate-500 mt-1.5">
          Searching the web and synthesizing with Claude — this takes ~15 seconds.
        </p>
      )}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

export function BriefContent({
  content,
  sources,
  generatedAt,
}: {
  content: string;
  sources: Source[];
  generatedAt: Date;
}) {
  // Parse ## sections from the markdown-like content
  const sections = content
    .split(/^## /m)
    .filter(Boolean)
    .map((s) => {
      const firstNewline = s.indexOf("\n");
      return {
        heading: s.slice(0, firstNewline).trim(),
        body: s.slice(firstNewline + 1).trim(),
      };
    });

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">
        Generated {new Date(generatedAt).toLocaleString()}
      </p>

      <div className="space-y-5 max-w-2xl">
        {sections.length > 0
          ? sections.map((sec, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-slate-800 mb-1.5 pb-1 border-b border-slate-100">
                  {sec.heading}
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {sec.body}
                </p>
              </div>
            ))
          : (
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
      </div>

      {sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Sources ({sources.length})
          </h3>
          <div className="space-y-1.5">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 group"
              >
                <span className="text-xs text-slate-400 shrink-0 mt-0.5">[{i + 1}]</span>
                <span className="flex items-center gap-1 text-xs text-blue-600 group-hover:underline truncate">
                  {src.title}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
