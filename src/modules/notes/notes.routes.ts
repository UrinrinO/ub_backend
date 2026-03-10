import { Router } from "express";
import * as ctrl from "./notes.controller";

const router = Router();

// Series
router.get("/", ctrl.listSeries);
router.post("/", ctrl.createSeries);
router.get("/id/:id", ctrl.getSeriesById);
router.put("/id/:id", ctrl.updateSeries);
router.delete("/id/:id", ctrl.deleteSeries);
router.get("/:slug", ctrl.getSeriesBySlug);

// Parts
router.post("/id/:id/parts", ctrl.createPart);
router.get("/parts/:id", ctrl.getPartById);
router.put("/parts/:id", ctrl.updatePart);
router.delete("/parts/:id", ctrl.deletePart);
router.get("/:seriesSlug/:partSlug", ctrl.getPartBySlug);

export default router;
