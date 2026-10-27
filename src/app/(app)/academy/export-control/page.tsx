import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { BookOpen, ChevronRight, AlertTriangle, ShieldCheck, Flag, XCircle, HelpCircle } from "lucide-react";

export default async function ExportControlPage() {
  await requireSession();

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Export Control Primer</span>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h1 className="text-2xl font-bold text-slate-900">Export Control Primer</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
          <p className="text-sm text-amber-800">
            <strong>This is informational only — not legal advice.</strong> Export control is a complex
            legal area. Always involve qualified counsel and your compliance team before completing a transaction
            involving controlled hardware.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Why are advanced GPUs export-controlled?
          </h2>
          <p>
            High-performance NVIDIA GPUs — particularly H100, H200, and A100 — appear on the
            US Commerce Control List (CCL) under Export Control Classification Numbers (ECCNs)
            related to "digital computers" with very high aggregate data rates. The US Bureau of
            Industry and Security (BIS) restricts their export to certain destinations and end users
            because of their dual-use nature: they can accelerate AI research for civilian purposes
            or be used in military AI, advanced missile guidance, or weapons development programs.
          </p>
          <p className="mt-3">
            NVIDIA's own export compliance imposes chip-level controls via firmware (the "BF16+FP8
            performance cap" for certain geographies). Resellers inheriting these GPUs must conduct
            their own independent due diligence — the hardware restrictions don't transfer the legal
            compliance burden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Red flags — always escalate
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl divide-y divide-red-100">
            {[
              ["Buyer is in or ships to a restricted country", "Comprehensive embargoes: Cuba, Iran, North Korea, Syria, Russia, Belarus. Also many additional countries for high-perf computing."],
              ["End-use is military, nuclear, or missile-related", "Any indication the hardware will support weapons programs or military AI is a hard stop."],
              ["Buyer is on a denied-party list", "Check OFAC SDN, BIS Denied Persons, BIS Entity List, EU sanctions, and UN sanctions lists."],
              ["Unusual routing or re-export request", "Requests to ship to a third country intermediary are a classic diversion tactic."],
              ["Payment via unusual channels (crypto, bearer instruments)", "Doesn't fit standard B2B payment and may indicate sanctions evasion."],
              ["Buyer refuses to state end-use or end-user", "Legitimate buyers always provide these. Refusal is an automatic red flag."],
            ].map(([flag, detail]) => (
              <div key={flag} className="px-4 py-3">
                <p className="font-semibold text-red-900 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  {flag}
                </p>
                <p className="text-xs text-red-700 mt-0.5 ml-5">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            What a compliant deal looks like
          </h2>
          <div className="space-y-3">
            {[
              ["Buyer is a US-domestic or allied-country entity", "US, EU, UK, Japan, Australia, South Korea, Taiwan are generally lower-risk. Document the buyer's legal domicile."],
              ["End-use is clearly commercial AI/ML", "Training models, inference serving, research — document in the deal file."],
              ["Denied-party screening completed", "Run buyer and all known beneficial owners through OFAC, BIS, and EU lists. Use a commercial screening service for scale."],
              ["No red flags in the order details", "No unusual routing, payment, or end-use indicators."],
              ["Compliance notes recorded in the deal", "In Velerity Sales OS, the BUYER_COMPLIANCE_SCREENING stage requires a reviewer, date, and written notes before the deal can advance."],
            ].map(([label, detail]) => (
              <div key={label} className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">{label}</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-500" />
            DC Readiness Checklist
          </h2>
          <p className="mb-4 text-slate-600">
            Before confirming a delivery date, verify the buyer's data center can accept the hardware.
            These are the most common deal-delaying issues.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {[
              ["Power capacity", "Each 8-GPU HGX/DGX node draws 10–16 kW. Confirm available PDU capacity, breaker ratings, and redundant power feeds (A+B)."],
              ["Cooling", "High-density AI servers require 25–40 kW/rack cooling capacity. Confirm CRAC/CRAH units, hot-aisle containment, or liquid cooling (direct liquid or rear-door HX)."],
              ["Floor loading", "Full DGX H100 weighs ~134 kg. Raised floor must support ≥1,200 kg/m² live load."],
              ["Rack space and depth", "Confirm U-space availability and rack depth ≥1,000 mm. Note cable management space."],
              ["Networking fabric", "Confirm InfiniBand (NDR 400Gb/s for H100/H200) or RoCE switch availability, SFP/QSFP port counts, and cabling."],
              ["Delivery access", "Server dimensions and weight require freight elevator or loading dock. Confirm building access and delivery window."],
              ["Lead time to readiness", "Buyer must confirm site-ready date before order confirmation. Delays post-order can trigger contract complications."],
            ].map(([label, detail]) => (
              <div key={label} className="px-4 py-3 flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-slate-300 rounded shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Resources</p>
          <ul className="space-y-1">
            <li>BIS Export Administration Regulations (EAR): <span className="font-mono">ecfr.gov → Title 15, Part 730–774</span></li>
            <li>OFAC Sanctions Lists: <span className="font-mono">ofac.treas.gov/sanctions-list-service</span></li>
            <li>BIS Consolidated Screening List: <span className="font-mono">trade.gov/consolidated-screening-list</span></li>
            <li>NVIDIA Export Compliance: <span className="font-mono">nvidia.com/en-us/about-nvidia/export-compliance</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
