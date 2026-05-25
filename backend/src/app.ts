import { router as authRouter } from "@/routes/auth.js";
import channelRouter from "@/routes/channels.js";
import messageRouter from "@/routes/messages.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

export const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/channels", channelRouter);
app.use("/api/channels/:channelId/messages", messageRouter);
