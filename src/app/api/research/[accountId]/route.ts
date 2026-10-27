import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { tavilySearch } from "@/lib/tavily";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  // Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, orgId: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId } = await params;

  const account = await prisma.crmAccount.findUnique({
    where: { id: accountId, orgId: dbUser.orgId },
  });
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // Build search queries
  const queries = [
    `${account.name} AI machine learning GPU data center`,
    `${account.name} company news funding expansion 2024 2025`,
    `${account.name} ${account.industry ?? "technology"} infrastructure hiring`,
  ];

  const searchResults = await Promise.allSettled(
    queries.map((q) => tavilySearch(q, { maxResults: 3, searchDepth: "basic" }))
  );

  const allResults = searchResults.flatMap((r) =>
    r.status === "fulfilled" ? r.value.results : []
  );

  // Deduplicate by URL
  const seen = new Set<string>();
  const uniqueResults = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  const sourcesText = uniqueResults
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 400)}`)
    .join("\n\n---\n\n");

  const systemPrompt = `You are a sales intelligence analyst for Velerity Compute, a certified-refurbished NVIDIA AI server reseller.
Synthesize web search results into a structured account research brief for a sales rep.

RULES:
- NEVER fabricate contact names, emails, titles, or funding figures not in the sources
- If information is absent, write "Not found in sources"
- Cite sources by number [1], [2], etc. when referencing facts
- Keep tone factual and sales-focused`;

  const userPrompt = `Company: ${account.name}
Domain: ${account.domain ?? "unknown"}
Industry: ${account.industry ?? "unknown"}
HQ: ${[account.hqCity, account.hqCountry].filter(Boolean).join(", ") || "unknown"}

Search results:
${sourcesText || "No search results returned."}

Write a structured brief with these exact sections:

## Company Overview
2–3 sentences: what they do, scale, market position.

## AI / GPU Signals
Evidence of AI workloads, data center activity, ML hiring, or compute needs. Cite sources. If none, say so.

## Recent News & Events
Funding rounds, expansions, product launches. Cite sources. If none found, say so.

## Buying Triggers
Why they may need GPU capacity now — connect the dots from signals above.

## Suggested Outreach Angle
One specific opening line or angle for cold outreach, based on the evidence.

## Caveats
What we don't know; what to verify before the first call.`;

  const client = getClaudeClient();
  const msg = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1200,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content =
    msg.content[0].type === "text" ? msg.content[0].text : "";

  const sources = uniqueResults.map((r) => ({
    title: r.title,
    url: r.url,
    score: r.score,
  }));

  const brief = await prisma.accountBrief.create({
    data: {
      orgId: dbUser.orgId,
      accountId: account.id,
      generatedById: dbUser.id,
      content,
      sources,
    },
  });

  return NextResponse.json({ brief });
}
