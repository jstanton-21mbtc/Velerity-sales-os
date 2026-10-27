import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  supabaseId: string;
  email: string;
  name: string | null;
  role: Role;
  orgId: string;
  orgName: string;
  isSampleData: boolean;
};

/**
 * Returns the current session user with org context.
 * Redirects to /login if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireSession(): Promise<SessionUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { org: { select: { name: true, isSampleData: true } } },
  });

  if (!dbUser) {
    redirect("/login");
  }

  return {
    id: dbUser.id,
    supabaseId: dbUser.supabaseId,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    orgId: dbUser.orgId,
    orgName: dbUser.org.name,
    isSampleData: dbUser.org.isSampleData,
  };
}

/**
 * Requires a minimum role. Throws 403 if role is insufficient.
 */
export async function requireRole(
  minRole: Role
): Promise<SessionUser> {
  const session = await requireSession();
  const order: Role[] = ["REP", "MANAGER", "ADMIN"];
  if (order.indexOf(session.role) < order.indexOf(minRole)) {
    throw new Error("Insufficient permissions");
  }
  return session;
}
