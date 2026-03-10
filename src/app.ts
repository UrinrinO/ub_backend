import express from "express";
import cors from "cors";
import trackerRoutes from "./modules/tracker/tracker.routes";
import blogRoutes from "./modules/blog/blog.routes";
import projectsRoutes from "./modules/projects/projects.routes";
import notesRoutes from "./modules/notes/notes.routes";

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

export default app;
