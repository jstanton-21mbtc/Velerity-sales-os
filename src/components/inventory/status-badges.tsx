import { cn } from "@/lib/utils";
import type { UnitStatus, CertStatus, ConditionGrade, SupplierStatus } from "@prisma/client";

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const styles: Record<UnitStatus, string> = {
    INCOMING: "bg-slate-100 text-slate-600 border-slate-200",
    TESTING: "bg-amber-50 text-amber-700 border-amber-200",
    CERTIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RESERVED: "bg-blue-50 text-blue-700 border-blue-200",
    SOLD: "bg-violet-50 text-violet-700 border-violet-200",
    SHIPPED: "bg-teal-50 text-teal-700 border-teal-200",
  };
  const labels: Record<UnitStatus, string> = {
    INCOMING: "Incoming",
    TESTING: "Testing",
    CERTIFIED: "Certified",
    RESERVED: "Reserved",
    SOLD: "Sold",
    SHIPPED: "Shipped",
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function CertBadge({ status }: { status: CertStatus }) {
  const styles: Record<CertStatus, string> = {
    INCOMING: "bg-slate-100 text-slate-500",
    TESTING: "bg-amber-50 text-amber-600",
    CERTIFIED: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-600",
  };
  const labels: Record<CertStatus, string> = {
    INCOMING: "Not started",
    TESTING: "In testing",
    CERTIFIED: "Certified",
    FAILED: "Failed",
  };
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function GradeBadge({ grade }: { grade: ConditionGrade }) {
  const styles: Record<ConditionGrade, string> = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", styles[grade])}>
      Grade {grade}
    </span>
  );
}

export function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
  const styles: Record<SupplierStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DISQUALIFIED: "bg-red-50 text-red-600 border-red-200",
  };
  const labels: Record<SupplierStatus, string> = {
    PENDING: "Pending",
    QUALIFIED: "Qualified",
    DISQUALIFIED: "Disqualified",
  };
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", styles[status])}>
      {labels[status]}
    </span>
  );
}
