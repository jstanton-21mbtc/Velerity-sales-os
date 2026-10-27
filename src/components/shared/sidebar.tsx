"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  Search,
  Bot,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Server Academy",
    href: "/academy",
    icon: BookOpen,
    children: [
      { label: "GPU Reference", href: "/academy/gpus" },
      { label: "Platform Catalog", href: "/academy/platforms" },
      { label: "Compare", href: "/academy/compare" },
      { label: "Objection Library", href: "/academy/objections" },
      { label: "TCO Calculator", href: "/academy/tco" },
      { label: "Workload Fit", href: "/academy/workload-fit" },
      { label: "Training", href: "/academy/training" },
    ],
  },
  {
    label: "CRM",
    href: "/crm",
    icon: Users,
    children: [
      { label: "Pipeline", href: "/crm/pipeline" },
      { label: "Accounts", href: "/crm/accounts" },
      { label: "Contacts", href: "/crm/contacts" },
      { label: "Deals", href: "/crm/deals" },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    children: [
      { label: "All units", href: "/inventory" },
      { label: "Suppliers", href: "/inventory/suppliers" },
    ],
  },
  {
    label: "Prospecting",
    href: "/prospecting",
    icon: Search,
    children: [
      { label: "ICP Segments", href: "/prospecting/icp" },
      { label: "Buying Signals", href: "/prospecting/signals" },
      { label: "AI Research", href: "/prospecting/research" },
      { label: "CSV Import", href: "/prospecting/import" },
    ],
  },
  { label: "Rep Copilot", href: "/copilot", icon: Bot },
];

export function Sidebar({ orgName, isSampleData }: { orgName: string; isSampleData: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(["Server Academy", "CRM", "Inventory", "Prospecting"]);

  function toggle(label: string) {
    setExpanded((e) =>
      e.includes(label) ? e.filter((x) => x !== label) : [...e, label]
    );
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 14 L2 7 L6 4 L6 11 Z" fill="white" opacity="0.9" />
            <path d="M7 14 L7 5 L11 2 L11 11 Z" fill="white" />
            <path d="M12 14 L12 8 L16 5 L16 14 Z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold leading-tight truncate">
            Velerity Sales OS
          </p>
          <p className="text-slate-500 text-xs truncate">{orgName}</p>
        </div>
      </div>

      {/* Sample data banner */}
      {isSampleData && (
        <div className="mx-3 mt-3 px-3 py-1.5 bg-amber-950/60 border border-amber-800/60 rounded-lg">
          <p className="text-amber-400 text-xs font-medium">Sample data</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isExpanded = expanded.includes(item.label);

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l border-slate-800 pl-3">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-2 py-1.5 rounded-md text-xs transition-colors",
                            childActive
                              ? "text-blue-400 font-medium"
                              : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-800 p-2 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
