import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import trackerRoutes from "./modules/tracker/tracker.routes";
import blogRoutes from "./modules/blog/blog.routes";
import projectsRoutes from "./modules/projects/projects.routes";
import notesRoutes from "./modules/notes/notes.routes";
import remindersRoutes from "./modules/reminders/reminders.routes";
import resourcesRoutes from "./modules/resources/resources.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_WWW,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/tracker", trackerRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/resources", resourcesRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

export default app;
