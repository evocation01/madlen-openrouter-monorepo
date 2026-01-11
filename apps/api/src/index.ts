import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import { initTelemetry } from "./instrumentation";

// Initialize OpenTelemetry before everything else
initTelemetry();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api" });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});

export default app;