import { prisma } from "../../lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Series ───────────────────────────────────────────────────────────────────

export async function listSeries(publishedOnly = false) {
  return prisma.notesSeries.findMany({
    where: publishedOnly ? { published: true } : {},
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      parts: {
        where: publishedOnly ? { published: true } : {},
        orderBy: { partNumber: "asc" },
        select: { id: true, slug: true, title: true, partNumber: true, published: true, createdAt: true },
      },
    },
  });
}

export async function getSeriesBySlug(slug: string, publishedOnly = false) {
  return prisma.notesSeries.findUnique({
    where: { slug },
    include: {
      parts: {
        where: publishedOnly ? { published: true } : {},
        orderBy: { partNumber: "asc" },
      },
    },
  });
}

export async function getSeriesById(id: string) {
  return prisma.notesSeries.findUnique({
    where: { id },
    include: { parts: { orderBy: { partNumber: "asc" } } },
  });
}

export async function createSeries(data: {
  title: string;
  slug?: string;
  tagline?: string;
  description?: string;
  tags?: string[];
  published?: boolean;
  order?: number;
}) {
  const slug = data.slug?.trim() || slugify(data.title);
  return prisma.notesSeries.create({
    data: {
      slug,
      title: data.title,
      tagline: data.tagline ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      published: data.published ?? false,
      order: data.order ?? 0,
    },
  });
}

export async function updateSeries(id: string, data: {
  title?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  tags?: string[];
  published?: boolean;
  order?: number;
}) {
  return prisma.notesSeries.update({ where: { id }, data });
}

export async function deleteSeries(id: string) {
  return prisma.notesSeries.delete({ where: { id } });
}

// ─── Parts ────────────────────────────────────────────────────────────────────

export async function getPartBySlug(seriesSlug: string, partSlug: string, publishedOnly = false) {
  const series = await prisma.notesSeries.findUnique({
    where: { slug: seriesSlug, ...(publishedOnly ? { published: true } : {}) },
  });
  if (!series) return null;
  return prisma.notesPart.findUnique({
    where: {
      seriesId_slug: { seriesId: series.id, slug: partSlug },
      ...(publishedOnly ? { published: true } : {}),
    },
    include: { series: true },
  });
}

export async function getPartById(id: string) {
  return prisma.notesPart.findUnique({ where: { id }, include: { series: true } });
}

export async function createPart(data: {
  seriesId: string;
  title: string;
  slug?: string;
  content?: string;
  partNumber: number;
  published?: boolean;
}) {
  const slug = data.slug?.trim() || slugify(data.title);
  return prisma.notesPart.create({
    data: {
      seriesId: data.seriesId,
      slug,
      title: data.title,
      content: data.content ?? "",
      partNumber: data.partNumber,
      published: data.published ?? false,
    },
  });
}

export async function updatePart(id: string, data: {
  title?: string;
  slug?: string;
  content?: string;
  partNumber?: number;
  published?: boolean;
}) {
  return prisma.notesPart.update({ where: { id }, data });
}

export async function deletePart(id: string) {
  return prisma.notesPart.delete({ where: { id } });
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

const SENTINEL_CONTENT = `# From Notebook Chaos to an ML Platform

If you've ever built machine learning models in notebooks, you probably know the feeling.

You train a model. It works. You tweak a few parameters. Accuracy changes. A week later… you have no idea why. Was it the data? The parameters? The model? Or something else entirely?

This is the exact moment where machine learning stops being "model building" and becomes **systems engineering**.

In this article, I walk through how I began building a real ML training platform from scratch — not a notebook, not a tutorial model, but a **reproducible machine learning system** that resembles the architecture used by real ML teams.

## The End Goal: A Production ML Platform

Before writing a single line of code, I defined the architecture I wanted to build. The goal is not simply to train a model. The goal is to build a **machine learning lifecycle**:

\`\`\`
Data Version → Feature Pipeline → Training Pipeline → Experiment Tracking → Model Registry → Inference Service → Monitoring → Retraining
\`\`\`

This is the architecture used in platforms like MLflow, SageMaker, Vertex AI, and internal ML platforms at companies like Uber and Netflix.

## Step 1 — Designing the Repository Like an ML Platform

The very first thing I did was avoid the most common ML mistake: **dumping everything into notebooks**. Instead, I created a structured repository:

\`\`\`
ml-platform/
  training/       # model training pipeline
  features/       # reusable feature engineering
  serving/        # inference API
  experiments/    # experiment history
  models/         # trained model artifacts
  configs/        # experiment configurations
  scripts/        # executable pipeline commands
  tests/
  data/           # versioned datasets
\`\`\`

This separation is the foundation of maintainable ML systems.

## Step 2 — Building a Reproducible Training Pipeline

Instead of hardcoding parameters, we introduced **configuration-driven training**:

\`\`\`yaml
dataset:
  version: dataset_v1
training:
  test_size: 0.2
  random_state: 42
\`\`\`

The training pipeline follows this flow:

\`\`\`
scripts/train.sh → training/train.py → load config → load dataset version → train → evaluate → save artifact
\`\`\`

Training is no longer tied to code alone — it's tied to **configuration + data version**.

## Step 3 — Deterministic Train/Test Splitting

Many tutorials use \`train_test_split()\` without considering what happens as the dataset grows. New rows can shift which samples land in training vs. test — making evaluation metrics untrustworthy.

We implemented **deterministic splitting using hashed identifiers**:

1. Each data point has a stable ID
2. That ID is hashed
3. The hash determines train or test membership

Because the ID is stable, the split is stable. New rows can be added safely without contaminating the test set. This is a technique described in *Hands-On Machine Learning* and used in real ML pipelines.

## Step 4 — Experiment Tracking

Every training run now records:

\`\`\`
timestamp, dataset_version, params, metric
2026-03-07, dataset_v1, {"test_size": 0.2}, 0.9469
\`\`\`

Stored in \`experiments/runs.csv\`, this simple log lets us answer:

- Which parameters produced the best model?
- Did performance change because of the dataset?
- What changed between two runs?

This is conceptually the same idea behind MLflow experiments — built from scratch.

## Step 5 — Dataset Versioning

Without versioning, you can't explain why Run A produced 0.94 accuracy and Run B produced 0.89.

We created a versioned dataset store:

\`\`\`
data/versions/
  dataset_v1.parquet
  dataset_v2.parquet
\`\`\`

Each dataset version is **immutable**. Training pipelines explicitly declare which version they use. Every experiment is fully reproducible.

## Step 6 — Building a Model Registry

Originally models were saved as \`models/model.pkl\` — meaning each run overwrote the previous one. We replaced this with a **Model Registry**:

\`\`\`
models/registry/
  model_v1/
    model.pkl
    metadata.json
  model_v2/
    ...
\`\`\`

Each \`metadata.json\` records the dataset version, training parameters, evaluation metric, and timestamp. This gives us **full model lineage** — traceable from dataset → experiment → model.

## What We Have Now

At this point the system supports:

- Dataset Versioning
- Deterministic Data Splitting
- Experiment Tracking
- Model Artifacts
- Model Registry

The pipeline looks like this:

\`\`\`
Data Version → Training Pipeline → Evaluation → Experiment Tracking → Model Registry
\`\`\`

## Why This Matters

Many people learn ML by focusing on algorithms. But real ML systems fail far more often because of data leakage, unreproducible experiments, overwritten models, and inconsistent datasets. The work here solves those problems early — and builds the **engineering habits required for production ML systems**.

## What's Next

Right now the system can train and version models. But models aren't useful until they can make predictions.

The next step is the **Inference Layer** — a serving API inside \`serving/\` that loads the latest registered model, accepts input features, and returns predictions. This will connect:

\`\`\`
Model Registry → Inference Service
\`\`\`

---

*Machine learning becomes truly powerful when models are treated not as experiments, but as systems that evolve over time. What we built here is the beginning of that system.*`;

export async function seedSentinelSeries() {
  const existing = await prisma.notesSeries.findUnique({ where: { slug: "sentinel-ml" } });
  if (existing) return;

  const series = await prisma.notesSeries.create({
    data: {
      slug: "sentinel-ml",
      title: "Sentinel ML — Fraud Detection System",
      tagline: "Sentinel ML is a cloud-native machine learning platform for real-time anomaly detection, model lifecycle management, and automated retraining.",
      description: "A step-by-step build log of a production ML platform — from raw notebooks to a full lifecycle system with experiment tracking, model registry, inference serving, and automated retraining on Azure.",
      tags: ["MLOps", "Machine Learning", "Python", "Azure", "System Design"],
      published: true,
      order: 0,
    },
  });

  await prisma.notesPart.create({
    data: {
      seriesId: series.id,
      slug: "part-1-training-system",
      title: "From Notebook Chaos to an ML Platform: Building a Real Training System",
      content: SENTINEL_CONTENT,
      partNumber: 1,
      published: true,
    },
  });
}
