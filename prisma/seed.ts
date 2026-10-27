/**
 * Velerity Sales OS — Seed Script
 *
 * Seeds:
 * 1. GPU specs (A100, H100, H200 variants) — sourced from official NVIDIA datasheets
 * 2. Platform specs (DGX, HGX systems from major OEMs) — sourced from official OEM pages
 * 3. ICP segments (13 industry verticals)
 * 4. Objection library (4 core objections)
 * 5. Training module (GPU fundamentals)
 * 6. Demo organization with sample accounts, contacts, deals, and inventory
 *
 * Source URLs reference official spec pages as of 2024. Verified flag is set to true
 * only for specs where the source URL was confirmed against an official datasheet.
 * All specs in this seed are marked verified=false by default; an admin must confirm
 * each one via the admin verification screen.
 *
 * IMPORTANT: specs are marked unverified here intentionally so that admins go through
 * the verification workflow on first setup.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient() as any;

// ============================================================
// GPU SPECS
// All throughput figures follow NVIDIA notation (peak, sparsity where applicable).
// Sources: NVIDIA data center GPU datasheets (nvidia.com/en-us/data-center)
// ============================================================

const GPU_SPECS = [
  // ---- A100 ----
  {
    slug: "a100-40gb-pcie",
    name: "NVIDIA A100 40GB PCIe",
    generation: "A100" as const,
    variant: "40GB HBM2 PCIe",
    memoryGb: 40,
    memoryType: "HBM2",
    memoryBwTbps: 1.555,
    fp64TflopsStr: "9.7 TFLOPS",
    fp32TflopsStr: "19.5 TFLOPS",
    tf32TflopsStr: "156 TFLOPS | 312 TFLOPS (sparse)",
    bf16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp8TflopsStr: null,
    int8TopsStr: "624 TOPS | 1,248 TOPS (sparse)",
    nvlinkBwGbps: null,
    nvlinkGeneration: null,
    tdpWatts: 250,
    formFactor: "PCIe Gen4 x16",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: false,
    bestFor: "Training mid-scale models, HPC workloads, multi-tenant inference via MIG. PCIe form factor fits standard GPU server slots without requiring specialized SXM motherboard.",
    notes: "PCIe A100 is the most broadly compatible variant — drops into any PCIe Gen4 x16 slot. Lower memory bandwidth than SXM4 variant (1.555 TB/s vs 2.0 TB/s). NVLink not available in PCIe form factor.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/",
    verified: false,
  },
  {
    slug: "a100-80gb-pcie",
    name: "NVIDIA A100 80GB PCIe",
    generation: "A100" as const,
    variant: "80GB HBM2e PCIe",
    memoryGb: 80,
    memoryType: "HBM2e",
    memoryBwTbps: 1.935,
    fp64TflopsStr: "9.7 TFLOPS",
    fp32TflopsStr: "19.5 TFLOPS",
    tf32TflopsStr: "156 TFLOPS | 312 TFLOPS (sparse)",
    bf16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp8TflopsStr: null,
    int8TopsStr: "624 TOPS | 1,248 TOPS (sparse)",
    nvlinkBwGbps: null,
    nvlinkGeneration: null,
    tdpWatts: 300,
    formFactor: "PCIe Gen4 x16",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: false,
    bestFor: "Large model inference and fine-tuning that requires 80GB VRAM, in standard PCIe servers. 7B–70B parameter model fine-tuning and inference. Same compute as 40GB but double the VRAM.",
    notes: "80GB PCIe variant offers more memory than 40GB at the cost of 250W vs 300W TDP. Still lacks NVLink; best for single-GPU or PCIe-P2P workloads.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/",
    verified: false,
  },
  {
    slug: "a100-80gb-sxm4",
    name: "NVIDIA A100 80GB SXM4",
    generation: "A100" as const,
    variant: "80GB HBM2e SXM4",
    memoryGb: 80,
    memoryType: "HBM2e",
    memoryBwTbps: 2.0,
    fp64TflopsStr: "9.7 TFLOPS",
    fp32TflopsStr: "19.5 TFLOPS",
    tf32TflopsStr: "156 TFLOPS | 312 TFLOPS (sparse)",
    bf16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp16TflopsStr: "312 TFLOPS | 624 TFLOPS (sparse)",
    fp8TflopsStr: null,
    int8TopsStr: "624 TOPS | 1,248 TOPS (sparse)",
    nvlinkBwGbps: 600,
    nvlinkGeneration: "NVLink 3.0",
    tdpWatts: 400,
    formFactor: "SXM4",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: false,
    bestFor: "Multi-GPU training of large models (GPT-3 class and above), HPC, and large-scale inference clusters. NVLink 3.0 enables 600 GB/s all-to-all bandwidth in 8-GPU configurations.",
    notes: "SXM4 form factor requires HGX or DGX motherboard. Highest memory bandwidth in the A100 lineup (2.0 TB/s). Required for NVLink-connected multi-GPU training.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/a100/",
    verified: false,
  },

  // ---- H100 ----
  {
    slug: "h100-80gb-pcie",
    name: "NVIDIA H100 80GB PCIe",
    generation: "H100" as const,
    variant: "80GB HBM2e PCIe",
    memoryGb: 80,
    memoryType: "HBM2e",
    memoryBwTbps: 2.0,
    fp64TflopsStr: "26 TFLOPS | 51 TFLOPS (tensor)",
    fp32TflopsStr: "51 TFLOPS",
    tf32TflopsStr: "756 TFLOPS | 1,513 TFLOPS (sparse)",
    bf16TflopsStr: "1,513 TFLOPS | 3,026 TFLOPS (sparse)",
    fp16TflopsStr: "1,513 TFLOPS | 3,026 TFLOPS (sparse)",
    fp8TflopsStr: "3,026 TFLOPS | 6,051 TFLOPS (sparse)",
    int8TopsStr: "3,026 TOPS | 6,051 TOPS (sparse)",
    nvlinkBwGbps: null,
    nvlinkGeneration: null,
    tdpWatts: 350,
    formFactor: "PCIe Gen5 x16",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: true,
    bestFor: "LLM inference at scale in standard PCIe servers. 7B–70B inference, fine-tuning. FP8 Transformer Engine for maximum inference throughput without custom hardware.",
    notes: "PCIe H100 lacks NVLink; suitable for single-GPU inference or smaller fine-tuning workloads. PCIe Gen5 required for full bandwidth. Transformer Engine enables automatic FP8 precision management.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
    verified: false,
  },
  {
    slug: "h100-80gb-sxm5",
    name: "NVIDIA H100 80GB SXM5",
    generation: "H100" as const,
    variant: "80GB HBM3 SXM5",
    memoryGb: 80,
    memoryType: "HBM3",
    memoryBwTbps: 3.35,
    fp64TflopsStr: "34 TFLOPS | 67 TFLOPS (tensor)",
    fp32TflopsStr: "67 TFLOPS",
    tf32TflopsStr: "989 TFLOPS | 1,979 TFLOPS (sparse)",
    bf16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp8TflopsStr: "3,958 TFLOPS | 7,916 TFLOPS (sparse)",
    int8TopsStr: "3,958 TOPS | 7,916 TOPS (sparse)",
    nvlinkBwGbps: 900,
    nvlinkGeneration: "NVLink 4.0",
    tdpWatts: 700,
    formFactor: "SXM5",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: true,
    bestFor: "Pre-training and fine-tuning of frontier LLMs (Llama 3, Mistral, GPT-4 class). State-of-the-art throughput for transformer workloads. Industry standard for AI infrastructure as of 2024.",
    notes: "SXM5 is the flagship H100 variant. HBM3 delivers 3.35 TB/s vs 2.0 TB/s on PCIe. NVLink 4.0 at 900 GB/s enables efficient tensor-parallel and pipeline-parallel training. Requires HGX H100 baseboard.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
    verified: false,
  },
  {
    slug: "h100-nvl",
    name: "NVIDIA H100 NVL",
    generation: "H100" as const,
    variant: "188GB HBM3 NVL (2-GPU module)",
    memoryGb: 188,
    memoryType: "HBM3",
    memoryBwTbps: 7.8,
    fp64TflopsStr: "60 TFLOPS (module)",
    fp32TflopsStr: "120 TFLOPS (module)",
    tf32TflopsStr: "1,979 TFLOPS (module)",
    bf16TflopsStr: "3,958 TFLOPS (module)",
    fp16TflopsStr: "3,958 TFLOPS (module)",
    fp8TflopsStr: "7,916 TFLOPS (module)",
    int8TopsStr: "7,916 TOPS (module)",
    nvlinkBwGbps: 900,
    nvlinkGeneration: "NVLink 4.0",
    tdpWatts: 1000,
    formFactor: "NVL (2-GPU PCIe module)",
    migSupport: false,
    migMaxInstances: null,
    transformerEngine: true,
    bestFor: "Large LLM inference requiring >80GB VRAM in a single PCIe slot pair. 188GB unified memory enables serving 70B+ models without tensor parallelism. Fits PCIe servers with dual-wide slots.",
    notes: "NVL is a 2-GPU module presenting as a single 188GB device via NVLink. Ideal for 70B–405B model inference. Does not support MIG. Requires dual-slot PCIe expansion.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h100/",
    verified: false,
  },

  // ---- H200 ----
  {
    slug: "h200-141gb-sxm",
    name: "NVIDIA H200 141GB SXM",
    generation: "H200" as const,
    variant: "141GB HBM3e SXM",
    memoryGb: 141,
    memoryType: "HBM3e",
    memoryBwTbps: 4.8,
    fp64TflopsStr: "34 TFLOPS | 67 TFLOPS (tensor)",
    fp32TflopsStr: "67 TFLOPS",
    tf32TflopsStr: "989 TFLOPS | 1,979 TFLOPS (sparse)",
    bf16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp8TflopsStr: "3,958 TFLOPS | 7,916 TFLOPS (sparse)",
    int8TopsStr: "3,958 TOPS | 7,916 TOPS (sparse)",
    nvlinkBwGbps: 900,
    nvlinkGeneration: "NVLink 4.0",
    tdpWatts: 700,
    formFactor: "SXM5 (drop-in for H100 SXM5 systems)",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: true,
    bestFor: "Memory-bound inference workloads: large context lengths (128K+), 70B–405B model serving at high batch sizes. Same compute die as H100 SXM5 but 1.76× more memory and 1.43× higher bandwidth.",
    notes: "H200 uses the same Hopper GH100 die as H100 SXM5 — identical compute throughput. The uplift is entirely in memory: 141GB HBM3e at 4.8 TB/s vs 80GB HBM3 at 3.35 TB/s. This matters most for inference at large batch sizes and long contexts. H200 SXM modules are drop-in compatible with H100 SXM5 HGX baseboards.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h200/",
    verified: false,
  },
  {
    slug: "h200-nvl",
    name: "NVIDIA H200 NVL",
    generation: "H200" as const,
    variant: "141GB HBM3e NVL (single GPU)",
    memoryGb: 141,
    memoryType: "HBM3e",
    memoryBwTbps: 4.8,
    fp64TflopsStr: "34 TFLOPS | 67 TFLOPS (tensor)",
    fp32TflopsStr: "67 TFLOPS",
    tf32TflopsStr: "989 TFLOPS | 1,979 TFLOPS (sparse)",
    bf16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp16TflopsStr: "1,979 TFLOPS | 3,958 TFLOPS (sparse)",
    fp8TflopsStr: "3,958 TFLOPS | 7,916 TFLOPS (sparse)",
    int8TopsStr: "3,958 TOPS | 7,916 TOPS (sparse)",
    nvlinkBwGbps: 900,
    nvlinkGeneration: "NVLink 4.0",
    tdpWatts: 600,
    formFactor: "NVL PCIe",
    migSupport: true,
    migMaxInstances: 7,
    transformerEngine: true,
    bestFor: "PCIe-based H200 capacity for buyers who cannot deploy SXM systems. Full 141GB HBM3e in a PCIe card form factor.",
    notes: "H200 NVL is a single-GPU PCIe card (unlike H100 NVL which is a 2-GPU module). Offers H200 memory capacity in PCIe servers. Lower TDP than SXM variant.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/h200/",
    verified: false,
  },
];

// ============================================================
// PLATFORM SPECS
// Sources: OEM product pages and datasheets
// ============================================================

const PLATFORM_SPECS = [
  // ---- NVIDIA DGX ----
  {
    slug: "dgx-a100",
    name: "NVIDIA DGX A100",
    oem: "NVIDIA",
    formFactorU: 10,
    gpuCount: 8,
    cpuOptions: "2× AMD EPYC 7742 (64-core)",
    maxRamGb: 2048,
    storageConfig: "4× 3.84TB NVMe + 1.92TB OS SSD",
    networkingConfig: "8× 200Gb/s InfiniBand HDR + 2× 10GbE OOB",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 6500,
    psuConfig: "6.5kW",
    coolingType: "AIR" as const,
    weightKg: 123,
    rackUnits: 10,
    notes: "Reference DGX A100 system. 8× A100 80GB SXM4 with full NVLink 3.0 mesh via NVSwitch. 600 GB/s all-to-all GPU bandwidth. Ships with DGX OS (Ubuntu-based) and NVIDIA Base Command software stack.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/dgx-a100/",
    verified: false,
  },
  {
    slug: "dgx-h100",
    name: "NVIDIA DGX H100",
    oem: "NVIDIA",
    formFactorU: 10,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Platinum 8480C (60-core)",
    maxRamGb: 2048,
    storageConfig: "8× 3.84TB NVMe + 1.92TB OS SSD",
    networkingConfig: "8× 400Gb/s InfiniBand NDR (ConnectX-7) + 2× 10GbE OOB",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 10200,
    psuConfig: "10.2kW, 6× PSU",
    coolingType: "AIR" as const,
    weightKg: 140,
    rackUnits: 10,
    notes: "Reference DGX H100 system. 8× H100 80GB SXM5 with NVLink 4.0 and NVSwitch 3.0. 900 GB/s all-to-all GPU bandwidth. NDR InfiniBand enables multi-node scale-out to SuperPOD.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/dgx-h100/",
    verified: false,
  },
  {
    slug: "dgx-h200",
    name: "NVIDIA DGX H200",
    oem: "NVIDIA",
    formFactorU: 10,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Platinum 8480C (60-core)",
    maxRamGb: 2048,
    storageConfig: "8× 3.84TB NVMe + 1.92TB OS SSD",
    networkingConfig: "8× 400Gb/s InfiniBand NDR (ConnectX-7) + 2× 10GbE OOB",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 10200,
    psuConfig: "10.2kW, 6× PSU",
    coolingType: "AIR" as const,
    weightKg: 140,
    rackUnits: 10,
    notes: "DGX H200 replaces H100 modules with H200 141GB HBM3e. Same chassis and compute architecture. Ideal upgrade path from DGX H100 for memory-bound workloads.",
    sourceUrl: "https://www.nvidia.com/en-us/data-center/dgx-h200/",
    verified: false,
  },

  // ---- Dell ----
  {
    slug: "dell-xe8545",
    name: "Dell PowerEdge XE8545",
    oem: "Dell",
    formFactorU: 4,
    gpuCount: 4,
    cpuOptions: "2× AMD EPYC 7003 series (up to 64-core)",
    maxRamGb: 4096,
    storageConfig: "Up to 4× NVMe (front-accessible)",
    networkingConfig: "Up to 4× ConnectX-6 (100/200GbE or HDR IB), 2× 1GbE OOB",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 5600,
    psuConfig: "4× 2800W PSU",
    coolingType: "AIR" as const,
    weightKg: 68,
    rackUnits: 4,
    notes: "4-GPU A100 SXM4 system (HGX A100). Compact 4U form factor for dense deployment. Popular choice for organizations that want A100 SXM4 performance in a 4U footprint.",
    sourceUrl: "https://www.dell.com/en-us/shop/ipovw/poweredge-xe8545",
    verified: false,
  },
  {
    slug: "dell-xe9680",
    name: "Dell PowerEdge XE9680",
    oem: "Dell",
    formFactorU: 8,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Scalable (4th Gen, up to 60-core)",
    maxRamGb: 4096,
    storageConfig: "12× E3.S NVMe (up to ~100TB)",
    networkingConfig: "Up to 8× ConnectX-7 (400GbE or NDR IB), OCP NIC slot, 2× 1GbE OOB",
    hasDpu: true,
    dpuModel: "Optional BlueField-3 DPU",
    tdpWatts: 12000,
    psuConfig: "6× 2400W PSU (N+1 redundancy)",
    coolingType: "AIR" as const,
    weightKg: 145,
    rackUnits: 8,
    notes: "Dell's 8-GPU HGX H100/H200 platform. High storage density (12× E3.S NVMe). Optional BlueField-3 DPU for SmartNIC offload. Strong choice for enterprises standardized on Dell.",
    sourceUrl: "https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680",
    verified: false,
  },

  // ---- HPE ----
  {
    slug: "hpe-cray-xd670",
    name: "HPE Cray XD670",
    oem: "HPE",
    formFactorU: 8,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Scalable (4th Gen)",
    maxRamGb: 4096,
    storageConfig: "Up to 12× NVMe",
    networkingConfig: "8× HDR/NDR InfiniBand or 400GbE (ConnectX-6/7), optional BlueField",
    hasDpu: true,
    dpuModel: "Optional NVIDIA BlueField-2/3",
    tdpWatts: 11000,
    psuConfig: "Redundant PSU, up to 11kW",
    coolingType: "AIR" as const,
    weightKg: 130,
    rackUnits: 8,
    notes: "HPE's flagship 8-GPU H100/H200 system for the Cray XD line. Often deployed in HPC and research clusters. Available with HPE Cray supercomputing software stack.",
    sourceUrl: "https://www.hpe.com/us/en/compute/hpc/supercomputing/cray-xd-series.html",
    verified: false,
  },

  // ---- Supermicro ----
  {
    slug: "supermicro-hgx-h100",
    name: "Supermicro HGX H100 8-GPU",
    oem: "Supermicro",
    formFactorU: 8,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Scalable (4th/5th Gen) or AMD EPYC 9004",
    maxRamGb: 4096,
    storageConfig: "Up to 12× NVMe U.2/E3.S",
    networkingConfig: "Up to 8× ConnectX-7 (400GbE/NDR IB), OCP 3.0 NIC slot",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 12000,
    psuConfig: "6× 3000W redundant PSU",
    coolingType: "AIR" as const,
    weightKg: 120,
    rackUnits: 8,
    notes: "Supermicro SYS-821GE-TNHR or equivalent. HGX H100 reference design. Supermicro is a major HGX OEM with broad configurability — CPU, storage, and networking options. Good balance of price and configurability.",
    sourceUrl: "https://www.supermicro.com/en/products/system/gpu/8u/sys-821ge-tnhr",
    verified: false,
  },

  // ---- Lenovo ----
  {
    slug: "lenovo-sr675-v3",
    name: "Lenovo ThinkSystem SR675 V3",
    oem: "Lenovo",
    formFactorU: 4,
    gpuCount: 8,
    cpuOptions: "1–2× AMD EPYC 9004 series",
    maxRamGb: 3072,
    storageConfig: "Up to 16× NVMe (2.5\" or E3.S)",
    networkingConfig: "Up to 6× HDR/NDR InfiniBand or 400GbE",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 8000,
    psuConfig: "4× 2600W PSU",
    coolingType: "AIR" as const,
    weightKg: 85,
    rackUnits: 4,
    notes: "Lenovo's 4U, 8-GPU PCIe system (PCIe GPU form factor, not SXM). Supports H100 NVL, A100 PCIe, H200 NVL. More compact than 8U SXM systems. Popular in enterprise and university deployments.",
    sourceUrl: "https://lenovopress.lenovo.com/lp1819-thinksystem-sr675-v3",
    verified: false,
  },
  {
    slug: "lenovo-sr680a-v3",
    name: "Lenovo ThinkSystem SR680a V3",
    oem: "Lenovo",
    formFactorU: 8,
    gpuCount: 8,
    cpuOptions: "2× Intel Xeon Scalable (4th Gen)",
    maxRamGb: 4096,
    storageConfig: "Up to 12× NVMe",
    networkingConfig: "8× ConnectX-7 (NDR IB / 400GbE), OCP NIC",
    hasDpu: false,
    dpuModel: null,
    tdpWatts: 11500,
    psuConfig: "6× PSU",
    coolingType: "AIR" as const,
    weightKg: 135,
    rackUnits: 8,
    notes: "Lenovo's 8U HGX H100/H200 platform. Successor to SR670 V2. Strong enterprise support via Lenovo warranty and services.",
    sourceUrl: "https://lenovopress.lenovo.com/",
    verified: false,
  },
];

// ============================================================
// ICP SEGMENTS
// ============================================================

const ICP_SEGMENTS = [
  {
    slug: "gpu-clouds-neoclouds",
    name: "GPU Clouds / Neoclouds",
    whyTheyBuy: "Need to build capacity fast to serve AI infrastructure customers. OEM lead times kill their ability to win contracts. Certified refurb at discount lets them deploy revenue-generating capacity without 9-month wait.",
    typicalDealSize: "$2M–$20M+",
    talkingPoints: [
      "Fastest path to billable capacity",
      "Known GPU-hour economics — certified refurb improves margin vs. new",
      "Serialized health reports for your own customer SLAs",
      "Scale to multi-rack with phased purchasing",
    ],
    bestGpuFit: "H100 SXM5, H200 SXM",
  },
  {
    slug: "ai-native-startups",
    name: "AI-Native Startups (Seed–Series C)",
    whyTheyBuy: "Cloud GPU costs are destroying unit economics as they scale. Series A/B companies hitting $50k–$200k/month cloud bills look for owned infrastructure. Need it fast because they're in sprint cycles.",
    typicalDealSize: "$500K–$5M",
    talkingPoints: [
      "Cloud bills compounding — own your infrastructure",
      "Under 5 weeks vs. 6–9 months from OEM",
      "30–60% below new-OEM cost",
      "Warranty + health report satisfies board/investor diligence",
    ],
    bestGpuFit: "H100 SXM5, H100 PCIe",
  },
  {
    slug: "enterprise-ai-ml",
    name: "Enterprise AI/ML Teams",
    whyTheyBuy: "Internal AI initiatives have clear ROI but can't get budget approved for multi-million OEM purchase + 9-month wait. Certified refurb hits the sweet spot: fast, lower capex, enterprise-grade warranty.",
    typicalDealSize: "$1M–$10M",
    talkingPoints: [
      "Procurement-friendly: warranty, traceability, compliance docs",
      "Faster than OEM + lower total capex",
      "Compatible with existing Dell/HPE infrastructure",
      "Export control compliance documentation included",
    ],
    bestGpuFit: "A100 80GB SXM4, H100 SXM5",
  },
  {
    slug: "universities-research",
    name: "Universities & Research Labs",
    whyTheyBuy: "Grant timelines don't match OEM lead times. Certified refurb lets labs spend grant money before the award window closes. Price sensitivity is high — refurb budget can buy 2–3× the GPU count vs. new.",
    typicalDealSize: "$200K–$3M",
    talkingPoints: [
      "More GPU-hours per grant dollar",
      "Ship before grant window closes",
      "MIG support for multi-researcher sharing",
      "Compatibility with existing HPC clusters (SLURM, PBS)",
    ],
    bestGpuFit: "A100 80GB SXM4, H100 PCIe",
  },
  {
    slug: "healthcare-life-sciences",
    name: "Healthcare & Life Sciences",
    whyTheyBuy: "Medical imaging AI, drug discovery, genomics, and clinical NLP all require substantial GPU compute. Data sovereignty (can't use cloud for PHI) drives on-prem preference. Need certified provenance for audit trails.",
    typicalDealSize: "$500K–$8M",
    talkingPoints: [
      "On-prem for HIPAA/PHI compliance",
      "Serialized traceability satisfies procurement and audit requirements",
      "MIG enables multi-department workload isolation",
      "Faster than OEM for time-sensitive research timelines",
    ],
    bestGpuFit: "A100 80GB SXM4, H100 PCIe",
  },
  {
    slug: "financial-services",
    name: "Financial Services (Quant, Risk, Fraud)",
    whyTheyBuy: "Quantitative modeling, risk simulation, and real-time fraud detection are GPU-accelerated. Regulatory requirements often prohibit cloud for sensitive data. Fast deployment for time-to-alpha.",
    typicalDealSize: "$1M–$15M",
    talkingPoints: [
      "On-prem for regulatory data residency",
      "FP64 for quant precision (A100 strong here)",
      "Export control compliance docs for procurement",
      "Certified provenance satisfies vendor risk management",
    ],
    bestGpuFit: "A100 80GB SXM4 (FP64), H100 SXM5",
  },
  {
    slug: "media-vfx-rendering",
    name: "Media / VFX / Rendering",
    whyTheyBuy: "AI-driven upscaling, denoising, generative VFX, and render acceleration. Project-driven demand spikes mean they need burst capacity fast. Price sensitive — refurb economics improve per-project margins.",
    typicalDealSize: "$200K–$3M",
    talkingPoints: [
      "Burst capacity for production deadlines",
      "Lower cost per rendered frame vs. cloud burst",
      "A100 or H100 for both rendering and AI upscaling",
    ],
    bestGpuFit: "A100 80GB PCIe, H100 PCIe",
  },
  {
    slug: "autonomous-vehicles-robotics",
    name: "Autonomous Vehicles & Robotics",
    whyTheyBuy: "Simulation, synthetic data generation, and model training for AV/robotics stacks require large GPU clusters. Infrastructure is opex-sensitive in a capital-intensive sector.",
    typicalDealSize: "$1M–$10M",
    talkingPoints: [
      "Simulation throughput is a competitive differentiator",
      "Refurb economics free up capex for sensors and hardware",
      "Fast deployment keeps simulation pipelines unblocked",
    ],
    bestGpuFit: "H100 SXM5, A100 80GB SXM4",
  },
  {
    slug: "energy-oil-gas",
    name: "Energy & Oil and Gas",
    whyTheyBuy: "Seismic processing, reservoir simulation, and energy grid optimization all require FP64-heavy HPC. Long project cycles mean they can plan ahead but still value certified refurb pricing.",
    typicalDealSize: "$500K–$5M",
    talkingPoints: [
      "FP64 throughput for seismic simulation",
      "HPC-compatible platforms (InfiniBand, NVLink)",
      "On-prem data sovereignty for proprietary datasets",
    ],
    bestGpuFit: "A100 80GB SXM4 (FP64 strength)",
  },
  {
    slug: "telecom",
    name: "Telecom",
    whyTheyBuy: "Network intelligence, RAN optimization, and subscriber experience AI. Edge and core deployment. Large procurement organizations with long vendor qualification cycles that certified documentation accelerates.",
    typicalDealSize: "$1M–$10M",
    talkingPoints: [
      "Accelerated vendor qualification with certified docs + warranty",
      "Price competitive vs. hyperscaler alternatives",
      "InfiniBand for distributed inference at edge",
    ],
    bestGpuFit: "H100 PCIe, A100 PCIe",
  },
  {
    slug: "bitcoin-miners-pivoting",
    name: "Bitcoin Miners Pivoting to AI/HPC",
    whyTheyBuy: "Post-halving economics have made BTC mining marginal. Miners with data center infrastructure (power, cooling, colo space) are pivoting to GPU hosting or AI training. They understand hardware deeply — refurb credibility matters.",
    typicalDealSize: "$500K–$20M",
    talkingPoints: [
      "They already have the power, cooling, and colo — just need GPUs",
      "Existing team understands hardware ROI",
      "Certified refurb = lowest cost per GPU-hour for hosting customers",
      "Export compliance program protects their customer base",
    ],
    bestGpuFit: "H100 SXM5, H200 SXM, A100 80GB SXM4",
  },
  {
    slug: "colo-msps",
    name: "Colocation Providers & MSPs",
    whyTheyBuy: "Offering GPU-as-a-service to SMB customers. Need price-competitive hardware to build margin into their offering. Certified refurb + warranty gives them the reliability story for their customers.",
    typicalDealSize: "$500K–$5M",
    talkingPoints: [
      "Build customer SLAs on certified provenance",
      "Lower COGS vs. new improves GPU-hour pricing competitiveness",
      "Health reports and warranty for your own service guarantees",
    ],
    bestGpuFit: "H100 PCIe, A100 80GB PCIe/SXM4",
  },
  {
    slug: "sovereign-data-residency",
    name: "Sovereign / Data-Residency-Sensitive Orgs",
    whyTheyBuy: "Government agencies, national labs, defense contractors, and regulated industries that cannot use US hyperscalers. Need on-prem, air-gapped, or in-country deployment. Export control compliance is a prerequisite not a checkbox.",
    typicalDealSize: "$2M–$50M+",
    talkingPoints: [
      "Full export control compliance documentation included",
      "On-prem deployment — no cloud dependency",
      "Formal supplier qualification program",
      "Serialized traceability for security clearance audits",
    ],
    bestGpuFit: "H100 SXM5, H200 SXM, A100 80GB SXM4",
  },
];

// ============================================================
// OBJECTIONS
// ============================================================

const OBJECTIONS = [
  {
    slug: "refurb-risky",
    path: "refurb-risky",
    title: "Refurbished hardware is risky",
    response: `This is the most important objection to address head-on, because it's partially true about the gray market — and completely false about certified refurbishment.

Here's the difference:

**Gray market / uncertified resale**: A broker buys used hardware, does no diagnostics, ships it to you. You have no idea how many hours are on the GPUs, whether there are latent failures, or whether the seller can even legally export it. This is where the "refurb is risky" narrative comes from — and it's warranted.

**Certified refurbishment (Velerity)**: Every system goes through NVIDIA's DGX health workflow, a 30-minute stress test, and full diagnostics before it ships. You receive a serialized health report showing GPU hours, test results, and component traceability. You get a warranty — either NVIDIA's limited warranty on qualifying GPUs or Velerity's own warranty otherwise.

The question isn't "new vs. refurb." It's "certified vs. uncertified." A certified system with a health report and warranty is lower risk than buying new from an unknown OEM reseller with no diagnostics.

Ask the buyer: "What specifically concerns you? Hours on the hardware? Warranty? Performance?" Then address each specifically with the cert documentation.`,
    counterPoints: [
      "All systems go through NVIDIA's DGX health workflow — same diagnostics NVIDIA uses",
      "Serialized health report: GPU hours, test results, component traceability",
      "Warranty included — NVIDIA limited or Velerity seller warranty",
      "Export compliance documentation included — gray market doesn't have this",
      "We can share a sample health report so they can see exactly what they're getting",
    ],
    relatedSlug: null,
  },
  {
    slug: "just-use-cloud",
    path: "cloud",
    title: "We'll just use the cloud",
    response: `Cloud is the right answer for some workloads. For others, it destroys economics. The question is which category this buyer is in.

**Where cloud wins**: Highly variable workloads, early-stage experimentation, workloads running <20% utilization, organizations with no data center. Cloud is correct for these.

**Where owned infrastructure wins**: Sustained workloads (>40% utilization), data sovereignty requirements, predictable long-term compute needs. For these, cloud is typically 3–5× more expensive per GPU-hour than owned hardware on a 3-year basis.

Run the TCO math with them using real numbers:
- On-demand H100: ~$3–4/hour on major clouds
- Reserved H100: ~$2–2.50/hour
- Owned certified refurb: model out at $X purchase / (hours over 3 years) — typically $0.30–0.80/hour at 70% utilization

For an AI team running training and inference at 70% utilization, cloud costs 4–8× what owned infrastructure costs. The certified refurb purchase pays back in 6–12 months.

Secondary argument: data sovereignty. Healthcare, finance, and enterprise teams often can't put certain data on cloud GPUs at all.`,
    counterPoints: [
      "TCO: cloud at 70% utilization is 4–8× more expensive than owned",
      "Cloud H100 on-demand: ~$3–4/hr. Reserved: ~$2–2.50/hr. Owned: ~$0.30–0.80/hr at 70% util",
      "Payback period for owned hardware typically 6–12 months at sustained use",
      "Data sovereignty: many enterprise/regulated workloads can't go on cloud",
      "Hybrid is often the answer — own the base, burst to cloud for peaks",
    ],
    relatedSlug: "wait-for-blackwell",
  },
  {
    slug: "wait-for-blackwell",
    path: "wait-for-blackwell",
    title: "We'll wait for Blackwell / the next generation",
    response: `"Waiting for the next generation" is a permanent deferral — the next generation is always 6–18 months away. The question is: what is the opportunity cost of waiting?

**The math on waiting**:
If a team delays 9 months waiting for Blackwell, and they could have been training/fine-tuning/serving on H100/H200 during that period, they've lost 9 months of:
- Model development velocity
- Time-to-market on AI features
- GPU-hour capacity they could have been selling to customers
- Competitive advantage vs. teams who moved now

Blackwell will also command a significant price premium at launch and will have its own lead time issues for the first 12–18 months.

**The H100/H200 is not obsolete**:
H100 SXM5 remains the workhorse of AI infrastructure through 2025–2026. Every major model in production today was trained on or is served on A100/H100. H200's 141GB HBM3e is a meaningful upgrade for inference at scale.

**Transition plan**:
Buying H100/H200 now doesn't lock you out of Blackwell. You can build your infrastructure, start generating ROI immediately, and evaluate Blackwell for the next expansion cycle.`,
    counterPoints: [
      "9 months of lost model development / revenue = quantifiable opportunity cost",
      "Blackwell will have launch premiums and its own lead time for 12–18 months",
      "H100/H200 is not obsolete — every major production model runs on it",
      "Buy now, generate ROI, evaluate Blackwell for next expansion",
      "Certified refurb H100/H200 at 30–60% below new mitigates depreciation risk",
    ],
    relatedSlug: "just-use-cloud",
  },
  {
    slug: "lower-broker-quote",
    path: "lower-quote",
    title: "A broker quoted us lower",
    response: `If a broker quoted lower, there are only a few possibilities:

1. **Uncertified hardware**: No diagnostics, no health report, no warranty, unknown GPU hours. This is the most common case. The price looks attractive because none of the cert work has been done — and none of the risk has been removed.

2. **Export control non-compliance**: Advanced GPU sales are controlled under EAR/BIS regulations. A broker cutting corners on compliance is creating legal liability for the buyer, not just themselves. If NVIDIA's export control program applies and the broker hasn't done proper buyer screening, the buyer could be implicated in a violation.

3. **Different configuration**: Confirm you're comparing apples to apples. Is the broker quoting the same GPU generation, count, and memory? Same OEM platform?

4. **Bait price**: Brokers sometimes quote low to get in the door, then switch to higher-priced inventory or add undisclosed fees.

Ask the buyer to share the broker's health report, warranty documentation, and compliance certification. If they can't produce these, the lower price is a false comparison.

"Cheaper" without certification is like buying a used car without a Carfax or mechanic inspection because the seller quoted $2,000 less. You're not comparing the same product.`,
    counterPoints: [
      "Ask: does the broker quote include a health report and warranty? If not, it's a different product",
      "Uncertified hardware has unknown GPU hours and no diagnostic baseline",
      "Export control compliance: broker shortcuts create buyer liability, not just seller liability",
      "Confirm same configuration (GPU gen, count, OEM platform, memory) before comparing price",
      "Request the broker's serialized traceability documentation — most can't provide it",
    ],
    relatedSlug: "refurb-risky",
  },
];

// ============================================================
// TRAINING MODULE
// ============================================================

const TRAINING_MODULE = {
  title: "GPU Fundamentals for Sales Reps",
  slug: "gpu-fundamentals",
  description: "Master the essential GPU concepts you need to hold a credible conversation with any buyer: memory, compute, interconnects, and workload fit.",
  order: 1,
  questions: [
    {
      question: "An AI startup is training a 70B parameter model in BF16. They ask how much VRAM they need at minimum to fit the model weights alone. What is the correct answer?",
      options: ["70 GB (1 byte per parameter)", "140 GB (2 bytes per parameter in BF16)", "280 GB (4 bytes per parameter)", "700 GB"],
      correctIdx: 1,
      explanation: "BF16 uses 2 bytes per parameter. 70B × 2 bytes = 140 GB. This is just for model weights — you also need memory for activations, optimizer states, and gradients during training, which can 3–4× the requirement.",
      order: 1,
    },
    {
      question: "A buyer is running sustained inference workloads at 80% GPU utilization, 24/7. They're currently paying $3.50/hr per H100 on a cloud provider. Which argument is MOST compelling for owned infrastructure?",
      options: [
        "Owned hardware has better latency",
        "Cloud is unreliable for sustained workloads",
        "TCO: at 80% utilization, owned H100 costs ~$0.50/hr amortized vs. $3.50/hr cloud — payback in ~8 months",
        "New GPUs are faster than cloud instances",
      ],
      correctIdx: 2,
      explanation: "The TCO argument is the strongest for sustained workloads. At 80% utilization, cloud costs 5–7× more than owned infrastructure on a 3-year TCO basis. Payback on certified refurb is typically 6–12 months.",
      order: 2,
    },
    {
      question: "What is MIG (Multi-Instance GPU) and which GPUs support it?",
      options: [
        "A GPU interconnect technology — supported on all data center GPUs",
        "A feature that partitions a single A100 or H100 into up to 7 isolated GPU instances",
        "NVIDIA's memory interleaving technology for HBM3",
        "A data type for FP8 training on Hopper GPUs",
      ],
      correctIdx: 1,
      explanation: "MIG partitions a single A100 or H100 into up to 7 isolated GPU instances, each with dedicated compute, memory, and bandwidth. Useful for multi-tenant inference or running multiple smaller workloads. H100 NVL does NOT support MIG.",
      order: 3,
    },
    {
      question: "A prospect says 'we'll just use the cloud.' Which response is MOST effective?",
      options: [
        "Cloud is unreliable — owned hardware is better",
        "Our hardware is newer and faster than cloud GPUs",
        "Run the TCO: at your utilization level, cloud costs 4–8× more over 3 years. Let me show you the math.",
        "Cloud doesn't support the latest GPU generations",
      ],
      correctIdx: 2,
      explanation: "The strongest response to cloud objections is the TCO calculation. Don't dismiss cloud — acknowledge it works for some cases, then show the math for sustained workloads. Lead with their utilization rate and current cloud spend.",
      order: 4,
    },
    {
      question: "What is the primary difference between the H100 SXM5 and H200 SXM?",
      options: [
        "H200 has a newer compute die (Blackwell) with much higher FLOPS",
        "H200 has the same Hopper compute die but 141GB HBM3e vs 80GB HBM3 — 76% more memory, 43% more bandwidth",
        "H200 supports NVLink 5.0 vs NVLink 4.0 on H100",
        "H200 has lower TDP, making it better for dense deployments",
      ],
      correctIdx: 1,
      explanation: "H200 uses the same GH100 Hopper die as H100 SXM5 — same compute throughput. The difference is memory: 141GB HBM3e at 4.8 TB/s vs 80GB HBM3 at 3.35 TB/s. This matters most for large inference batch sizes and long context lengths.",
      order: 5,
    },
    {
      question: "A buyer asks why export control compliance matters for GPU purchases. What is the accurate, non-alarmist answer?",
      options: [
        "It's just a formality — doesn't affect most buyers",
        "Advanced data center GPUs (A100, H100, H200) are controlled under US Export Administration Regulations. Sales to certain end users, countries, or uses may require a license or be prohibited. A qualified seller does buyer screening to ensure compliance.",
        "Export controls only apply to military buyers",
        "NVIDIA handles export compliance — resellers don't need to worry about it",
      ],
      correctIdx: 1,
      explanation: "Advanced NVIDIA GPUs are EAR-controlled items. Exports to certain destinations and end users are restricted. A serious seller has a formal export control program including supplier qualification and buyer screening. This protects both the seller and the buyer from inadvertent violations.",
      order: 6,
    },
    {
      question: "What does NVLink provide in a multi-GPU server, and why does it matter?",
      options: [
        "Internet connectivity for GPU clusters",
        "High-bandwidth GPU-to-GPU interconnect within a node, enabling models too large to fit on one GPU to be distributed efficiently. NVLink 4.0 (H100/H200) delivers 900 GB/s all-to-all.",
        "A power management protocol for reducing GPU TDP",
        "NVIDIA's cloud networking product",
      ],
      correctIdx: 1,
      explanation: "NVLink is the GPU-to-GPU interconnect within an HGX/DGX system. NVLink 3.0 (A100) = 600 GB/s. NVLink 4.0 (H100/H200) = 900 GB/s. This is critical for tensor-parallel and pipeline-parallel training of large models. PCIe GPUs do NOT have NVLink.",
      order: 7,
    },
    {
      question: "A Condition Grade B certified unit has been described to a buyer. What does Grade B mean?",
      options: [
        "The GPU failed diagnostics but was repaired",
        "Light use, minor cosmetic wear, full certification completed, full warranty",
        "The system was water-damaged but tested functional",
        "Grade B means it is sold AS-IS with no warranty",
      ],
      correctIdx: 1,
      explanation: "Grade B = light use, minor cosmetic wear, full diagnostic certification completed, and full warranty (NVIDIA limited or Velerity seller warranty). It is NOT a reduced-warranty grade — that's Grade C for some configurations. Grade A = like new, <100 GPU hours.",
      order: 8,
    },
  ],
};

// ============================================================
// DEMO ORG DATA
// ============================================================

const DEMO_ACCOUNTS = [
  {
    name: "Apex AI Labs",
    domain: "apexailabs.io",
    industry: "AI-Native Startup",
    hqCountry: "US",
    hqCity: "San Francisco, CA",
    website: "https://apexailabs.io",
    fitScore: 92,
    intentScore: 85,
    notes: "Series B AI startup, $45M raised. Running LLM fine-tuning on cloud, cloud bill ~$180K/mo. Engineering lead mentioned GPU shortage pain on LinkedIn. Strong H100 candidate.",
    isSampleData: true,
  },
  {
    name: "Meridian Financial Technologies",
    domain: "meridiianfintech.com",
    industry: "Financial Services",
    hqCountry: "US",
    hqCity: "New York, NY",
    website: "https://meridianfintech.com",
    fitScore: 78,
    intentScore: 60,
    notes: "Quant hedge fund. Data residency requirements prevent cloud. Looking for A100 FP64 compute for risk simulation. Procurement requires full compliance documentation.",
    isSampleData: true,
  },
  {
    name: "Cascade Genomics",
    domain: "cascadegenomics.com",
    industry: "Healthcare & Life Sciences",
    hqCountry: "US",
    hqCity: "Seattle, WA",
    website: "https://cascadegenomics.com",
    fitScore: 85,
    intentScore: 72,
    notes: "Genomics research company. NIH grant-funded compute expansion. Timeline pressure — grant window closes Q1. HIPAA data prevents cloud.",
    isSampleData: true,
  },
  {
    name: "Ironstack Compute",
    domain: "ironstackcompute.net",
    industry: "GPU Cloud / Neocloud",
    hqCountry: "US",
    hqCity: "Austin, TX",
    website: "https://ironstackcompute.net",
    fitScore: 96,
    intentScore: 90,
    notes: "Neocloud GPU provider, 2 years old. 3 existing Velerity customers referred them. Need 32× H100 SXM5 for new pod. Decision maker is CTO.",
    isSampleData: true,
  },
  {
    name: "Vertex Robotics",
    domain: "vertexrobotics.ai",
    industry: "Autonomous Vehicles & Robotics",
    hqCountry: "US",
    hqCity: "Pittsburgh, PA",
    website: "https://vertexrobotics.ai",
    fitScore: 70,
    intentScore: 55,
    notes: "Early-stage robotics sim company. Series A in progress. GPU needed for simulation pipeline. Budget TBD pending raise.",
    isSampleData: true,
  },
];

const DEMO_CONTACTS = [
  { firstName: "Sarah", lastName: "Chen", title: "VP of Engineering", email: "schen@apexailabs.io", accountIdx: 0 },
  { firstName: "Marcus", lastName: "Webb", title: "CTO", email: "mwebb@apexailabs.io", accountIdx: 0 },
  { firstName: "David", lastName: "Okafor", title: "Head of Quant Infrastructure", email: "dokafor@meridianfintech.com", accountIdx: 1 },
  { firstName: "Lisa", lastName: "Tanaka", title: "Research Director", email: "ltanaka@cascadegenomics.com", accountIdx: 2 },
  { firstName: "Ryan", lastName: "Park", title: "CTO", email: "rpark@ironstackcompute.net", accountIdx: 3 },
  { firstName: "Priya", lastName: "Sharma", title: "Head of Procurement", email: "psharma@ironstackcompute.net", accountIdx: 3 },
  { firstName: "Jordan", lastName: "Mills", title: "Co-Founder & CEO", email: "jmills@vertexrobotics.ai", accountIdx: 4 },
];

async function main() {
  console.log("🌱 Seeding Velerity Sales OS...");

  // ---- GPU Specs ----
  console.log("  → GPU specs...");
  for (const gpu of GPU_SPECS) {
    await prisma.gpuSpec.upsert({
      where: { slug: gpu.slug },
      create: gpu,
      update: gpu,
    });
  }
  console.log(`     ${GPU_SPECS.length} GPU specs seeded`);

  // ---- Platform Specs ----
  console.log("  → Platform specs...");
  const GPU_PLATFORM_MAP: Record<string, string[]> = {
    "dgx-a100": ["a100-80gb-sxm4"],
    "dgx-h100": ["h100-80gb-sxm5"],
    "dgx-h200": ["h200-141gb-sxm"],
    "dell-xe8545": ["a100-80gb-sxm4"],
    "dell-xe9680": ["h100-80gb-sxm5", "h200-141gb-sxm"],
    "hpe-cray-xd670": ["h100-80gb-sxm5", "h200-141gb-sxm"],
    "supermicro-hgx-h100": ["h100-80gb-sxm5", "h200-141gb-sxm"],
    "lenovo-sr675-v3": ["h100-80gb-pcie", "h100-nvl", "h200-nvl"],
    "lenovo-sr680a-v3": ["h100-80gb-sxm5", "h200-141gb-sxm"],
  };

  for (const platform of PLATFORM_SPECS) {
    await prisma.platformSpec.upsert({
      where: { slug: platform.slug },
      create: platform,
      update: platform,
    });

    // Link GPUs
    const gpuSlugs = GPU_PLATFORM_MAP[platform.slug] ?? [];
    const platformRecord = await prisma.platformSpec.findUnique({ where: { slug: platform.slug } });
    if (!platformRecord) continue;

    // Clear existing links and re-create
    await prisma.platformGpu.deleteMany({ where: { platformId: platformRecord.id } });
    for (const gpuSlug of gpuSlugs) {
      const gpu = await prisma.gpuSpec.findUnique({ where: { slug: gpuSlug } });
      if (gpu) {
        await prisma.platformGpu.upsert({
          where: { platformId_gpuSpecId: { platformId: platformRecord.id, gpuSpecId: gpu.id } },
          create: { platformId: platformRecord.id, gpuSpecId: gpu.id },
          update: {},
        });
      }
    }
  }
  console.log(`     ${PLATFORM_SPECS.length} platform specs seeded`);

  // ---- ICP Segments ----
  console.log("  → ICP segments...");
  for (const seg of ICP_SEGMENTS) {
    await prisma.icpSegment.upsert({
      where: { slug: seg.slug },
      create: seg,
      update: seg,
    });
  }
  console.log(`     ${ICP_SEGMENTS.length} ICP segments seeded`);

  // ---- Objections ----
  console.log("  → Objection library...");
  for (const obj of OBJECTIONS) {
    await prisma.objection.upsert({
      where: { slug: obj.slug },
      create: obj,
      update: obj,
    });
  }
  console.log(`     ${OBJECTIONS.length} objections seeded`);

  // ---- Training Module ----
  console.log("  → Training module...");
  const trainingModule = await prisma.trainingModule.upsert({
    where: { slug: TRAINING_MODULE.slug },
    create: {
      title: TRAINING_MODULE.title,
      slug: TRAINING_MODULE.slug,
      description: TRAINING_MODULE.description,
      order: TRAINING_MODULE.order,
    },
    update: {
      title: TRAINING_MODULE.title,
      description: TRAINING_MODULE.description,
    },
  });

  // Clear and re-seed questions
  await prisma.traizQuestion.deleteMany({ where: { moduleId: trainingModule.id } });
  for (const q of TRAINING_MODULE.questions) {
    await prisma.traizQuestion.create({
      data: { ...q, moduleId: trainingModule.id },
    });
  }
  console.log(`     1 training module, ${TRAINING_MODULE.questions.length} questions`);

  // ---- Demo Organization ----
  console.log("  → Demo organization...");
  const existingDemo = await prisma.organization.findUnique({ where: { slug: "demo-velerity" } });
  if (existingDemo) {
    console.log("     Demo org already exists, skipping demo data.");
    console.log("✅ Seed complete.");
    return;
  }

  const demoOrg = await prisma.organization.create({
    data: {
      name: "Velerity Demo",
      slug: "demo-velerity",
      isSampleData: true,
    },
  });

  // Demo user (no Supabase auth — use a placeholder supabaseId)
  const demoUser = await prisma.user.create({
    data: {
      supabaseId: "demo-user-placeholder-id",
      email: "demo@veleritycompute.com",
      name: "Alex Rivera",
      role: "ADMIN",
      orgId: demoOrg.id,
    },
  });

  // Accounts
  const createdAccounts = [];
  for (const acct of DEMO_ACCOUNTS) {
    const created = await prisma.crmAccount.create({
      data: { ...acct, orgId: demoOrg.id },
    });
    createdAccounts.push(created);
  }

  // Contacts
  const createdContacts: { id: string }[] = [];
  for (const contact of DEMO_CONTACTS) {
    const { accountIdx, ...contactData } = contact;
    const created = await prisma.contact.create({
      data: {
        ...contactData,
        orgId: demoOrg.id,
        accountId: createdAccounts[accountIdx].id,
        isSampleData: true,
      },
    });
    createdContacts.push(created);
  }

  // Deals
  const DEMO_DEALS = [
    {
      title: "Apex AI Labs — 16× H100 SXM5",
      stage: "WORKLOAD_QUALIFIED" as const,
      accountIdx: 0,
      contactIdxs: [0, 1],
      targetGpuGeneration: "H100" as const,
      gpuQuantity: 16,
      nodeQuantity: 2,
      workloadType: "LLM Training + Fine-tuning",
      deploymentCountry: "US",
      deploymentSite: "Equinix SV5, San Jose CA",
      powerReadiness: true,
      coolingReadiness: true,
      timeline: "Q1 2026",
      budgetUsd: 3200000,
      competingPaths: ["cloud"],
      valueUsd: 2800000,
    },
    {
      title: "Ironstack Compute — 32× H100 SXM5 Pod",
      stage: "BUYER_COMPLIANCE_SCREENING" as const,
      accountIdx: 3,
      contactIdxs: [4, 5],
      targetGpuGeneration: "H100" as const,
      gpuQuantity: 32,
      nodeQuantity: 4,
      workloadType: "GPU Cloud Hosting",
      deploymentCountry: "US",
      deploymentSite: "QTS Dallas",
      powerReadiness: true,
      coolingReadiness: true,
      timeline: "ASAP",
      budgetUsd: 7000000,
      competingPaths: ["oem"],
      valueUsd: 6400000,
    },
    {
      title: "Meridian FinTech — 8× A100 80GB SXM4",
      stage: "DISCOVERY" as const,
      accountIdx: 1,
      contactIdxs: [2],
      targetGpuGeneration: "A100" as const,
      gpuQuantity: 8,
      nodeQuantity: 1,
      workloadType: "Quant Risk Simulation (FP64)",
      deploymentCountry: "US",
      deploymentSite: "On-prem NYC",
      powerReadiness: null,
      coolingReadiness: null,
      timeline: "Q2 2026",
      budgetUsd: 1200000,
      competingPaths: ["cloud", "broker"],
      valueUsd: 950000,
    },
    {
      title: "Cascade Genomics — 4× A100 80GB PCIe",
      stage: "CONFIGURATION_QUOTE" as const,
      accountIdx: 2,
      contactIdxs: [3],
      targetGpuGeneration: "A100" as const,
      gpuQuantity: 4,
      nodeQuantity: 1,
      workloadType: "Genomics ML / Inference",
      deploymentCountry: "US",
      deploymentSite: "University colo",
      powerReadiness: true,
      coolingReadiness: true,
      timeline: "Q1 2026",
      budgetUsd: 600000,
      competingPaths: ["oem"],
      valueUsd: 480000,
      complianceNotes: "Buyer is US domestic academic institution. Export control screening complete. No restricted parties. Approved to proceed.",
    },
  ];

  for (const deal of DEMO_DEALS) {
    const { accountIdx, contactIdxs, complianceNotes, ...dealData } = deal;

    const isPostCompliance = ["CONFIGURATION_QUOTE", "DOCUMENTATION_REVIEW", "PO_CONTRACT", "FULFILLMENT", "DEPLOYED_EXPANSION"].includes(dealData.stage);

    await prisma.deal.create({
      data: {
        ...dealData,
        orgId: demoOrg.id,
        accountId: createdAccounts[accountIdx].id,
        assignedRepId: demoUser.id,
        isSampleData: true,
        complianceReviewedById: isPostCompliance ? demoUser.id : null,
        complianceReviewedAt: isPostCompliance ? new Date() : null,
        complianceNotes: isPostCompliance ? (complianceNotes ?? "Compliance review completed. No restricted parties identified.") : null,
        contacts: {
          connect: contactIdxs.map((idx) => ({ id: createdContacts[idx].id })),
        },
      },
    });
  }

  // Inventory units
  const DEMO_INVENTORY = [
    {
      serialNumber: "VLR-H100-SXM5-00142",
      oem: "Dell",
      model: "PowerEdge XE9680",
      gpuType: "H100 SXM5 80GB",
      gpuCount: 8,
      conditionGrade: "A" as const,
      certStatus: "CERTIFIED" as const,
      status: "CERTIFIED" as const,
      warrantyType: "SELLER" as const,
      warrantyTermMonths: 12,
      location: "Phoenix, AZ",
      costUsd: 580000,
      listPriceUsd: 780000,
      isSampleData: true,
    },
    {
      serialNumber: "VLR-H100-SXM5-00143",
      oem: "Dell",
      model: "PowerEdge XE9680",
      gpuType: "H100 SXM5 80GB",
      gpuCount: 8,
      conditionGrade: "A" as const,
      certStatus: "CERTIFIED" as const,
      status: "CERTIFIED" as const,
      warrantyType: "SELLER" as const,
      warrantyTermMonths: 12,
      location: "Phoenix, AZ",
      costUsd: 580000,
      listPriceUsd: 780000,
      isSampleData: true,
    },
    {
      serialNumber: "VLR-A100-SXM4-00089",
      oem: "NVIDIA",
      model: "DGX A100",
      gpuType: "A100 80GB SXM4",
      gpuCount: 8,
      conditionGrade: "B" as const,
      certStatus: "CERTIFIED" as const,
      status: "CERTIFIED" as const,
      warrantyType: "SELLER" as const,
      warrantyTermMonths: 12,
      location: "Dallas, TX",
      costUsd: 195000,
      listPriceUsd: 260000,
      isSampleData: true,
    },
    {
      serialNumber: "VLR-H100-SXM5-00198",
      oem: "Supermicro",
      model: "HGX H100 8-GPU",
      gpuType: "H100 SXM5 80GB",
      gpuCount: 8,
      conditionGrade: "A" as const,
      certStatus: "TESTING" as const,
      status: "TESTING" as const,
      warrantyType: null,
      warrantyTermMonths: null,
      location: "Phoenix, AZ",
      costUsd: 560000,
      listPriceUsd: null,
      isSampleData: true,
    },
  ];

  for (const unit of DEMO_INVENTORY) {
    await prisma.inventoryUnit.create({
      data: { ...unit, orgId: demoOrg.id },
    });
  }

  console.log(`     Demo org created: ${demoOrg.name}`);
  console.log(`     ${DEMO_ACCOUNTS.length} accounts, ${DEMO_CONTACTS.length} contacts, ${DEMO_DEALS.length} deals, ${DEMO_INVENTORY.length} inventory units`);
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
