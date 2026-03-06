import { Request, Response } from "express";
import * as blogService from "./blog.service";

export async function listPosts(req: Request, res: Response) {
  try {
    const publishedOnly = req.query.published === "true";
    const slug = req.query.slug as string | undefined;
    const posts = await blogService.listPosts(publishedOnly, slug);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

export async function getPost(req: Request, res: Response) {
  try {
    const post = await blogService.getPost(req.params.id as string);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const post = await blogService.createPost(req.body);
    res.status(201).json(post);
  } catch (err: any) {
    console.error("createPost error:", err);
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Slug already exists" });
    }
    res.status(500).json({ error: "Failed to create post" });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const post = await blogService.updatePost(req.params.id as string, req.body);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    await blogService.deletePost(req.params.id as string);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
}
