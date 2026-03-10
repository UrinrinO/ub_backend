import { Request, Response } from "express";
import * as notesService from "./notes.service";

// ─── Series ───────────────────────────────────────────────────────────────────

export async function listSeries(req: Request, res: Response) {
  try {
    const publishedOnly = req.query.published === "true";
    res.json(await notesService.listSeries(publishedOnly));
  } catch {
    res.status(500).json({ error: "Failed to fetch series" });
  }
}

export async function getSeriesBySlug(req: Request, res: Response) {
  try {
    const publishedOnly = req.query.published === "true";
    const series = await notesService.getSeriesBySlug(String(req.params.slug), publishedOnly);
    if (!series) return res.status(404).json({ error: "Series not found" });
    res.json(series);
  } catch {
    res.status(500).json({ error: "Failed to fetch series" });
  }
}

export async function getSeriesById(req: Request, res: Response) {
  try {
    const series = await notesService.getSeriesById(String(req.params.id));
    if (!series) return res.status(404).json({ error: "Series not found" });
    res.json(series);
  } catch {
    res.status(500).json({ error: "Failed to fetch series" });
  }
}

export async function createSeries(req: Request, res: Response) {
  try {
    const series = await notesService.createSeries(req.body);
    res.status(201).json(series);
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ error: "Slug already exists" });
    res.status(500).json({ error: "Failed to create series" });
  }
}

export async function updateSeries(req: Request, res: Response) {
  try {
    res.json(await notesService.updateSeries(String(req.params.id), req.body));
  } catch {
    res.status(500).json({ error: "Failed to update series" });
  }
}

export async function deleteSeries(req: Request, res: Response) {
  try {
    await notesService.deleteSeries(String(req.params.id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete series" });
  }
}

// ─── Parts ────────────────────────────────────────────────────────────────────

export async function getPartBySlug(req: Request, res: Response) {
  try {
    const publishedOnly = req.query.published === "true";
    const part = await notesService.getPartBySlug(
      String(req.params.seriesSlug),
      String(req.params.partSlug),
      publishedOnly,
    );
    if (!part) return res.status(404).json({ error: "Part not found" });
    res.json(part);
  } catch {
    res.status(500).json({ error: "Failed to fetch part" });
  }
}

export async function getPartById(req: Request, res: Response) {
  try {
    const part = await notesService.getPartById(String(req.params.id));
    if (!part) return res.status(404).json({ error: "Part not found" });
    res.json(part);
  } catch {
    res.status(500).json({ error: "Failed to fetch part" });
  }
}

export async function createPart(req: Request, res: Response) {
  try {
    const part = await notesService.createPart(req.body);
    res.status(201).json(part);
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ error: "Slug already exists in this series" });
    res.status(500).json({ error: "Failed to create part" });
  }
}

export async function updatePart(req: Request, res: Response) {
  try {
    res.json(await notesService.updatePart(String(req.params.id), req.body));
  } catch {
    res.status(500).json({ error: "Failed to update part" });
  }
}

export async function deletePart(req: Request, res: Response) {
  try {
    await notesService.deletePart(String(req.params.id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete part" });
  }
}
