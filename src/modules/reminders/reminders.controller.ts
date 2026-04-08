import type { Request, Response } from "express";
import * as svc from "./reminders.service";

export async function list(_: Request, res: Response) {
  const reminders = await svc.getReminders();
  res.json(reminders);
}

export async function create(req: Request, res: Response) {
  const { type, title, notes, subject, url, deadline } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "title is required" });
  if (!deadline) return res.status(400).json({ error: "deadline is required" });
  const reminder = await svc.createReminder({
    type: type || "REMINDER",
    title: title.trim(),
    notes: notes?.trim() || undefined,
    subject: subject?.trim() || undefined,
    url: url?.trim() || undefined,
    deadline: new Date(deadline),
  });
  res.json(reminder);
}

export async function update(req: Request, res: Response) {
  const id = String(req.params.id);
  const { title, notes, subject, url, deadline, completed } = req.body;
  const reminder = await svc.updateReminder(id, {
    title: title?.trim(),
    notes: notes?.trim(),
    subject: subject?.trim(),
    url: url?.trim(),
    deadline: deadline ? new Date(deadline) : undefined,
    completed,
  });
  res.json(reminder);
}

export async function remove(req: Request, res: Response) {
  const id = String(req.params.id);
  await svc.deleteReminder(id);
  res.json({ ok: true });
}
