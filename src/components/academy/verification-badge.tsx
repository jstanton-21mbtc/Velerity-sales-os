import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationBadge({
  verified,
  sourceUrl,
  size = "sm",
}: {
  verified: boolean;
  sourceUrl?: string | null;
  size?: "sm" | "xs";
}) {
  if (verified) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full font-medium",
          size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
        )}
        title={sourceUrl ?? "Verified spec"}
      >
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded-full font-medium",
        size === "xs" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"
      )}
      title="Spec not yet verified against official source"
    >
      <AlertCircle className="w-3 h-3" />
      Unverified
    </span>
  );
}
