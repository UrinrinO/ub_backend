import { Router } from "express";
import * as projectsController from "./projects.controller";

const router = Router();

router.get("/", projectsController.listProjects);
router.post("/", projectsController.createProject);
router.get("/:id", projectsController.getProject);
router.put("/:id", projectsController.updateProject);
router.delete("/:id", projectsController.deleteProject);

export default router;
