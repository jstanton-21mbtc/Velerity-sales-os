import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getClaudeClient, CLAUDE_MODEL } from "@/lib/claude";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { orgId: true },
  });
  if (!dbUser) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as { messages: ChatMessage[] };
  const { messages } = body;

  // Load GPU KB for context (concise summary)
  const gpus = await prisma.gpuSpec.findMany({
    select: {
      name: true,
      generation: true,
      memoryGb: true,
      memoryType: true,
      fp16TflopsStr: true,
      transformerEngine: true,
      migSupport: true,
      bestFor: true,
    },
  });

  const gpuContext = gpus
    .map(
      (g) =>
        `${g.name} (${g.generation}): ${g.memoryGb}GB ${g.memoryType}` +
        (g.fp16TflopsStr ? ` · FP16 ${g.fp16TflopsStr}` : "") +
        (g.transformerEngine ? " · Transformer Engine (FP8)" : "") +
        (g.migSupport ? " · MIG" : "") +
        (g.bestFor ? ` | Best for: ${g.bestFor}` : "")
    )
    .join("\n");

  const systemPrompt = `You are the Velerity Rep Copilot — an AI assistant for sales reps at Velerity Compute, a certified-refurbished NVIDIA AI server reseller.

## GPU Knowledge Base
${gpuContext || "GPU data not loaded — answer from general knowledge."}

## Velerity Value Propositions
- Certified refurbished NVIDIA A100, H100, H200 GPU servers
- 30–60% below new OEM pricing with <5 week lead times (vs 6–9 months new)
- Full diagnostics, Grade A/B/C condition reports, NVIDIA Limited or Seller warranty
- US export-control compliant — EAR/OFAC screening on all international deals

## Four Paths to AI Capacity (Competitive Frame)
1. New OEM — latest specs, full warranty. 6–9 month lead times, 2–3× premium.
2. Cloud GPU rental — zero capex. 3–5× more expensive than owned at >40% utilization.
3. Gray-market/uncertified — low price, no diagnostics, no warranty, compliance risk.
4. Certified refurb (Velerity) — best total value for on-prem AI workloads.

## Your Capabilities
1. Answer GPU hardware Q&A accurately (specs, use cases, interconnects, precision formats, VRAM math)
2. Help reps prep for sales calls — questions to ask, discovery framework, objection handling
3. Draft outreach emails and LinkedIn messages
4. Explain TCO and VRAM calculations in plain language
5. Identify buying signals and ICP fit

## Rules
- Be concise and sales-focused. Use bullets for lists.
- If you are unsure about a spec, say so — never fabricate hardware numbers.
- Cite GPU KB entries by name when referencing specs.`;

  const client = getClaudeClient();

  const stream = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
