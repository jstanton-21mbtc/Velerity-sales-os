import type { DealStage } from "@prisma/client";

/**
 * Pure compliance gate check — no DB access, fully testable.
 *
 * A deal cannot advance from BUYER_COMPLIANCE_SCREENING into any later stage
 * unless all three compliance fields are present.
 */
export function checkComplianceGate(
  deal: {
    stage: DealStage;
    complianceReviewedById: string | null;
    complianceReviewedAt: Date | null;
    complianceNotes: string | null;
  },
  nextStage: DealStage
): { ok: true } | { ok: false; error: string } {
  const POST_COMPLIANCE_STAGES: DealStage[] = [
    "CONFIGURATION_QUOTE",
    "DOCUMENTATION_REVIEW",
    "PO_CONTRACT",
    "FULFILLMENT",
    "DEPLOYED_EXPANSION",
  ];

  const isAdvancingPastCompliance =
    deal.stage === "BUYER_COMPLIANCE_SCREENING" &&
    POST_COMPLIANCE_STAGES.includes(nextStage);

  if (!isAdvancingPastCompliance) return { ok: true };

  if (!deal.complianceReviewedById) {
    return { ok: false, error: "A compliance reviewer must be assigned before advancing." };
  }
  if (!deal.complianceReviewedAt) {
    return { ok: false, error: "Compliance review date is required." };
  }
  if (!deal.complianceNotes || deal.complianceNotes.trim().length < 10) {
    return { ok: false, error: "Compliance notes are required (minimum 10 characters)." };
  }

  return { ok: true };
}

/**
 * Ordered list of stages for forward/backward movement.
 */
export const STAGE_ORDER: DealStage[] = [
  "PROSPECT",
  "DISCOVERY",
  "WORKLOAD_QUALIFIED",
  "BUYER_COMPLIANCE_SCREENING",
  "CONFIGURATION_QUOTE",
  "DOCUMENTATION_REVIEW",
  "PO_CONTRACT",
  "FULFILLMENT",
  "DEPLOYED_EXPANSION",
];

export const STAGE_LABELS: Record<DealStage, string> = {
  PROSPECT: "Prospect",
  DISCOVERY: "Discovery",
  WORKLOAD_QUALIFIED: "Workload Qualified",
  BUYER_COMPLIANCE_SCREENING: "Compliance Screening",
  CONFIGURATION_QUOTE: "Config & Quote",
  DOCUMENTATION_REVIEW: "Docs Review",
  PO_CONTRACT: "PO / Contract",
  FULFILLMENT: "Fulfillment",
  DEPLOYED_EXPANSION: "Deployed / Expansion",
  CLOSED_LOST: "Closed Lost",
};

export const STAGE_COLORS: Record<DealStage, { bg: string; text: string; border: string }> = {
  PROSPECT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  DISCOVERY: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  WORKLOAD_QUALIFIED: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  BUYER_COMPLIANCE_SCREENING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  CONFIGURATION_QUOTE: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  DOCUMENTATION_REVIEW: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  PO_CONTRACT: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  FULFILLMENT: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  DEPLOYED_EXPANSION: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  CLOSED_LOST: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};
