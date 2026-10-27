import { requireSession } from "@/lib/auth";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await requireSession();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="mt-6 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Your Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="text-slate-900">{session.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-900">{session.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Role</span>
              <span className="text-slate-900">{session.role}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Organization</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name</span>
              <span className="text-slate-900">{session.orgName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Org ID</span>
              <span className="text-slate-400 font-mono text-xs">{session.orgId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
