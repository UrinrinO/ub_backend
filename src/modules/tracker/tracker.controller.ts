import type { Request, Response } from "express";
import * as svc from "./tracker.service";
import { buildMarkdownReport } from "./tracker.report";

const USER_ID = "single-user"; // V1: hardcode (or create user row on boot)

export async function getSession(_: Request, res: Response) {
  const session = await svc.getActiveSession(USER_ID);
  res.json(session ?? null);
}

export async function getAllTimeStats(_: Request, res: Response) {
  const stats = await svc.getAllTimeStats(USER_ID);
  res.json(stats);
}

export async function clockIn(req: Request, res: Response) {
  const { category } = req.body;
  const session = await svc.clockIn(USER_ID, category);
  res.json(session);
}

export async function pause(_: Request, res: Response) {
  const session = await svc.pause(USER_ID);
  res.json(session);
}

export async function resume(_: Request, res: Response) {
  const session = await svc.resume(USER_ID);
  res.json(session);
}

export async function clockOut(req: Request, res: Response) {
  const { workedOn, output, difficulty, focus } = req.body;
  const session = await svc.clockOut(USER_ID, { workedOn, output, difficulty, focus });
  res.json(session);
}

export async function abandonSession(_: Request, res: Response) {
  await svc.abandonSession(USER_ID);
  res.json({ ok: true });
}

export async function getWeekReport(req: Request, res: Response) {
  const start = String(req.query.start); // YYYY-MM-DD (Monday, ideally)
  const report = await svc.getWeekReport(USER_ID, start);
  res.json(report);
}

export async function getWeeklyReport(req: Request, res: Response) {
  const week = String(req.query.week);
  const [sessions, report] = await Promise.all([
    svc.getWeekReport(USER_ID, week),
    svc.getWeeklyReport(week),
  ]);
  res.json({ sessions, report: report ?? null });
}

export async function upsertWeeklyReport(req: Request, res: Response) {
  const week = String(req.query.week);
  const { weekNumber, notes } = req.body;
  const report = await svc.upsertWeeklyReport(week, weekNumber, notes ?? {});
  res.json(report);
}

export async function getCategories(_: Request, res: Response) {
  const cats = await svc.getAllCategories();
  res.json(cats);
}

export async function createCategory(req: Request, res: Response) {
  const { key, label, targetMinutes } = req.body;
  const cat = await svc.createCategory({ key, label, targetMinutes: Number(targetMinutes) || 0 });
  res.json(cat);
}

export async function updateCategory(req: Request, res: Response) {
  const id = String(req.params.id);
  const { label, targetMinutes, active, order } = req.body;
  const cat = await svc.updateCategory(id, { label, targetMinutes, active, order });
  res.json(cat);
}

export async function deleteCategory(req: Request, res: Response) {
  const id = String(req.params.id);
  await svc.deleteCategory(id);
  res.json({ ok: true });
}

export async function addSessionNote(req: Request, res: Response) {
  const sessionId = String(req.params.sessionId);
  const { content, url } = req.body;
  const note = await svc.addSessionNote(sessionId, { content, url });
  res.json(note);
}

export async function getSessionNotes(req: Request, res: Response) {
  const sessionId = String(req.params.sessionId);
  const notes = await svc.getSessionNotes(sessionId);
  res.json(notes);
}

export async function deleteSessionNote(req: Request, res: Response) {
  const id = String(req.params.id);
  await svc.deleteSessionNote(id);
  res.json({ ok: true });
}

export async function adjustSessionDuration(req: Request, res: Response) {
  const sessionId = String(req.params.sessionId);
  const minutes = Number(req.body.minutes);
  const session = await svc.adjustSessionDuration(USER_ID, sessionId, minutes);
  res.json(session);
}

export async function exportWeekReport(req: Request, res: Response) {
  const start = String(req.query.start);
  const format = (String(req.query.format || "md") as "md" | "text");

  const report = await svc.getWeekReport(USER_ID, start);
  const md = buildMarkdownReport(report);

  if (format === "text") return res.type("text/plain").send(md);
  return res.type("text/markdown").send(md);
}