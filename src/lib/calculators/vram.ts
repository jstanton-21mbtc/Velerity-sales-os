/**
 * VRAM / Workload-Fit Calculator
 *
 * Pure functions — no DB, no side effects. Fully unit-testable.
 *
 * Formulas follow industry-standard mixed-precision training estimates and
 * standard transformer inference sizing rules.
 */

export type Precision = "FP32" | "FP16" | "BF16" | "FP8" | "INT8";
export type WorkloadType = "inference" | "training" | "fine-tuning";

/** Bytes per stored parameter for each precision format */
export const BYTES_PER_PARAM: Record<Precision, number> = {
  FP32: 4,
  FP16: 2,
  BF16: 2,
  FP8: 1,
  INT8: 1,
};

export type VramBreakdownItem = {
  label: string;
  gb: number;
};

export type GpuRecommendation = {
  name: string;
  vramGb: number;
  countNeeded: number;
  reason: string;
};

export type VramResult = {
  totalGb: number;
  breakdown: VramBreakdownItem[];
  recommendations: GpuRecommendation[];
  notes: string[];
};

export type VramInput = {
  modelParamsB: number;   // billions of parameters
  precision: Precision;
  workload: WorkloadType;
  batchSize?: number;     // default 1 for inference
  seqLen?: number;        // context length tokens, default 2048
  activationCheckpointing?: boolean; // training only, default false
};

const GB = 1_073_741_824; // bytes in 1 GiB

function bytesToGb(bytes: number): number {
  return parseFloat((bytes / GB).toFixed(2));
}

/** Available GPUs for recommendation, in order of VRAM size */
const GPU_TIERS: GpuRecommendation[] = [
  { name: "A100 40GB PCIe", vramGb: 40, countNeeded: 1, reason: "" },
  { name: "A100 80GB PCIe / SXM4", vramGb: 80, countNeeded: 1, reason: "" },
  { name: "H100 80GB PCIe", vramGb: 80, countNeeded: 1, reason: "" },
  { name: "H100 80GB SXM5", vramGb: 80, countNeeded: 1, reason: "" },
  { name: "H100 NVL (2-GPU module)", vramGb: 188, countNeeded: 1, reason: "" },
  { name: "H200 141GB SXM", vramGb: 141, countNeeded: 1, reason: "" },
  { name: "H200 141GB NVL (2-GPU module)", vramGb: 282, countNeeded: 1, reason: "" },
];

function buildRecommendations(
  requiredGb: number,
  workload: WorkloadType,
  precision: Precision
): GpuRecommendation[] {
  const recs: GpuRecommendation[] = [];

  // Single-GPU options that fit
  for (const gpu of GPU_TIERS) {
    if (gpu.vramGb >= requiredGb) {
      let reason = `Fits in a single ${gpu.name} with ${(gpu.vramGb - requiredGb).toFixed(0)} GB headroom.`;
      if (workload === "training" && gpu.name.includes("H100") && precision === "FP8") {
        reason += " Transformer Engine FP8 training available.";
      }
      if (gpu.name.includes("H200") && workload === "inference") {
        reason += " HBM3e delivers ~1.4× higher memory bandwidth than H100 SXM5.";
      }
      recs.push({ ...gpu, reason });
      if (recs.length === 3) break;
    }
  }

  // Multi-GPU sharding if nothing fits
  if (recs.length === 0) {
    const h100sxm = 80;
    const h200sxm = 141;
    const countH100 = Math.ceil(requiredGb / h100sxm);
    const countH200 = Math.ceil(requiredGb / h200sxm);
    recs.push({
      name: "H100 80GB SXM5",
      vramGb: h100sxm,
      countNeeded: countH100,
      reason: `Model must be sharded across ${countH100} GPUs using tensor/pipeline parallelism.`,
    });
    recs.push({
      name: "H200 141GB SXM",
      vramGb: h200sxm,
      countNeeded: countH200,
      reason: `Higher per-GPU VRAM reduces node count to ${countH200} GPUs.`,
    });
  }

  return recs;
}

/**
 * Calculate VRAM requirements for a given model and workload.
 *
 * Training formula (mixed-precision AdamW):
 *   - Weights (FP16/BF16):      params × 2 bytes
 *   - Gradients (FP16/BF16):    params × 2 bytes
 *   - Optimizer states (FP32 master + 1st + 2nd moment): params × 12 bytes
 *   - Activations (seq×batch):  rough ~1 GB per billion params per batch item
 *   - Checkpointing reduces activations by ~70%
 *
 * Inference formula:
 *   - Weights:     params × bytes_per_param
 *   - KV cache:    2 × layers × heads × head_dim × seqLen × batchSize × 2 bytes
 *                  ≈ params × 0.5 × (seqLen / 2048) × batchSize × 2 bytes (simplified)
 *   - Overhead:    weights × 0.1 (CUDA kernels, buffers)
 *
 * Fine-tuning (LoRA, rank-16 default):
 *   - Weights (frozen, precision): params × bytes
 *   - LoRA trainable params:       ~0.3% of params × 4 bytes (FP32)
 *   - Gradients for LoRA only:     same as LoRA params
 *   - Optimizer states for LoRA:   LoRA params × 12 bytes
 *   - Activations (smaller than full training)
 */
export function calcVram(input: VramInput): VramResult {
  const {
    modelParamsB,
    precision,
    workload,
    batchSize = 1,
    seqLen = 2048,
    activationCheckpointing = false,
  } = input;

  const params = modelParamsB * 1e9;
  const bytesPerParam = BYTES_PER_PARAM[precision];
  const breakdown: VramBreakdownItem[] = [];
  const notes: string[] = [];

  let totalBytes = 0;

  if (workload === "inference") {
    // Weights
    const weightBytes = params * bytesPerParam;
    breakdown.push({ label: "Model weights", gb: bytesToGb(weightBytes) });
    totalBytes += weightBytes;

    // KV cache — proportional approximation calibrated to known architectures:
    //   7B FP16, seq=2048, batch=1 → ~1 GB (matches Llama-2-7B exact calc)
    //   Scales linearly with params, seqLen, batchSize, and bytes per element.
    const kvGb = (modelParamsB / 7) * (seqLen / 2048) * batchSize * (bytesPerParam / 2);
    const kvBytes = kvGb * GB;
    breakdown.push({
      label: `KV cache (seq=${seqLen}, batch=${batchSize})`,
      gb: bytesToGb(kvBytes),
    });
    totalBytes += kvBytes;

    // Runtime overhead (CUDA kernels, input buffers)
    const overheadBytes = weightBytes * 0.1;
    breakdown.push({ label: "Runtime overhead (~10%)", gb: bytesToGb(overheadBytes) });
    totalBytes += overheadBytes;

    if (precision === "FP8") {
      notes.push("FP8 inference requires H100 / H200 with Transformer Engine.");
    }
    if (batchSize > 1) {
      notes.push("KV cache grows linearly with batch size and sequence length.");
    }
  } else if (workload === "training") {
    // Mixed-precision training (AMP / AdamW)
    const trainPrecBytes = precision === "FP32" ? 4 : 2; // weights + grads use FP16 in AMP

    const weightBytes = params * trainPrecBytes;
    breakdown.push({ label: `Weights (${precision === "FP32" ? "FP32" : "FP16/BF16"})`, gb: bytesToGb(weightBytes) });
    totalBytes += weightBytes;

    const gradBytes = params * trainPrecBytes;
    breakdown.push({ label: "Gradients", gb: bytesToGb(gradBytes) });
    totalBytes += gradBytes;

    // AdamW optimizer: FP32 master copy + m + v = 12 bytes per param
    const optBytes = precision === "FP32" ? params * 8 : params * 12;
    breakdown.push({
      label: precision === "FP32" ? "Optimizer (AdamW m+v)" : "Optimizer (FP32 master + m + v)",
      gb: bytesToGb(optBytes),
    });
    totalBytes += optBytes;

    // Activations
    const baseActivations = params * trainPrecBytes * batchSize * 0.5;
    const activationBytes = activationCheckpointing
      ? baseActivations * 0.3
      : baseActivations;
    breakdown.push({
      label: `Activations${activationCheckpointing ? " (checkpointing on)" : ""}`,
      gb: bytesToGb(activationBytes),
    });
    totalBytes += activationBytes;

    if (precision === "FP32") {
      notes.push("FP32 training doubles memory vs. mixed-precision. Consider BF16 + AMP.");
    }
    if (!activationCheckpointing && modelParamsB > 13) {
      notes.push(
        "Activation checkpointing can reduce activation memory by ~70% at ~30% compute cost."
      );
    }
    if (precision === "FP8") {
      notes.push(
        "FP8 training requires H100+ with Transformer Engine. Loss scaling is automatic."
      );
    }
  } else {
    // fine-tuning (LoRA)
    const weightBytes = params * bytesPerParam;
    breakdown.push({ label: `Frozen weights (${precision})`, gb: bytesToGb(weightBytes) });
    totalBytes += weightBytes;

    // LoRA params ~0.3% of total (rank 16, typical)
    const loraParams = params * 0.003;
    const loraWeightBytes = loraParams * 4; // FP32 trainable
    breakdown.push({ label: "LoRA trainable parameters (FP32)", gb: bytesToGb(loraWeightBytes) });
    totalBytes += loraWeightBytes;

    const loraOptBytes = loraParams * 12; // AdamW on LoRA params
    breakdown.push({ label: "LoRA optimizer states", gb: bytesToGb(loraOptBytes) });
    totalBytes += loraOptBytes;

    const activationBytes = params * bytesPerParam * batchSize * 0.15;
    breakdown.push({ label: "Activations (LoRA fwd pass)", gb: bytesToGb(activationBytes) });
    totalBytes += activationBytes;

    notes.push(
      "LoRA fine-tuning freezes the base model and trains only low-rank adapter matrices (~0.3% of parameters)."
    );
    notes.push(
      "QLoRA (INT4 quantization + LoRA) can halve VRAM further for inference-class hardware."
    );
  }

  const totalGb = bytesToGb(totalBytes);
  const recommendations = buildRecommendations(totalGb, workload, precision);

  return { totalGb, breakdown, recommendations, notes };
}
