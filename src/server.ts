import "dotenv/config";
import app from "./app";
import { seedDefaultCategories } from "./modules/tracker/tracker.service";
import { seedSentinelSeries } from "./modules/notes/notes.service";

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedDefaultCategories().catch(console.error);
  await seedSentinelSeries().catch(console.error);
});
