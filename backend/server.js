const express = require("express");
const cors = require("cors");
const apiRouter = require("./src/routes/api");

const app = express();

/* CORS — set CORS_ORIGIN in your Render env vars to your deployed
   Vercel URL (e.g. https://loop-frontend.vercel.app) once you have
   it; "*" is fine for local dev and first deploy. Comma-separate
   multiple origins. */
const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map(s => s.trim());
app.use(cors({
  origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "Loop — AI Content Operating System API",
    status: "running",
    docs: "/api/health for a liveness check; see README.md for the full route list"
  });
});

app.use("/api", apiRouter);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Loop backend listening on port ${PORT}`));
