import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./lib/env.js";
import { prisma } from "./lib/prisma.js";

import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import liveRoutes from "./routes/live.js";
import dmRoutes from "./routes/dm.js";
import battleRoutes from "./routes/battles.js";
import adminRoutes from "./routes/admin.js";

const app = express();   // ← APP MUST BE CREATED FIRST

// ✅ ADD THIS HERE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "yours4live-api" });
});

app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use("/live", liveRoutes);
app.use("/dm", dmRoutes);
app.use("/battles", battleRoutes);
app.use("/admin", adminRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ room }: { room: string }) => {
    socket.join(room);
  });

  socket.on(
    "chat",
    async (payload: { room: string; username: string; message: string }) => {
      const msg = {
        username: payload.username?.slice(0, 24) || "anon",
        message: payload.message?.slice(0, 500) || "",
        ts: Date.now(),
      };
      io.to(payload.room).emit("chat", msg);
    }
  );

  socket.on(
    "battle:add",
    async (payload: {
      roomKey: string;
      side: "A" | "B";
      amount: number;
    }) => {
      const amount = Math.max(1, Math.min(9999, payload.amount || 1));

      const battle = await prisma.battle.findFirst({
        where: { roomKey: payload.roomKey },
      });

      if (!battle || !battle.isActive) return;

      const updated = await prisma.battle.update({
        where: { roomKey: payload.roomKey },
        data:
          payload.side === "A"
            ? { aScore: { increment: amount } }
            : { bScore: { increment: amount } },
        select: {
          roomKey: true,
          aScore: true,
          bScore: true,
          isActive: true,
        },
      });

      io.to(`battle:${payload.roomKey}`).emit("battle:update", updated);
    }
  );
});

/* ===========================
   INTERNAL STREAM ROUTES
=========================== */
// 🔴 STREAM ONLINE (called by nginx-rtmp)
app.post("/internal/stream/online", async (req, res) => {
  try {
    const streamKey =
      req.body.name ||
      req.body.streamKey ||
      req.query.streamKey;

    if (!streamKey) {
      console.log("No streamKey provided");
      return res.sendStatus(400);
    }

    const user = await prisma.user.findUnique({
      where: { streamKey },
    });

    if (!user) {
      console.log("Invalid streamKey:", streamKey);
      return res.sendStatus(403);
    }

    console.log("Stream ONLINE:", streamKey);

    return res.sendStatus(200);
  } catch (err) {
    console.error("Stream online error:", err);
    return res.sendStatus(500);
  }
});
// 🔴 STREAM OFFLINE
app.post("/internal/stream/offline", async (req, res) => {
  const streamKey =
    (req.query.streamKey as string) || req.body.streamKey;

  if (!streamKey) {
    return res.status(400).json({ error: "streamKey required" });
  }

  const user = await prisma.user.findUnique({
    where: { streamKey },
  });

  if (!user) {
    console.log("Invalid stream key attempt:", streamKey);
    return res.status(403).send("Invalid stream key");
  }

  await prisma.stream.updateMany({
    where: { userId: user.id },
    data: {
      isLive: false,
      endedAt: new Date(),
    },
  });

  console.log("🔴 STREAM OFFLINE:", streamKey);

  return res.status(200).send("OK");
});

const PORT = 4000;

app.post("/internal/stream/online", async (req, res) => {
  try {
    const streamKey = req.body.name;

    if (!streamKey) {
      console.log("Missing stream key");
      return res.status(400).send("Missing stream key");
    }

    const user = await prisma.user.findUnique({
      where: { streamKey },
    });

    if (!user) {
      console.log("Invalid stream key:", streamKey);
      return res.status(403).send("Invalid stream key");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isLive: true },
    });

    console.log(`User ${user.username} is now LIVE`);

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Stream Online Error:", error);
    return res.status(500).send("Server error");
  }
});

app.post("/internal/stream/offline", async (req, res) => {
  try {
    const streamKey = req.body.name;

    if (!streamKey) {
      return res.status(400).send("Missing stream key");
    }

    const user = await prisma.user.findUnique({
      where: { streamKey },
    });

    if (!user) {
      return res.status(403).send("Invalid stream key");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isLive: false },
    });

    console.log(`User ${user.username} is now OFFLINE`);

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Stream Offline Error:", error);
    return res.status(500).send("Server error");
  }
});
httpServer.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

