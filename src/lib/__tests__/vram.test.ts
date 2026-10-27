import { describe, it, expect } from "vitest";
import { calcVram, BYTES_PER_PARAM } from "../calculators/vram";

describe("BYTES_PER_PARAM", () => {
  it("FP32 is 4 bytes", () => expect(BYTES_PER_PARAM.FP32).toBe(4));
  it("FP16 is 2 bytes", () => expect(BYTES_PER_PARAM.FP16).toBe(2));
  it("BF16 is 2 bytes", () => expect(BYTES_PER_PARAM.BF16).toBe(2));
  it("FP8 is 1 byte", () => expect(BYTES_PER_PARAM.FP8).toBe(1));
  it("INT8 is 1 byte", () => expect(BYTES_PER_PARAM.INT8).toBe(1));
});

describe("calcVram — inference", () => {
  it("7B model FP16 inference fits in ~20 GB", () => {
    const { totalGb } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference" });
    // weights: 7B × 2 bytes / 1GiB ≈ 13 GB, plus kv + overhead
    expect(totalGb).toBeGreaterThan(10);
    expect(totalGb).toBeLessThan(30);
  });

  it("70B model FP16 inference requires > 80 GB (multi-GPU)", () => {
    const { totalGb } = calcVram({ modelParamsB: 70, precision: "FP16", workload: "inference" });
    expect(totalGb).toBeGreaterThan(80);
  });

  it("FP8 inference uses ~half the VRAM of FP16 for same model", () => {
    const fp16 = calcVram({ modelParamsB: 13, precision: "FP16", workload: "inference" });
    const fp8 = calcVram({ modelParamsB: 13, precision: "FP8", workload: "inference" });
    expect(fp8.totalGb).toBeLessThan(fp16.totalGb);
  });

  it("larger batch size increases totalGb", () => {
    const batch1 = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference", batchSize: 1 });
    const batch8 = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference", batchSize: 8 });
    expect(batch8.totalGb).toBeGreaterThan(batch1.totalGb);
  });

  it("longer seq length increases totalGb", () => {
    const short = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference", seqLen: 2048 });
    const long = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference", seqLen: 32768 });
    expect(long.totalGb).toBeGreaterThan(short.totalGb);
  });

  it("has breakdown with at least 3 items", () => {
    const { breakdown } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference" });
    expect(breakdown.length).toBeGreaterThanOrEqual(3);
  });

  it("all breakdown items are non-negative", () => {
    const { breakdown } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference" });
    breakdown.forEach((item) => expect(item.gb).toBeGreaterThanOrEqual(0));
  });

  it("has at least 1 recommendation", () => {
    const { recommendations } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference" });
    expect(recommendations.length).toBeGreaterThanOrEqual(1);
  });
});

describe("calcVram — training", () => {
  it("7B FP16 training requires more VRAM than inference", () => {
    const train = calcVram({ modelParamsB: 7, precision: "FP16", workload: "training" });
    const inf = calcVram({ modelParamsB: 7, precision: "FP16", workload: "inference" });
    expect(train.totalGb).toBeGreaterThan(inf.totalGb);
  });

  it("FP32 training requires more VRAM than FP16 training", () => {
    const fp32 = calcVram({ modelParamsB: 7, precision: "FP32", workload: "training" });
    const fp16 = calcVram({ modelParamsB: 7, precision: "FP16", workload: "training" });
    expect(fp32.totalGb).toBeGreaterThan(fp16.totalGb);
  });

  it("activation checkpointing reduces VRAM", () => {
    const withCheck = calcVram({ modelParamsB: 13, precision: "BF16", workload: "training", activationCheckpointing: true });
    const withoutCheck = calcVram({ modelParamsB: 13, precision: "BF16", workload: "training", activationCheckpointing: false });
    expect(withCheck.totalGb).toBeLessThan(withoutCheck.totalGb);
  });

  it("13B model FP16 training without checkpointing needs > 80 GB", () => {
    const { totalGb } = calcVram({ modelParamsB: 13, precision: "FP16", workload: "training" });
    // weights (26GB) + grads (26GB) + optimizer (156GB) alone = 208GB
    expect(totalGb).toBeGreaterThan(80);
  });

  it("notes mention activation checkpointing for large models", () => {
    const { notes } = calcVram({ modelParamsB: 30, precision: "FP16", workload: "training" });
    const hasCheckpointNote = notes.some((n) => n.toLowerCase().includes("checkpoint"));
    expect(hasCheckpointNote).toBe(true);
  });
});

describe("calcVram — fine-tuning", () => {
  it("fine-tuning requires less VRAM than full training", () => {
    const ft = calcVram({ modelParamsB: 7, precision: "FP16", workload: "fine-tuning" });
    const train = calcVram({ modelParamsB: 7, precision: "FP16", workload: "training" });
    expect(ft.totalGb).toBeLessThan(train.totalGb);
  });

  it("notes mention LoRA", () => {
    const { notes } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "fine-tuning" });
    const hasLora = notes.some((n) => n.toLowerCase().includes("lora"));
    expect(hasLora).toBe(true);
  });

  it("fine-tuning breakdown includes LoRA items", () => {
    const { breakdown } = calcVram({ modelParamsB: 7, precision: "FP16", workload: "fine-tuning" });
    const hasLora = breakdown.some((b) => b.label.toLowerCase().includes("lora"));
    expect(hasLora).toBe(true);
  });
});

describe("calcVram — multi-GPU recommendations", () => {
  it("405B model gets multi-GPU recommendation with countNeeded > 1", () => {
    const { recommendations } = calcVram({ modelParamsB: 405, precision: "FP16", workload: "inference" });
    const needsMulti = recommendations.some((r) => r.countNeeded > 1);
    expect(needsMulti).toBe(true);
  });
});
