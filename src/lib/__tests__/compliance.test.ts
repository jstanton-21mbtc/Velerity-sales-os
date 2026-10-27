import { describe, it, expect } from "vitest";
import { checkComplianceGate } from "@/lib/compliance";
import type { DealStage } from "@prisma/client";

const compliantDeal = {
  stage: "BUYER_COMPLIANCE_SCREENING" as DealStage,
  complianceReviewedById: "user-123",
  complianceReviewedAt: new Date("2026-01-15"),
  complianceNotes: "Buyer is US domestic, no restricted parties found.",
};

const incompliantDeal = {
  stage: "BUYER_COMPLIANCE_SCREENING" as DealStage,
  complianceReviewedById: null,
  complianceReviewedAt: null,
  complianceNotes: null,
};

describe("checkComplianceGate", () => {
  // ── Gate applies ──────────────────────────────────────────────────
  it("blocks advance from BUYER_COMPLIANCE_SCREENING → CONFIGURATION_QUOTE when compliance fields are missing", () => {
    const result = checkComplianceGate(incompliantDeal, "CONFIGURATION_QUOTE");
    expect(result.ok).toBe(false);
  });

  it("blocks when reviewer is missing but date and notes are present", () => {
    const result = checkComplianceGate(
      { ...compliantDeal, complianceReviewedById: null },
      "CONFIGURATION_QUOTE"
    );
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toMatch(/reviewer/i);
  });

  it("blocks when review date is missing", () => {
    const result = checkComplianceGate(
      { ...compliantDeal, complianceReviewedAt: null },
      "CONFIGURATION_QUOTE"
    );
    expect(result.ok).toBe(false);
  });

  it("blocks when compliance notes are too short (< 10 chars)", () => {
    const result = checkComplianceGate(
      { ...compliantDeal, complianceNotes: "Short" },
      "CONFIGURATION_QUOTE"
    );
    expect(result.ok).toBe(false);
    expect((result as { ok: false; error: string }).error).toMatch(/10 character/i);
  });

  it("blocks advance to DOCUMENTATION_REVIEW without compliance", () => {
    const result = checkComplianceGate(incompliantDeal, "DOCUMENTATION_REVIEW");
    expect(result.ok).toBe(false);
  });

  it("blocks advance to PO_CONTRACT without compliance", () => {
    const result = checkComplianceGate(incompliantDeal, "PO_CONTRACT");
    expect(result.ok).toBe(false);
  });

  // ── Gate passes ───────────────────────────────────────────────────
  it("allows advance when all compliance fields are present", () => {
    const result = checkComplianceGate(compliantDeal, "CONFIGURATION_QUOTE");
    expect(result.ok).toBe(true);
  });

  it("allows advance to FULFILLMENT with compliance complete", () => {
    const result = checkComplianceGate(compliantDeal, "FULFILLMENT");
    expect(result.ok).toBe(true);
  });

  // ── Gate does NOT apply to earlier stages ─────────────────────────
  it("does not gate moves between early stages", () => {
    const earlyDeal = {
      stage: "DISCOVERY" as DealStage,
      complianceReviewedById: null,
      complianceReviewedAt: null,
      complianceNotes: null,
    };
    expect(checkComplianceGate(earlyDeal, "WORKLOAD_QUALIFIED").ok).toBe(true);
    expect(checkComplianceGate(earlyDeal, "BUYER_COMPLIANCE_SCREENING").ok).toBe(true);
  });

  it("does not gate moves backward (CONFIGURATION_QUOTE → DISCOVERY)", () => {
    const laterDeal = {
      stage: "CONFIGURATION_QUOTE" as DealStage,
      complianceReviewedById: null,
      complianceReviewedAt: null,
      complianceNotes: null,
    };
    expect(checkComplianceGate(laterDeal, "DISCOVERY").ok).toBe(true);
  });

  it("does not gate CLOSED_LOST from compliance stage", () => {
    const result = checkComplianceGate(incompliantDeal, "CLOSED_LOST");
    expect(result.ok).toBe(true);
  });
});
