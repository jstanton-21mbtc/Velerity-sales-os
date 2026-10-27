import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { supabaseId, email, name, orgName } = await request.json();

    if (!supabaseId || !email || !orgName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = slugify(orgName);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Create org + admin user in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const org = await tx.organization.create({
        data: { name: orgName, slug },
      });

      await tx.user.create({
        data: {
          supabaseId,
          email,
          name: name || null,
          role: "ADMIN",
          orgId: org.id,
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
