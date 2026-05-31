import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const targets = await prisma.reminder.findMany({
    where: {
      type: "EXAM",
      completed: false,
      OR: [
        { title: { contains: "IELTS General Training", mode: "insensitive" } },
        { title: { contains: "MLOps", mode: "insensitive" } },
        { title: { contains: "Machine Learning Operations", mode: "insensitive" } },
      ],
    },
  });

  if (targets.length === 0) {
    console.log("No matching exams found — listing all active exams:");
    const all = await prisma.reminder.findMany({ where: { type: "EXAM", completed: false } });
    all.forEach((r) => console.log(`  [${r.id}] ${r.title} — ${r.deadline.toDateString()}`));
    return;
  }

  for (const exam of targets) {
    await prisma.reminder.update({ where: { id: exam.id }, data: { paused: true } });
    console.log(`✓ Paused: "${exam.title}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
