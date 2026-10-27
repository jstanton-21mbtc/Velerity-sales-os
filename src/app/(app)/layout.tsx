import { requireSession } from "@/lib/auth";
import { Sidebar } from "@/components/shared/sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar orgName={session.orgName} isSampleData={session.isSampleData} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
