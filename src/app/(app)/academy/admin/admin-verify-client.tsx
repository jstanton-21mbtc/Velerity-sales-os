"use client";

import { useState, useTransition } from "react";
import { verifyGpuSpec, verifyPlatformSpec, updateGpuSpec, updatePlatformSpec } from "./actions";
import { CheckCircle, ExternalLink, Edit2, X, Save } from "lucide-react";
import type { GpuSpec, PlatformSpec } from "@prisma/client";

type Tab = "gpu" | "platform";

export function AdminVerifyClient({
  unverifiedGpus,
  unverifiedPlatforms,
  currentUserId,
}: {
  unverifiedGpus: GpuSpec[];
  unverifiedPlatforms: PlatformSpec[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<Tab>("gpu");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSourceUrl, setEditSourceUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  function startEdit(id: string, currentUrl: string | null) {
    setEditingId(id);
    setEditSourceUrl(currentUrl ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditSourceUrl("");
  }

  function handleVerifyGpu(id: string, sourceUrl: string) {
    startTransition(async () => {
      await verifyGpuSpec({ id, sourceUrl, verifiedById: currentUserId });
      cancelEdit();
    });
  }

  function handleVerifyPlatform(id: string, sourceUrl: string) {
    startTransition(async () => {
      await verifyPlatformSpec({ id, sourceUrl, verifiedById: currentUserId });
      cancelEdit();
    });
  }

  function handleSaveGpuUrl(id: string) {
    startTransition(async () => {
      await updateGpuSpec({ id, sourceUrl: editSourceUrl });
      cancelEdit();
    });
  }

  function handleSavePlatformUrl(id: string) {
    startTransition(async () => {
      await updatePlatformSpec({ id, sourceUrl: editSourceUrl });
      cancelEdit();
    });
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        <TabBtn active={tab === "gpu"} onClick={() => setTab("gpu")}>
          GPU Specs ({unverifiedGpus.length})
        </TabBtn>
        <TabBtn active={tab === "platform"} onClick={() => setTab("platform")}>
          Platform Specs ({unverifiedPlatforms.length})
        </TabBtn>
      </div>

      {tab === "gpu" && (
        <SpecList
          items={unverifiedGpus}
          type="gpu"
          editingId={editingId}
          editSourceUrl={editSourceUrl}
          isPending={isPending}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onUrlChange={setEditSourceUrl}
          onSaveUrl={handleSaveGpuUrl}
          onVerify={handleVerifyGpu}
          getName={(item) => (item as GpuSpec).name}
          getSub={(item) => (item as GpuSpec).variant}
        />
      )}

      {tab === "platform" && (
        <SpecList
          items={unverifiedPlatforms}
          type="platform"
          editingId={editingId}
          editSourceUrl={editSourceUrl}
          isPending={isPending}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onUrlChange={setEditSourceUrl}
          onSaveUrl={handleSavePlatformUrl}
          onVerify={handleVerifyPlatform}
          getName={(item) => (item as PlatformSpec).name}
          getSub={(item) => (item as PlatformSpec).oem}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function SpecList({
  items,
  type,
  editingId,
  editSourceUrl,
  isPending,
  onStartEdit,
  onCancelEdit,
  onUrlChange,
  onSaveUrl,
  onVerify,
  getName,
  getSub,
}: {
  items: (GpuSpec | PlatformSpec)[];
  type: "gpu" | "platform";
  editingId: string | null;
  editSourceUrl: string;
  isPending: boolean;
  onStartEdit: (id: string, url: string | null) => void;
  onCancelEdit: () => void;
  onUrlChange: (url: string) => void;
  onSaveUrl: (id: string) => void;
  onVerify: (id: string, url: string) => void;
  getName: (item: GpuSpec | PlatformSpec) => string;
  getSub: (item: GpuSpec | PlatformSpec) => string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
        <CheckCircle className="w-4 h-4 mr-2" />
        All {type === "gpu" ? "GPU" : "platform"} specs verified
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        return (
          <div
            key={item.id}
            className="bg-white border border-amber-200 rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-900">{getName(item)}</p>
                <p className="text-slate-500 text-sm">{getSub(item)}</p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                Unverified
              </span>
            </div>

            {/* Source URL */}
            {isEditing ? (
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={editSourceUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  placeholder="https://www.nvidia.com/en-us/data-center/..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => onSaveUrl(item.id)}
                  disabled={isPending}
                  className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  title="Save URL"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3">
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {item.sourceUrl.length > 60
                      ? item.sourceUrl.slice(0, 60) + "…"
                      : item.sourceUrl}
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm italic">No source URL</span>
                )}
                <button
                  onClick={() => onStartEdit(item.id, item.sourceUrl)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Edit source URL"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Verify button */}
            <button
              onClick={() => onVerify(item.id, item.sourceUrl ?? "")}
              disabled={isPending || !item.sourceUrl}
              title={!item.sourceUrl ? "Add a source URL before verifying" : ""}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark verified
            </button>
          </div>
        );
      })}
    </div>
  );
}
