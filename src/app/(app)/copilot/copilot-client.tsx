"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, RotateCcw } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTERS: string[] = [
  "What's the difference between H100 SXM and PCIe?",
  "Help me prep for a call with an AI startup doing LLM training.",
  "Draft a cold outreach email for a company that just raised a Series B for AI.",
  "When does cloud GPU rental cost more than owning certified refurb?",
  "Explain Transformer Engine FP8 to a non-technical buyer.",
];

export function CopilotClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    // Add empty assistant placeholder for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Something went wrong — please try again.",
          };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 128) + "px";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Rep Copilot</h2>
                <p className="text-sm text-slate-500">
                  GPU hardware Q&amp;A · call prep · outreach drafts · TCO &amp; VRAM math
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "assistant" ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <div
                  className={`rounded-xl px-4 py-3 max-w-[85%] ${
                    msg.role === "assistant"
                      ? "bg-white border border-slate-200"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {msg.content === "" && isStreaming ? (
                    <span className="flex gap-1 items-center h-5">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${n * 0.15}s` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setInput(""); }}
              title="New conversation"
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors shrink-0 whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              New chat
            </button>
          )}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={handleInput}
            rows={1}
            placeholder="Ask about GPUs, call prep, objections, outreach..."
            className="flex-1 resize-none border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            style={{ minHeight: "42px", maxHeight: "128px" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isStreaming}
            className="flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 rounded-lg transition-colors shrink-0"
          >
            <Send className={`w-4 h-4 ${!input.trim() || isStreaming ? "text-slate-400" : "text-white"}`} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
