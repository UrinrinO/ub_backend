import { Router } from "express";
import * as c from "./resources.controller";

const router = Router();

router.get("/", c.list);
router.post("/", c.create);

router.get("/categories", c.listCategories);
router.post("/categories", c.createCategory);
router.put("/categories/:id", c.updateCategory);
router.delete("/categories/:id", c.removeCategory);

router.post("/:resourceId/tasks", c.createTask);
router.put("/tasks/:taskId", c.updateTask);
router.delete("/tasks/:taskId", c.removeTask);

router.post("/:resourceId/notes", c.createNote);
router.put("/notes/:noteId", c.updateNote);
router.delete("/notes/:noteId", c.removeNote);

router.put("/:id", c.update);
router.delete("/:id", c.remove);

export default router;
