import type { Request, Response } from "express";
import * as svc from "./resources.service";
import type { ResourceType, ResourceStatus } from "@prisma/client";

export async function list(req: Request, res: Response) {
  const { category, completed, type } = req.query;
  const resources = await svc.getResources({
    category: category as string | undefined,
    completed: completed !== undefined ? completed === "true" : undefined,
    type: type as ResourceType | undefined,
  });
  res.json(resources);
}

export async function create(req: Request, res: Response) {
  const { title, url, description, category, type, tags } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "title is required" });
  if (!category?.trim()) return res.status(400).json({ error: "category is required" });

  const resource = await svc.createResource({
    title: title.trim(),
    url: url?.trim() || null,
    description: description?.trim() || undefined,
    category: category.trim().toUpperCase(),
    type: type as ResourceType | undefined,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
  });
  res.json(resource);
}

export async function update(req: Request, res: Response) {
  const id = String(req.params.id);
  const { title, url, description, category, type, completed, tags } = req.body;
  const resource = await svc.updateResource(id, {
    title: title?.trim(),
    url: url !== undefined ? (url?.trim() || null) : undefined,
    description: description?.trim(),
    category: category ? category.trim().toUpperCase() : undefined,
    type: type as ResourceType | undefined,
    completed: completed !== undefined ? Boolean(completed) : undefined,
    tags: Array.isArray(tags) ? tags : undefined,
  });
  res.json(resource);
}

export async function remove(req: Request, res: Response) {
  const id = String(req.params.id);
  await svc.deleteResource(id);
  res.json({ ok: true });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function listCategories(req: Request, res: Response) {
  const categories = await svc.getCategories();
  res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  const { key, label } = req.body;
  if (!key || !label) {
    return res.status(400).json({ error: "key and label are required" });
  }
  const category = await svc.createCategory({
    key: String(key).trim().toUpperCase().replace(/\s+/g, "_"),
    label: String(label).trim(),
  });
  res.json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const id = String(req.params.id);
  const { key, label, active, order } = req.body;
  const category = await svc.updateCategory(id, {
    key: key ? String(key).trim().toUpperCase().replace(/\s+/g, "_") : undefined,
    label: label ? String(label).trim() : undefined,
    active: active !== undefined ? Boolean(active) : undefined,
    order: order !== undefined ? Number(order) : undefined,
  });
  res.json(category);
}

export async function removeCategory(req: Request, res: Response) {
  const id = String(req.params.id);
  await svc.deleteCategory(id);
  res.json({ ok: true });
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export async function createTask(req: Request, res: Response) {
  const resourceId = String(req.params.resourceId);
  const { title, notes } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "title is required" });

  const task = await svc.createTask(resourceId, {
    title: title.trim(),
    notes: notes?.trim() || undefined,
  });
  res.json(task);
}

export async function updateTask(req: Request, res: Response) {
  const id = String(req.params.taskId);
  const { title, notes, completed, order } = req.body;
  const task = await svc.updateTask(id, {
    title: title?.trim(),
    notes: notes !== undefined ? notes : undefined, // Allow empty string
    completed: completed !== undefined ? Boolean(completed) : undefined,
    order: order !== undefined ? Number(order) : undefined,
  });
  res.json(task);
}

export async function removeTask(req: Request, res: Response) {
  const id = String(req.params.taskId);
  await svc.deleteTask(id);
  res.json({ ok: true });
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export async function createNote(req: Request, res: Response) {
  const resourceId = String(req.params.resourceId);
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "content is required" });

  const note = await svc.createNote(resourceId, {
    content: content.trim(),
  });
  res.json(note);
}

export async function updateNote(req: Request, res: Response) {
  const id = String(req.params.noteId);
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "content is required" });

  const note = await svc.updateNote(id, {
    content: content.trim(),
  });
  res.json(note);
}

export async function removeNote(req: Request, res: Response) {
  const id = String(req.params.noteId);
  await svc.deleteNote(id);
  res.json({ ok: true });
}
