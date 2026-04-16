import { prisma } from "../../lib/prisma";
import type { ResourceType } from "@prisma/client";

export function getResources(filters?: { category?: string; completed?: boolean; type?: ResourceType }) {
  return prisma.resource.findMany({
    where: {
      ...(filters?.category ? { category: filters.category } : {}),
      ...(filters?.completed !== undefined ? { completed: filters.completed } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
    },
    include: {
      tasks: {
        orderBy: { order: "asc" }
      },
      notes: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export function createResource(data: {
  title: string;
  url: string;
  description?: string;
  category: string;
  type?: ResourceType;
  tags?: string[];
}) {
  return prisma.resource.create({
    data: {
      title: data.title,
      url: data.url,
      description: data.description,
      category: data.category,
      type: data.type ?? "OTHER",
      tags: data.tags ?? [],
    },
    include: {
      tasks: true,
      notes: { orderBy: { createdAt: "asc" } },
    }
  });
}

export function updateResource(
  id: string,
  data: {
    title?: string;
    url?: string;
    description?: string;
    category?: string;
    type?: ResourceType;
    completed?: boolean;
    tags?: string[];
  },
) {
  return prisma.resource.update({ 
    where: { id }, 
    data,
    include: { 
      tasks: { orderBy: { order: "asc" } },
      notes: { orderBy: { createdAt: "asc" } },
    } 
  });
}

export function deleteResource(id: string) {
  return prisma.resource.delete({ where: { id } });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function getCategories() {
  return prisma.resourceCategory.findMany({
    orderBy: { order: "asc" },
  });
}

export function createCategory(data: { key: string; label: string }) {
  return prisma.resourceCategory.create({
    data: {
      key: data.key,
      label: data.label,
    },
  });
}

export function updateCategory(id: string, data: { label?: string; key?: string; active?: boolean; order?: number }) {
  return prisma.resourceCategory.update({
    where: { id },
    data,
  });
}

export function deleteCategory(id: string) {
  return prisma.resourceCategory.delete({ where: { id } });
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

export function createTask(resourceId: string, data: { title: string; notes?: string }) {
  return prisma.resourceTask.create({
    data: {
      resourceId,
      title: data.title,
      notes: data.notes,
    },
  });
}

export function updateTask(id: string, data: { title?: string; notes?: string; completed?: boolean; order?: number }) {
  return prisma.resourceTask.update({
    where: { id },
    data,
  });
}

export function deleteTask(id: string) {
  return prisma.resourceTask.delete({ where: { id } });
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export function createNote(resourceId: string, data: { content: string }) {
  return prisma.resourceNote.create({
    data: {
      resourceId,
      content: data.content,
    },
  });
}

export function updateNote(id: string, data: { content: string }) {
  return prisma.resourceNote.update({
    where: { id },
    data,
  });
}

export function deleteNote(id: string) {
  return prisma.resourceNote.delete({ where: { id } });
}
