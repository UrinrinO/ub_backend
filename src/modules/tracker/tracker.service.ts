import { prisma } from "../../lib/prisma";
import { SessionStatus } from "@prisma/client";

const DEFAULT_CATEGORIES = [
  { key: "JOB_APPLICATIONS", label: "Job Applications", targetMinutes: 120, order: 0 },
  { key: "ALGORITHMS",       label: "Algorithms",        targetMinutes: 300, order: 1 },
  { key: "ML_THEORY",        label: "ML Theory",          targetMinutes: 180, order: 2 },
  { key: "ML_PLATFORM",      label: "ML Platform",        targetMinutes: 180, order: 3 },
  { key: "SYSTEM_DESIGN",    label: "System Design",      targetMinutes: 60,  order: 4 },
  { key: "READING",          label: "Reading",            targetMinutes: 0,   order: 5 },
  { key: "MOCK_INTERVIEW",   label: "Mock Interview",     targetMinutes: 0,   order: 6 },
  { key: "MLOPS_CERT",       label: "MLOps Cert",         targetMinutes: 180, order: 7 },
];

export async function seedDefaultCategories() {
  const count = await prisma.trackerCategory.count();
  if (count > 0) return;
  await prisma.trackerCategory.createMany({ data: DEFAULT_CATEGORIES });
}

export async function getCategories() {
  return prisma.trackerCategory.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllCategories() {
  return prisma.trackerCategory.findMany({ orderBy: { order: "asc" } });
}

export async function createCategory(data: { key: string; label: string; targetMinutes: number }) {
  const key = data.key.toUpperCase().replace(/\s+/g, "_");
  const maxOrder = await prisma.trackerCategory.aggregate({ _max: { order: true } });
  return prisma.trackerCategory.create({
    data: { key, label: data.label, targetMinutes: data.targetMinutes, order: (maxOrder._max.order ?? 0) + 1 },
  });
}

export async function updateCategory(id: string, data: { label?: string; targetMinutes?: number; active?: boolean; order?: number }) {
  return prisma.trackerCategory.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.trackerCategory.delete({ where: { id } });
}

function parseCategory(input: string): string {
  if (!input) throw new Error("category is required");
  return input;
}

function weekRange(startYYYYMMDD: string) {
  // start date inclusive, +7 days exclusive
  const start = new Date(`${startYYYYMMDD}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid start date");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

function minutesBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}

export async function ensureUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });
}

export async function getActiveSession(userId: string) {
  return prisma.workSession.findFirst({
    where: {
      userId,
      status: { in: [SessionStatus.ACTIVE, SessionStatus.PAUSED] },
    },
    include: {
      segments: { orderBy: { startTime: "asc" } },
      notes: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function addSessionNote(sessionId: string, data: { content: string; url?: string }) {
  return prisma.sessionNote.create({ data: { sessionId, ...data } });
}

export async function getSessionNotes(sessionId: string) {
  return prisma.sessionNote.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteSessionNote(id: string) {
  return prisma.sessionNote.delete({ where: { id } });
}

export async function clockIn(userId: string, categoryInput: string) {
  await ensureUser(userId);

  const existing = await getActiveSession(userId);
  if (existing)
    throw new Error(
      "You already have an active/paused session. Clock it out first.",
    );

  const category = parseCategory(categoryInput);

  return prisma.workSession.create({
    data: {
      userId,
      category,
      status: SessionStatus.ACTIVE,
      segments: {
        create: { startTime: new Date() },
      },
    },
    include: { segments: true },
  });
}

export async function pause(userId: string) {
  const session = await getActiveSession(userId);
  if (!session) throw new Error("No active session to pause.");
  if (session.status === SessionStatus.PAUSED) return session;

  const open = session.segments.find((s) => !s.endTime);
  if (open) {
    await prisma.workSegment.update({
      where: { id: open.id },
      data: { endTime: new Date() },
    });
  }

  return prisma.workSession.update({
    where: { id: session.id },
    data: { status: SessionStatus.PAUSED },
    include: { segments: true },
  });
}

export async function abandonSession(userId: string) {
  const session = await getActiveSession(userId);
  if (!session) throw new Error("No active session to abandon.");

  const open = session.segments.find((s) => !s.endTime);
  if (open) {
    await prisma.workSegment.update({
      where: { id: open.id },
      data: { endTime: new Date() },
    });
  }

  return prisma.workSession.update({
    where: { id: session.id },
    data: { status: SessionStatus.ABANDONED },
  });
}

export async function resume(userId: string) {
  const session = await getActiveSession(userId);
  if (!session) throw new Error("No paused session to resume.");
  if (session.status === SessionStatus.ACTIVE) return session;

  await prisma.workSegment.create({
    data: { sessionId: session.id, startTime: new Date() },
  });

  return prisma.workSession.update({
    where: { id: session.id },
    data: { status: SessionStatus.ACTIVE },
    include: { segments: true },
  });
}

export async function clockOut(
  userId: string,
  notes: {
    workedOn: string;
    output: string;
    difficulty: number;
    focus: number;
  },
) {
  const session = await getActiveSession(userId);
  if (!session) throw new Error("No active session to clock out.");

  const { workedOn, output, difficulty, focus } = notes;
  if (!workedOn?.trim()) throw new Error("workedOn is required.");
  if (!output?.trim()) throw new Error("output is required.");
  if (!(difficulty >= 1 && difficulty <= 5))
    throw new Error("difficulty must be 1-5.");
  if (!(focus >= 1 && focus <= 5)) throw new Error("focus must be 1-5.");

  const open = session.segments.find((s) => !s.endTime);
  if (open) {
    await prisma.workSegment.update({
      where: { id: open.id },
      data: { endTime: new Date() },
    });
  }

  const endedAt = new Date();

  const segs = await prisma.workSegment.findMany({
    where: { sessionId: session.id },
    orderBy: { startTime: "asc" },
  });

  const totalMinutes = segs.reduce((sum, s) => {
    if (!s.endTime) return sum;
    return sum + minutesBetween(s.startTime, s.endTime);
  }, 0);

  if (totalMinutes < session.minMinutes) {
    throw new Error(
      `Minimum session length is ${session.minMinutes} minutes. Current: ${totalMinutes}m`,
    );
  }

  return prisma.workSession.update({
    where: { id: session.id },
    data: {
      status: SessionStatus.COMPLETED,
      endedAt,
      workedOn,
      output,
      difficulty,
      focus,
    },
    include: { segments: true },
  });
}

export async function getWeeklyReport(weekStart: string) {
  return prisma.weeklyReport.findUnique({ where: { weekStart } });
}

export async function upsertWeeklyReport(
  weekStart: string,
  weekNumber: number | undefined,
  notes: object,
) {
  return prisma.weeklyReport.upsert({
    where: { weekStart },
    update: { weekNumber, notes },
    create: { weekStart, weekNumber, notes },
  });
}

export async function getWeekReport(userId: string, startYYYYMMDD: string) {
  const { start, end } = weekRange(startYYYYMMDD);

  const sessions = await prisma.workSession.findMany({
    where: {
      userId,
      startedAt: { gte: start, lt: end },
      status: SessionStatus.COMPLETED,
    },
    include: { segments: true, notes: { orderBy: { createdAt: "asc" } } },
    orderBy: { startedAt: "asc" },
  });

  const perCategory: Record<string, number> = {};
  let totalMinutes = 0;
  let sessionsCompleted = sessions.length;
  let longestMinutes = 0;

  for (const s of sessions) {
    const minutes = s.segments.reduce((sum, seg) => {
      if (!seg.endTime) return sum;
      return sum + minutesBetween(seg.startTime, seg.endTime);
    }, 0);

    totalMinutes += minutes;
    longestMinutes = Math.max(longestMinutes, minutes);

    const key = s.category;
    perCategory[key] = (perCategory[key] ?? 0) + minutes;
  }

  const targetMinutes = 14 * 60;
  const percent =
    targetMinutes === 0 ? 0 : Math.round((totalMinutes / targetMinutes) * 100);

  return {
    range: { start, end },
    totalMinutes,
    targetMinutes,
    percent,
    sessionsCompleted,
    longestSessionMinutes: longestMinutes,
    perCategory,
    sessions: sessions.map((s) => ({
      id: s.id,
      category: s.category,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      workedOn: s.workedOn,
      output: s.output,
      difficulty: s.difficulty,
      focus: s.focus,
      notes: s.notes,
      minutes: s.segments.reduce((sum, seg) => {
        if (!seg.endTime) return sum;
        return sum + minutesBetween(seg.startTime, seg.endTime);
      }, 0),
    })),
  };
}
