import { Request, Response } from "express";
import * as projectsService from "./projects.service";

export async function listProjects(req: Request, res: Response) {
  try {
    const publishedOnly = req.query.published === "true";
    const slug = req.query.slug as string | undefined;
    const projects = await projectsService.listProjects(publishedOnly, slug);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const project = await projectsService.getProject(req.params.id as string);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch project" });
  }
}

export async function createProject(req: Request, res: Response) {
  try {
    const project = await projectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    const project = await projectsService.updateProject(req.params.id as string, req.body);
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    await projectsService.deleteProject(req.params.id as string);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
}
