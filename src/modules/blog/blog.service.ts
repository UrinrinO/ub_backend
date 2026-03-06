import { prisma } from "../../lib/prisma";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function listPosts(publishedOnly = false, slug?: string) {
  return prisma.blogPost.findMany({
    where: {
      ...(publishedOnly ? { published: true } : {}),
      ...(slug ? { slug } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPost(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export async function createPost(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  tags?: string[];
  img?: string;
  published?: boolean;
  featured?: boolean;
}) {
  const slug = data.slug?.trim() || slugify(data.title);
  return prisma.blogPost.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt ?? "",
      content: data.content,
      tags: data.tags ?? [],
      img: data.img ?? "",
      published: data.published ?? false,
      featured: data.featured ?? false,
    },
  });
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    img?: string;
    published?: boolean;
    featured?: boolean;
  }
) {
  return prisma.blogPost.update({ where: { id }, data });
}

export async function deletePost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}
