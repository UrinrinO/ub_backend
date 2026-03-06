import { Router } from "express";
import * as blogController from "./blog.controller";

const router = Router();

router.get("/", blogController.listPosts);
router.post("/", blogController.createPost);
router.get("/:id", blogController.getPost);
router.put("/:id", blogController.updatePost);
router.delete("/:id", blogController.deletePost);

export default router;
