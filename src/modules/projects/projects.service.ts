import { prisma } from "../../lib/prisma";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function listProjects(publishedOnly = false, slug?: string) {
  return prisma.project.findMany({
    where: {
      ...(publishedOnly ? { published: true } : {}),
      ...(slug ? { slug } : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

export async function createProject(data: {
  title: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  img?: string;
  featured?: boolean;
  published?: boolean;
}) {
  const slug = data.slug?.trim() || slugify(data.title);
  return prisma.project.create({
    data: {
      title: data.title,
      slug,
      description: data.description ?? "",
      excerpt: data.excerpt ?? "",
      content: data.content ?? "",
      tags: data.tags ?? [],
      img: data.img ?? "",
      featured: data.featured ?? false,
      published: data.published ?? false,
    },
  });
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    img?: string;
    featured?: boolean;
    published?: boolean;
  }
) {
  return prisma.project.update({ where: { id }, data });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
