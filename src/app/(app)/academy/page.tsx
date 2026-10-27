import Link from "next/link";
import { BookOpen, Cpu, Server, BarChart2, ShieldCheck, Scale, GraduationCap, AlertTriangle } from "lucide-react";

const SECTIONS = [
  {
    href: "/academy/gpus",
    icon: Cpu,
    title: "GPU Reference",
    description: "Detailed specs for A100, H100, and H200 generations — memory, compute throughput, interconnects, MIG, and workload fit.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    href: "/academy/platforms",
    icon: Server,
    title: "Platform Catalog",
    description: "8-GPU HGX and DGX systems from NVIDIA, Dell, HPE, Supermicro, Lenovo, Gigabyte, and ASUS — form factor, networking, power, and cooling.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    href: "/academy/compare",
    icon: Scale,
    title: "Compare",
    description: "Side-by-side comparison for up to 4 GPUs or platforms. Export and share with prospects.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    href: "/academy/workload-fit",
    icon: BarChart2,
    title: "Workload Fit Calculator",
    description: "Enter model size, precision, and workload type. Get VRAM requirements and GPU recommendations with plain-English reasoning.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    href: "/academy/tco",
    icon: BarChart2,
    title: "TCO Calculator",
    description: "Compare total cost of ownership: certified refurb vs. cloud on-demand vs. reserved cloud vs. new OEM.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  {
    href: "/academy/objections",
    icon: ShieldCheck,
    title: "Objection Library",
    description: "Responses to every common objection — cloud alternatives, waiting for Blackwell, refurb risk, lower broker quotes.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  {
    href: "/academy/training",
    icon: GraduationCap,
    title: "Rep Training",
    description: "Flashcards, quizzes, and a certification path. Track your progress and sharpen your hardware fluency.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    href: "/academy/export-control",
    icon: AlertTriangle,
    title: "Export Control Primer",
    description: "Why advanced GPUs are controlled, why buyer screening matters, and red flags to escalate. Not legal advice.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

export default function AcademyPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Server Academy</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Server Academy</h1>
        <p className="text-slate-500 mt-1 max-w-2xl">
          Everything you need to become fluent in certified-refurbished AI infrastructure —
          specs, calculators, objection responses, and training.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`block bg-white border ${section.border} rounded-xl p-6 hover:shadow-md transition-all group`}
          >
            <div className={`w-10 h-10 ${section.bg} rounded-lg flex items-center justify-center mb-4`}>
              <section.icon className={`w-5 h-5 ${section.color}`} />
            </div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
              {section.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
