import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import React from "react";

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
    padding: "48 56 48 56",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoSquare: {
    width: 28,
    height: 28,
    backgroundColor: "#2563eb",
    borderRadius: 4,
  },
  brandName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  brandSub: { fontSize: 8, color: "#94a3b8", marginTop: 2 },
  quoteTitle: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0f172a", textAlign: "right" },
  quoteRef: { fontSize: 8, color: "#94a3b8", textAlign: "right", marginTop: 3 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  metaRow: { flexDirection: "row", gap: 32, marginBottom: 20 },
  metaBlock: { flex: 1 },
  metaValue: { fontSize: 11, color: "#0f172a", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fafafa",
  },
  colDesc: { flex: 5 },
  colCat: { flex: 2 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 2, textAlign: "right" },
  colTotal: { flex: 2, textAlign: "right" },
  headerText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#64748b" },
  cellText: { fontSize: 10, color: "#0f172a" },
  cellMuted: { fontSize: 10, color: "#64748b" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderTopColor: "#0f172a",
    marginTop: 4,
  },
  totalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f172a", marginRight: 16 },
  totalAmount: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#94a3b8" },
  disclaimer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#fef9c3",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  disclaimerText: { fontSize: 8, color: "#713f12", lineHeight: 1.5 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const CAT_LABELS: Record<string, string> = {
  SERVER: "Server",
  GPU_COMPONENT: "GPU Component",
  WARRANTY: "Warranty",
  SHIPPING: "Shipping",
  OTHER: "Other",
};

// ─── PDF Document ─────────────────────────────────────────────────────────────

function QuotePdf({
  deal,
}: {
  deal: {
    id: string;
    title: string;
    account: { name: string };
    lineItems: {
      id: string;
      description: string;
      quantity: number;
      unitPriceUsd: number;
      category: string;
    }[];
    valueUsd: number | null;
  };
}) {
  const total = deal.lineItems.reduce((s, i) => s + i.quantity * i.unitPriceUsd, 0);
  const today = new Date();
  const quoteRef = `Q-${deal.id.slice(-8).toUpperCase()}`;

  return React.createElement(
    Document,
    { title: `Quote – ${deal.title}` },
    React.createElement(
      Page,
      { size: "LETTER", style: s.page },

      // Header
      React.createElement(
        View,
        { style: s.header },
        React.createElement(
          View,
          null,
          React.createElement(
            View,
            { style: s.logoBox },
            React.createElement(View, { style: s.logoSquare }),
            React.createElement(Text, { style: s.brandName }, "Velerity Compute")
          ),
          React.createElement(Text, { style: s.brandSub }, "Certified-Refurbished NVIDIA AI Servers")
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: s.quoteTitle }, "QUOTE"),
          React.createElement(Text, { style: s.quoteRef }, quoteRef),
          React.createElement(Text, { style: s.quoteRef }, fmtDate(today))
        )
      ),

      // Bill-to / deal meta
      React.createElement(
        View,
        { style: s.metaRow },
        React.createElement(
          View,
          { style: s.metaBlock },
          React.createElement(Text, { style: s.sectionLabel }, "Quote for"),
          React.createElement(Text, { style: s.metaValue }, deal.account.name)
        ),
        React.createElement(
          View,
          { style: s.metaBlock },
          React.createElement(Text, { style: s.sectionLabel }, "Project"),
          React.createElement(Text, { style: s.metaValue }, deal.title)
        ),
        React.createElement(
          View,
          { style: s.metaBlock },
          React.createElement(Text, { style: s.sectionLabel }, "Valid through"),
          React.createElement(
            Text,
            { style: s.metaValue },
            fmtDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))
          )
        )
      ),

      // Table header
      React.createElement(
        View,
        { style: s.tableHeader },
        React.createElement(Text, { style: [s.headerText, s.colDesc] }, "DESCRIPTION"),
        React.createElement(Text, { style: [s.headerText, s.colCat] }, "CATEGORY"),
        React.createElement(Text, { style: [s.headerText, s.colQty] }, "QTY"),
        React.createElement(Text, { style: [s.headerText, s.colUnit] }, "UNIT PRICE"),
        React.createElement(Text, { style: [s.headerText, s.colTotal] }, "TOTAL")
      ),

      // Line items
      ...deal.lineItems.map((item, i) =>
        React.createElement(
          View,
          { key: item.id, style: i % 2 === 0 ? s.tableRow : s.tableRowAlt },
          React.createElement(Text, { style: [s.cellText, s.colDesc] }, item.description),
          React.createElement(
            Text,
            { style: [s.cellMuted, s.colCat] },
            CAT_LABELS[item.category] ?? item.category
          ),
          React.createElement(Text, { style: [s.cellText, s.colQty] }, String(item.quantity)),
          React.createElement(Text, { style: [s.cellMuted, s.colUnit] }, usd(item.unitPriceUsd)),
          React.createElement(
            Text,
            { style: [s.cellText, s.colTotal] },
            usd(item.quantity * item.unitPriceUsd)
          )
        )
      ),

      // Total
      React.createElement(
        View,
        { style: s.totalRow },
        React.createElement(Text, { style: s.totalLabel }, "TOTAL"),
        React.createElement(Text, { style: s.totalAmount }, usd(total))
      ),

      // Disclaimer
      React.createElement(
        View,
        { style: s.disclaimer },
        React.createElement(
          Text,
          { style: s.disclaimerText },
          "This quote is for certified-refurbished hardware. All units undergo full hardware diagnostics and certification before shipment. " +
            "This document is for informational purposes only and does not constitute a binding contract. " +
            "Export control and end-user screening must be completed prior to order placement. " +
            "Pricing valid for 30 days from date of issue. Contact your Velerity account representative to proceed."
        )
      ),

      // Footer
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(Text, { style: s.footerText }, "Velerity Compute — Certified-Refurbished NVIDIA AI Servers"),
        React.createElement(Text, { style: s.footerText }, `${quoteRef} · Generated ${fmtDate(today)}`)
      )
    )
  );
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const session = await requireSession();
  const { dealId } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId, orgId: session.orgId },
    include: {
      account: { select: { name: true } },
      lineItems: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!deal) {
    return new NextResponse("Not found", { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(QuotePdf, { deal }) as any);

  const filename = `quote-${deal.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
