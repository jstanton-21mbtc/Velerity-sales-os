"use client";

import { useState, useTransition } from "react";
import { updateUnitStatus, reserveUnit, releaseUnit } from "@/app/(app)/inventory/actions";
import type { UnitStatus, CertStatus } from "@prisma/client";
import { AlertTriangle } from "lucide-react";

const STATUS_FLOW: UnitStatus[] = [
  "INCOMING",
  "TESTING",
  "CERTIFIED",
  "RESERVED",
  "SOLD",
  "SHIPPED",
];

const CERT_FLOW: CertStatus[] = ["INCOMING", "TESTING", "CERTIFIED", "FAILED"];

type Deal = { id: string; title: string };

export function UnitStatusControls({
  unitId,
  currentStatus,
  currentCertStatus,
  openDeals,
}: {
  unitId: string;
  currentStatus: UnitStatus;
  currentCertStatus: CertStatus;
  openDeals: Deal[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [reserveDealId, setReserveDealId] = useState(openDeals[0]?.id ?? "");

  const statusIdx = STATUS_FLOW.indexOf(currentStatus);
  const nextStatus = statusIdx < STATUS_FLOW.length - 2 ? STATUS_FLOW[statusIdx + 1] : null;

  const certIdx = CERT_FLOW.indexOf(currentCertStatus);
  const nextCert = certIdx < CERT_FLOW.length - 1 ? CERT_FLOW[certIdx + 1] : null;

  function advanceStatus() {
    if (!nextStatus) return;
    setError("");
    startTransition(async () => {
      await updateUnitStatus(
        unitId,
        nextStatus,
        nextStatus === "CERTIFIED" ? "CERTIFIED" : undefined
      );
    });
  }

  function handleReserve() {
    if (!reserveDealId) { setError("Select a deal to reserve against"); return; }
    setError("");
    startTransition(async () => {
      const result = await reserveUnit(unitId, reserveDealId);
      if (!result.ok) setError(result.error ?? "Could not reserve unit");
    });
  }

  function handleRelease(dealId: string) {
    startTransition(async () => {
      await releaseUnit(unitId, dealId);
    });
  }

  return (
    <div className="space-y-4">
      {/* Advance cert/status */}
      {nextStatus && nextStatus !== "RESERVED" && nextStatus !== "SOLD" && nextStatus !== "SHIPPED" && (
        <button
          onClick={advanceStatus}
          disabled={isPending}
          className="w-full px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Updating…" : `Move to ${nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}`}
        </button>
      )}

      {/* Mark sold / shipped */}
      {(currentStatus === "RESERVED" || currentStatus === "CERTIFIED") && (
        <div className="flex gap-2">
          <button
            onClick={() => startTransition(() => updateUnitStatus(unitId, "SOLD"))}
            disabled={isPending}
            className="flex-1 px-3 py-2 text-xs bg-violet-600 hover:bg-violet-500 disabled:bg-slate-200 text-white font-medium rounded-lg transition-colors"
          >
            Mark Sold
          </button>
          <button
            onClick={() => startTransition(() => updateUnitStatus(unitId, "SHIPPED"))}
            disabled={isPending}
            className="flex-1 px-3 py-2 text-xs bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-medium rounded-lg transition-colors"
          >
            Mark Shipped
          </button>
        </div>
      )}

      {/* Reserve against deal */}
      {currentStatus === "CERTIFIED" && openDeals.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1.5">Reserve against deal</p>
          <div className="flex gap-2">
            <select
              value={reserveDealId}
              onChange={(e) => setReserveDealId(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {openDeals.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
            <button
              onClick={handleReserve}
              disabled={isPending}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white font-medium rounded-lg transition-colors"
            >
              Reserve
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

export function ReleaseButton({
  unitId,
  dealId,
  dealTitle,
}: {
  unitId: string;
  dealId: string;
  dealTitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await releaseUnit(unitId, dealId); })}
      disabled={isPending}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Releasing…" : `Release from "${dealTitle}"`}
    </button>
  );
}
