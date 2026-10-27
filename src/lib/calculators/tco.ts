/**
 * TCO Calculator — Four Paths to AI Capacity
 *
 * Pure functions — no DB, no side effects. Fully unit-testable.
 *
 * Compares total cost of ownership over a given period for:
 *   1. Certified refurb (Velerity)
 *   2. Cloud on-demand
 *   3. Cloud 1-year reserved
 *   4. New OEM
 */

export type TcoInput = {
  gpuCount: number;
  utilizationPct: number;      // 0–100; affects cloud on-demand cost
  years: number;               // 1–5

  // Refurb
  refurbTotalUsd: number;      // all-in purchase price
  refurbAnnualSupportPct?: number; // % of purchase for annual support, default 5%

  // Cloud (per GPU per hour)
  cloudOnDemandPerGpuHr: number;
  cloudReservedPerGpuHr: number;  // 1-year reserved rate

  // New OEM (optional; defaults to refurb × 2.3)
  newOemTotalUsd?: number;
};

export type TcoPath = {
  name: string;
  description: string;
  totalCostUsd: number;
  costPerGpuHrEffective: number;
  upfrontUsd: number;
  recurringUsd: number;
  /** Savings vs. cloud on-demand (can be negative if more expensive) */
  savingsVsOnDemand: number;
  /** Percent cheaper vs. cloud on-demand */
  pctCheaperThanOnDemand: number;
  notes: string[];
};

export type TcoResult = {
  paths: TcoPath[];
  totalGpuHours: number;
  utilizationHoursPerYear: number;
};

function roundUsd(n: number): number {
  return Math.round(n);
}

/**
 * Calculate TCO for all four procurement paths.
 */
export function calcTco(input: TcoInput): TcoResult {
  const {
    gpuCount,
    utilizationPct,
    years,
    refurbTotalUsd,
    refurbAnnualSupportPct = 5,
    cloudOnDemandPerGpuHr,
    cloudReservedPerGpuHr,
    newOemTotalUsd,
  } = input;

  const HOURS_PER_YEAR = 8_760;
  const utilizationFraction = utilizationPct / 100;
  const utilizationHoursPerYear = HOURS_PER_YEAR * utilizationFraction;
  const totalUtilHours = utilizationHoursPerYear * years;
  const totalGpuHours = totalUtilHours * gpuCount;
  const totalCalendarHours = HOURS_PER_YEAR * years;
  const totalCalendarGpuHours = totalCalendarHours * gpuCount;

  // ── 1. Certified refurb ────────────────────────────────────────────────────
  const refurbSupport = refurbTotalUsd * (refurbAnnualSupportPct / 100) * years;
  const refurbTotal = refurbTotalUsd + refurbSupport;
  const refurbCostPerGpuHr =
    totalGpuHours > 0 ? refurbTotal / totalGpuHours : 0;

  // ── 2. Cloud on-demand ────────────────────────────────────────────────────
  // You only pay when you use it
  const cloudOnDemandTotal = cloudOnDemandPerGpuHr * totalGpuHours;
  const cloudOnDemandCostPerGpuHr = cloudOnDemandPerGpuHr;

  // ── 3. Cloud 1-yr reserved ───────────────────────────────────────────────
  // Reserved instances charge full calendar hours regardless of utilization
  const cloudReservedTotal = cloudReservedPerGpuHr * totalCalendarGpuHours;
  const cloudReservedCostPerGpuHr =
    totalGpuHours > 0 ? cloudReservedTotal / totalGpuHours : 0;

  // ── 4. New OEM ────────────────────────────────────────────────────────────
  const newOemPrice = newOemTotalUsd ?? refurbTotalUsd * 2.3;
  const newOemSupport = newOemPrice * 0.07 * years; // ~7%/yr OEM support
  const newOemTotal = newOemPrice + newOemSupport;
  const newOemCostPerGpuHr =
    totalGpuHours > 0 ? newOemTotal / totalGpuHours : 0;

  function savings(cost: number): number {
    return roundUsd(cloudOnDemandTotal - cost);
  }
  function pctCheaper(cost: number): number {
    if (cloudOnDemandTotal === 0) return 0;
    return parseFloat((((cloudOnDemandTotal - cost) / cloudOnDemandTotal) * 100).toFixed(1));
  }

  const paths: TcoPath[] = [
    {
      name: "Certified Refurb (Velerity)",
      description: `Purchase ${gpuCount} certified GPU server${gpuCount > 1 ? "s" : ""} outright. ${refurbAnnualSupportPct}% annual support included.`,
      totalCostUsd: roundUsd(refurbTotal),
      costPerGpuHrEffective: parseFloat(refurbCostPerGpuHr.toFixed(4)),
      upfrontUsd: roundUsd(refurbTotalUsd),
      recurringUsd: roundUsd(refurbSupport),
      savingsVsOnDemand: savings(refurbTotal),
      pctCheaperThanOnDemand: pctCheaper(refurbTotal),
      notes: [
        "<5-week lead time vs. 6–9 months for new OEM.",
        "30–60% below new OEM list price.",
        "Full health-cert and warranty. No rental dependency.",
        `Break-even vs. cloud on-demand at ${utilizationPct}% utilization.`,
      ],
    },
    {
      name: "Cloud On-Demand",
      description: `Rent GPUs at ${cloudOnDemandPerGpuHr.toFixed(2)}/GPU/hr, paying only for utilization hours.`,
      totalCostUsd: roundUsd(cloudOnDemandTotal),
      costPerGpuHrEffective: cloudOnDemandCostPerGpuHr,
      upfrontUsd: 0,
      recurringUsd: roundUsd(cloudOnDemandTotal),
      savingsVsOnDemand: 0,
      pctCheaperThanOnDemand: 0,
      notes: [
        "No capex. Pay-as-you-go flexibility.",
        "At >40% sustained utilization, owned hardware is almost always cheaper.",
        "Egress / storage costs not included.",
        "GPU availability not guaranteed during high-demand periods.",
      ],
    },
    {
      name: "Cloud 1-Year Reserved",
      description: `Reserved instance at ${cloudReservedPerGpuHr.toFixed(2)}/GPU/hr. Charged 24/7 regardless of use.`,
      totalCostUsd: roundUsd(cloudReservedTotal),
      costPerGpuHrEffective: parseFloat(cloudReservedCostPerGpuHr.toFixed(4)),
      upfrontUsd: 0,
      recurringUsd: roundUsd(cloudReservedTotal),
      savingsVsOnDemand: savings(cloudReservedTotal),
      pctCheaperThanOnDemand: pctCheaper(cloudReservedTotal),
      notes: [
        "~30% cheaper than on-demand but billed for idle time.",
        `At ${utilizationPct}% utilization, effective rate is $${cloudReservedCostPerGpuHr.toFixed(2)}/GPU/hr.`,
        "Commits to 1-year contract with limited flexibility.",
        "Still 2–4× more expensive than owned refurb at high utilization.",
      ],
    },
    {
      name: "New OEM",
      description: `Purchase new hardware at list price (~${Math.round((newOemPrice / refurbTotalUsd - 1) * 100)}% premium over refurb).`,
      totalCostUsd: roundUsd(newOemTotal),
      costPerGpuHrEffective: parseFloat(newOemCostPerGpuHr.toFixed(4)),
      upfrontUsd: roundUsd(newOemPrice),
      recurringUsd: roundUsd(newOemSupport),
      savingsVsOnDemand: savings(newOemTotal),
      pctCheaperThanOnDemand: pctCheaper(newOemTotal),
      notes: [
        "6–9 month lead times common for high-end HGX/DGX systems.",
        "Full OEM warranty and newest firmware.",
        "2–3× more expensive than certified refurb for equivalent hardware.",
        "Consider if firmware/warranty SLA is a hard requirement.",
      ],
    },
  ];

  return { paths, totalGpuHours, utilizationHoursPerYear };
}

/**
 * Cloud on-demand benchmark rates ($/GPU/hr).
 * Based on major cloud provider (AWS/Azure/GCP) list pricing — the rates
 * enterprise buyers actually pay, not discount-provider spot prices.
 *
 * AWS references:
 *   p4d.24xlarge  (8× A100 40GB SXM4): $32.77/hr → $4.10/GPU/hr
 *   p4de.24xlarge (8× A100 80GB SXM4): $40.96/hr → $5.12/GPU/hr
 *   p5.48xlarge   (8× H100 80GB SXM5): $98.32/hr → $12.29/GPU/hr
 *   H200 (est.):  ~$16–18/GPU/hr
 * Reserved 1-yr ≈ 30% discount off on-demand.
 */
export const CLOUD_BENCHMARKS: Record<
  string,
  { onDemand: number; reserved: number; label: string }
> = {
  a100_40: { onDemand: 4.10, reserved: 2.87, label: "A100 40GB (AWS p4d)" },
  a100_80: { onDemand: 5.12, reserved: 3.58, label: "A100 80GB (AWS p4de)" },
  h100_pcie: { onDemand: 8.50, reserved: 5.95, label: "H100 PCIe" },
  h100_sxm: { onDemand: 12.29, reserved: 8.60, label: "H100 SXM5 (AWS p5)" },
  h200_sxm: { onDemand: 17.00, reserved: 11.90, label: "H200 SXM (est.)" },
};
