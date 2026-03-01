export type Category =
  | "ALGORITHMS"
  | "ML_THEORY"
  | "ML_PLATFORM"
  | "SYSTEM_DESIGN"
  | "JOB_APPLICATIONS"
  | "READING"
  | "MOCK_INTERVIEW";

export type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export interface WorkSegment {
  id: string;
  startTime: string;
  endTime: string | null;
}

export interface WorkSession {
  id: string;
  category: Category;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  workedOn?: string;
  output?: string;
  difficulty?: number;
  focus?: number;
  segments: WorkSegment[];
}

export interface WeekReport {
  totalMinutes: number;
  targetMinutes: number;
  percent: number;
  sessionsCompleted: number;
  longestSessionMinutes: number;
  perCategory: Record<string, number>;
  sessions: Array<{
    id: string;
    category: Category;
    startedAt: string;
    endedAt: string | null;
    workedOn?: string;
    output?: string;
    difficulty?: number;
    focus?: number;
    minutes: number;
  }>;
}
