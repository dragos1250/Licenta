import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import { registerRoutes } from "./presentation/routes/index.js";

dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL, // ex: http://localhost:5173
    credentials: true,              // OBLIGATORIU pentru cookies
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", registerRoutes());

app.use((err, req, res, next) => {
  console.error(err);

  const status = 400;
  res.status(status).json({
    error: err.message || "Eroare server",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});