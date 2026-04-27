import { Router } from "express";
import * as c from "./tracker.controller";

const router = Router();

router.get("/session", c.getSession);
router.post("/clock-in", c.clockIn);
router.post("/pause", c.pause);
router.post("/resume", c.resume);
router.post("/clock-out", c.clockOut);
router.post("/abandon", c.abandonSession);

router.get("/week", c.getWeekReport);
router.get("/week/export", c.exportWeekReport);

router.get("/all-time", c.getAllTimeStats);

router.get("/weekly-report", c.getWeeklyReport);
router.put("/weekly-report", c.upsertWeeklyReport);

router.get("/categories", c.getCategories);
router.post("/categories", c.createCategory);
router.put("/categories/:id", c.updateCategory);
router.delete("/categories/:id", c.deleteCategory);

router.get("/sessions/:sessionId/notes", c.getSessionNotes);
router.post("/sessions/:sessionId/notes", c.addSessionNote);
router.put("/sessions/:sessionId/duration", c.adjustSessionDuration);
router.delete("/notes/:id", c.deleteSessionNote);

export default router;