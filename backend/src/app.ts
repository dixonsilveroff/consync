import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { config } from "./config.js";

export const app = express();

app.use(pinoHttp());
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});
