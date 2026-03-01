export function buildMarkdownReport(report: {
  range: { start: Date; end: Date };
  totalMinutes: number;
  targetMinutes: number;
  percent: number;
  sessionsCompleted: number;
  longestSessionMinutes: number;
  perCategory: Record<string, number>;
  sessions: Array<{
    id: string;
    category: string;
    startedAt: Date;
    endedAt: Date | null;
    workedOn?: string | null;
    output?: string | null;
    difficulty?: number | null;
    focus?: number | null;
    minutes: number;
  }>;
}) {
  const fmt = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
  };

  const lines: string[] = [];
  lines.push(`# DeepWork Weekly Report`);
  lines.push(`**Week:** ${report.range.start.toISOString().slice(0, 10)} → ${report.range.end.toISOString().slice(0, 10)}`);
  lines.push(``);
  lines.push(`## Summary`);
  lines.push(`- Total: **${fmt(report.totalMinutes)}** / **${fmt(report.targetMinutes)}** (${report.percent}%)`);
  lines.push(`- Sessions completed: **${report.sessionsCompleted}**`);
  lines.push(`- Longest session: **${fmt(report.longestSessionMinutes)}**`);
  lines.push(``);
  lines.push(`## Hours by Category`);
  for (const [cat, minutes] of Object.entries(report.perCategory).sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${cat}: **${fmt(minutes)}**`);
  }
  lines.push(``);
  lines.push(`## Session Log`);
  for (const s of report.sessions) {
    lines.push(`### ${s.category} — ${fmt(s.minutes)}`);
    lines.push(`- When: ${s.startedAt.toISOString()} → ${s.endedAt?.toISOString() ?? "—"}`);
    lines.push(`- Worked on: ${s.workedOn ?? ""}`);
    lines.push(`- Output: ${s.output ?? ""}`);
    lines.push(`- Difficulty: ${s.difficulty ?? ""} / 5`);
    lines.push(`- Focus: ${s.focus ?? ""} / 5`);
    lines.push(``);
  }
  return lines.join("\n");
}