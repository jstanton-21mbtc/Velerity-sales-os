"use client";

import { useState } from "react";
import { calcVram, BYTES_PER_PARAM } from "@/lib/calculators/vram";
import type { Precision, WorkloadType, VramResult } from "@/lib/calculators/vram";
import { BarChart2, Info, Cpu, AlertTriangle } from "lucide-react";

const PRECISION_OPTIONS: { value: Precision; label: string; desc: string }[] = [
  { value: "FP32", label: "FP32", desc: "Full precision. Training baseline." },
  { value: "FP16", label: "FP16", desc: "Mixed-precision training. 2× throughput." },
  { value: "BF16", label: "BF16", desc: "Preferred for LLMs. Stable range." },
  { value: "FP8", label: "FP8", desc: "Hopper+. 2× vs FP16. Transformer Engine." },
  { value: "INT8", label: "INT8", desc: "Quantized inference. Needs calibration." },
];

const WORKLOAD_OPTIONS: { value: WorkloadType; label: string; desc: string }[] = [
  { value: "inference", label: "Inference", desc: "Serving a trained model" },
  { value: "training", label: "Training", desc: "Full pre-training from scratch" },
  { value: "fine-tuning", label: "Fine-Tuning", desc: "LoRA / PEFT on a pre-trained model" },
];

const PRESET_MODELS = [
  { label: "GPT-2 (1.5B)", params: 1.5 },
  { label: "LLaMA 3 8B", params: 8 },
  { label: "LLaMA 3 70B", params: 70 },
  { label: "LLaMA 3.1 405B", params: 405 },
  { label: "Mistral 7B", params: 7 },
  { label: "Mixtral 8×7B (~47B active)", params: 47 },
  { label: "Falcon 180B", params: 180 },
  { label: "Custom", params: null },
];

function GbBar({ gb, maxGb }: { gb: number; maxGb: number }) {
  const pct = Math.min((gb / maxGb) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 w-16 text-right">{gb.toFixed(1)} GB</span>
    </div>
  );
}

export function WorkloadClient() {
  const [modelParams, setModelParams] = useState("7");
  const [preset, setPreset] = useState("Mistral 7B");
  const [precision, setPrecision] = useState<Precision>("FP16");
  const [workload, setWorkload] = useState<WorkloadType>("inference");
  const [batchSize, setBatchSize] = useState("1");
  const [seqLen, setSeqLen] = useState("2048");
  const [checkpointing, setCheckpointing] = useState(false);
  const [result, setResult] = useState<VramResult | null>(null);

  function handlePreset(label: string, params: number | null) {
    setPreset(label);
    if (params !== null) setModelParams(String(params));
  }

  function calculate() {
    const params = parseFloat(modelParams);
    if (!params || params <= 0) return;
    const r = calcVram({
      modelParamsB: params,
      precision,
      workload,
      batchSize: parseInt(batchSize) || 1,
      seqLen: parseInt(seqLen) || 2048,
      activationCheckpointing: checkpointing,
    });
    setResult(r);
  }

  const maxBreakdownGb = result
    ? Math.max(...result.breakdown.map((b) => b.gb), 1)
    : 1;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Inputs */}
      <div className="col-span-1 space-y-5">
        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Model</h2>

          {/* Preset picker */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRESET_MODELS.map((m) => (
              <button
                key={m.label}
                onClick={() => handlePreset(m.label, m.params)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  preset === m.label
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Parameters (billions)
            </label>
            <input
              value={modelParams}
              onChange={(e) => { setModelParams(e.target.value); setPreset("Custom"); }}
              type="number" min="0.1" step="0.1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Workload</h2>
          <div className="space-y-2">
            {WORKLOAD_OPTIONS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWorkload(w.value)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  workload === w.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className={`text-sm font-medium ${workload === w.value ? "text-blue-700" : "text-slate-900"}`}>
                  {w.label}
                </p>
                <p className="text-xs text-slate-500">{w.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Precision</h2>
          <div className="space-y-1.5">
            {PRECISION_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPrecision(p.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                  precision === p.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <span className="font-mono font-semibold">{p.value}</span>
                <span className={`text-xs ${precision === p.value ? "text-blue-500" : "text-slate-400"}`}>
                  {BYTES_PER_PARAM[p.value]}B · {p.desc.split(".")[0]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Advanced</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Batch size</label>
              <input
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                type="number" min="1"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Seq length</label>
              <input
                value={seqLen}
                onChange={(e) => setSeqLen(e.target.value)}
                type="number" min="512" step="512"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          {workload === "training" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkpointing}
                onChange={(e) => setCheckpointing(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-slate-700">Activation checkpointing</span>
            </label>
          )}
        </section>

        <button
          onClick={calculate}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
        >
          Calculate VRAM
        </button>
      </div>

      {/* Results */}
      <div className="col-span-2 space-y-5">
        {!result ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-xl">
            <BarChart2 className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">Configure your workload and click Calculate VRAM</p>
          </div>
        ) : (
          <>
            {/* Total */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Estimated VRAM Required
              </p>
              <p className="text-5xl font-bold text-slate-900">
                {result.totalGb.toFixed(1)}
                <span className="text-xl font-normal text-slate-400 ml-2">GB</span>
              </p>
              <p className="text-sm text-slate-500 mt-2">
                {modelParams}B params · {precision} · {workload}
                {workload !== "inference" && checkpointing ? " · checkpointing on" : ""}
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Memory breakdown
              </h2>
              <div className="space-y-3">
                {result.breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </div>
                    <GbBar gb={item.gb} maxGb={maxBreakdownGb} />
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Total</span>
                    <span className="text-sm font-bold text-slate-900">{result.totalGb.toFixed(1)} GB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPU Recommendations */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
                GPU Recommendations
              </h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={rec.name}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      i === 0 ? "border-blue-200 bg-blue-50" : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      i === 0 ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${i === 0 ? "text-blue-900" : "text-slate-900"}`}>
                          {rec.name}
                        </p>
                        {rec.countNeeded > 1 && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            × {rec.countNeeded} GPUs
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {rec.vramGb} GB VRAM
                        {rec.countNeeded > 1 && ` × ${rec.countNeeded} = ${rec.vramGb * rec.countNeeded} GB total`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {result.notes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-semibold text-amber-900">Notes</p>
                </div>
                <ul className="space-y-1">
                  {result.notes.map((note) => (
                    <li key={note} className="text-sm text-amber-800 flex items-start gap-1.5">
                      <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-amber-600" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-slate-400 px-1">
              Estimates based on standard mixed-precision formulas. Actual VRAM varies by framework, optimizer,
              and model architecture. Add 10–15% headroom for real deployments.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
