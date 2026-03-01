const API = "http://localhost:4000/api/tracker";
import type { WeekReport } from "./tracker.types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const trackerApi = {
  getWeek(start: string) {
    return fetch(`/api/tracker/week?start=${start}`).then((res) =>
      json<WeekReport>(res),
    );
  },

  clockIn(category: string) {
    return fetch("/api/tracker/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    }).then((res) => json(res));
  },
};
