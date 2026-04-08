import { prisma } from "../../lib/prisma";

export function getReminders() {
  return prisma.reminder.findMany({ orderBy: { deadline: "asc" } });
}

export function createReminder(data: { type?: string; title: string; notes?: string; subject?: string; url?: string; deadline: Date }) {
  return prisma.reminder.create({ data });
}

export function updateReminder(
  id: string,
  data: { title?: string; notes?: string; subject?: string; url?: string; deadline?: Date; completed?: boolean },
) {
  return prisma.reminder.update({ where: { id }, data });
}

export function deleteReminder(id: string) {
  return prisma.reminder.delete({ where: { id } });
}
