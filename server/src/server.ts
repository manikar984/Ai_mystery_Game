import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./repository.js";

const port = Number(process.env.PORT || 5000);
try { await connectDatabase(process.env.MONGODB_URI); }
catch { console.error("MongoDB unavailable; running in memory demo mode. Cases will not survive restart."); }
const server = app.listen(port, () => console.log(`AI Mystery Room API listening on http://localhost:${port}`));
async function shutdown() { server.close(); process.exit(0); }
process.on("SIGINT", shutdown); process.on("SIGTERM", shutdown);
