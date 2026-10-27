import { describe, it, expect } from "vitest";
import { calcTco, CLOUD_BENCHMARKS } from "../calculators/tco";

const BASE: Parameters<typeof calcTco>[0] = {
  gpuCount: 8,
  utilizationPct: 70,
  years: 3,
  refurbTotalUsd: 1_200_000,
  cloudOnDemandPerGpuHr: CLOUD_BENCHMARKS.h100_sxm.onDemand,
  cloudReservedPerGpuHr: CLOUD_BENCHMARKS.h100_sxm.reserved,
};

describe("calcTco — basic structure", () => {
  it("returns 4 paths", () => {
    const { paths } = calcTco(BASE);
    expect(paths.length).toBe(4);
  });

  it("all paths have non-negative totalCostUsd", () => {
    const { paths } = calcTco(BASE);
    paths.forEach((p) => expect(p.totalCostUsd).toBeGreaterThan(0));
  });

  it("returns correct totalGpuHours for 8 GPUs × 70% util × 3 years", () => {
    const { totalGpuHours } = calcTco(BASE);
    const expected = 8 * 0.7 * 8760 * 3;
    expect(totalGpuHours).toBeCloseTo(expected, 0);
  });

  it("cloud on-demand savingsVsOnDemand is 0 (baseline)", () => {
    const { paths } = calcTco(BASE);
    const onDemand = paths.find((p) => p.name.includes("On-Demand"))!;
    expect(onDemand.savingsVsOnDemand).toBe(0);
  });

  it("cloud on-demand pctCheaperThanOnDemand is 0", () => {
    const { paths } = calcTco(BASE);
    const onDemand = paths.find((p) => p.name.includes("On-Demand"))!;
    expect(onDemand.pctCheaperThanOnDemand).toBe(0);
  });
});

describe("calcTco — refurb economics", () => {
  it("refurb is cheaper than cloud on-demand at 70% utilization over 3 years", () => {
    const { paths } = calcTco(BASE);
    const refurb = paths.find((p) => p.name.includes("Refurb"))!;
    const onDemand = paths.find((p) => p.name.includes("On-Demand"))!;
    expect(refurb.totalCostUsd).toBeLessThan(onDemand.totalCostUsd);
  });

  it("refurb has positive savingsVsOnDemand at 70% utilization", () => {
    const { paths } = calcTco(BASE);
    const refurb = paths.find((p) => p.name.includes("Refurb"))!;
    expect(refurb.savingsVsOnDemand).toBeGreaterThan(0);
  });

  it("refurb has a non-zero upfront cost", () => {
    const { paths } = calcTco(BASE);
    const refurb = paths.find((p) => p.name.includes("Refurb"))!;
    expect(refurb.upfrontUsd).toBe(BASE.refurbTotalUsd);
  });

  it("refurb support cost equals refurbTotalUsd × supportPct × years", () => {
    const supportPct = 0.05;
    const { paths } = calcTco({ ...BASE, refurbAnnualSupportPct: 5 });
    const refurb = paths.find((p) => p.name.includes("Refurb"))!;
    const expectedSupport = BASE.refurbTotalUsd * supportPct * BASE.years;
    expect(refurb.recurringUsd).toBeCloseTo(expectedSupport, -2);
  });

  it("custom support pct changes recurring cost", () => {
    const r5 = calcTco({ ...BASE, refurbAnnualSupportPct: 5 });
    const r10 = calcTco({ ...BASE, refurbAnnualSupportPct: 10 });
    const refurb5 = r5.paths.find((p) => p.name.includes("Refurb"))!;
    const refurb10 = r10.paths.find((p) => p.name.includes("Refurb"))!;
    expect(refurb10.recurringUsd).toBeGreaterThan(refurb5.recurringUsd);
  });
});

describe("calcTco — cloud paths", () => {
  it("cloud on-demand total = rate × gpuCount × utilHours", () => {
    const { paths, totalGpuHours } = calcTco(BASE);
    const onDemand = paths.find((p) => p.name.includes("On-Demand"))!;
    const expected = BASE.cloudOnDemandPerGpuHr * totalGpuHours;
    expect(onDemand.totalCostUsd).toBeCloseTo(expected, -2);
  });

  it("cloud reserved is cheaper than on-demand (lower rate, but charged 24/7)", () => {
    // At low utilization, reserved can be MORE expensive
    // At high utilization (near 100%), reserved should be cheaper
    const highUtil = calcTco({ ...BASE, utilizationPct: 95 });
    const reserved = highUtil.paths.find((p) => p.name.includes("Reserved"))!;
    const onDemand = highUtil.paths.find((p) => p.name.includes("On-Demand"))!;
    expect(reserved.totalCostUsd).toBeLessThan(onDemand.totalCostUsd);
  });

  it("cloud on-demand has zero upfront cost", () => {
    const { paths } = calcTco(BASE);
    const onDemand = paths.find((p) => p.name.includes("On-Demand"))!;
    expect(onDemand.upfrontUsd).toBe(0);
  });
});

describe("calcTco — new OEM path", () => {
  it("new OEM is more expensive than refurb", () => {
    const { paths } = calcTco(BASE);
    const refurb = paths.find((p) => p.name.includes("Refurb"))!;
    const oem = paths.find((p) => p.name.includes("OEM"))!;
    expect(oem.totalCostUsd).toBeGreaterThan(refurb.totalCostUsd);
  });

  it("custom newOemTotalUsd is used when provided", () => {
    const custom = calcTco({ ...BASE, newOemTotalUsd: 3_000_000 });
    const oem = custom.paths.find((p) => p.name.includes("OEM"))!;
    expect(oem.upfrontUsd).toBe(3_000_000);
  });

  it("default OEM price is ~2.3× refurb", () => {
    const { paths } = calcTco(BASE);
    const oem = paths.find((p) => p.name.includes("OEM"))!;
    expect(oem.upfrontUsd).toBeCloseTo(BASE.refurbTotalUsd * 2.3, -3);
  });
});

describe("calcTco — edge cases", () => {
  it("1 GPU, 1 year still produces 4 paths", () => {
    const { paths } = calcTco({ ...BASE, gpuCount: 1, years: 1 });
    expect(paths.length).toBe(4);
  });

  it("100% utilization produces higher cloud on-demand cost than 50%", () => {
    const full = calcTco({ ...BASE, utilizationPct: 100 });
    const half = calcTco({ ...BASE, utilizationPct: 50 });
    const fullDemand = full.paths.find((p) => p.name.includes("On-Demand"))!;
    const halfDemand = half.paths.find((p) => p.name.includes("On-Demand"))!;
    expect(fullDemand.totalCostUsd).toBeGreaterThan(halfDemand.totalCostUsd);
  });

  it("all paths have non-empty notes arrays", () => {
    const { paths } = calcTco(BASE);
    paths.forEach((p) => expect(p.notes.length).toBeGreaterThan(0));
  });

  it("CLOUD_BENCHMARKS has entries for A100 and H100", () => {
    expect(CLOUD_BENCHMARKS.a100_80).toBeDefined();
    expect(CLOUD_BENCHMARKS.h100_sxm).toBeDefined();
    expect(CLOUD_BENCHMARKS.h100_sxm.onDemand).toBeGreaterThan(0);
  });
});
