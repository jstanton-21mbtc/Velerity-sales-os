import { cn } from "@/lib/utils";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/compliance";
import type { DealStage } from "@prisma/client";

export function StageBadge({
  stage,
  size = "sm",
}: {
  stage: DealStage;
  size?: "xs" | "sm";
}) {
  const colors = STAGE_COLORS[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        colors.bg,
        colors.text,
        colors.border,
        size === "xs" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
