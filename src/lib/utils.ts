import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const DEAL_STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  DISCOVERY: "Discovery",
  WORKLOAD_QUALIFIED: "Workload Qualified",
  BUYER_COMPLIANCE_SCREENING: "Compliance Screening",
  CONFIGURATION_QUOTE: "Configuration & Quote",
  DOCUMENTATION_REVIEW: "Documentation Review",
  PO_CONTRACT: "PO / Contract",
  FULFILLMENT: "Fulfillment",
  DEPLOYED_EXPANSION: "Deployed / Expansion",
  CLOSED_LOST: "Closed Lost",
};

export const GPU_GENERATION_LABELS: Record<string, string> = {
  A100: "A100",
  H100: "H100",
  H200: "H200",
  OTHER: "Other",
};
