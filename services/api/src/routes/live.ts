import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/middleware.js";

const r = Router();

// List live streams for public directory
r.get("/streams", async (_req, res) => {
  const streams = await prisma.stream.findMany({
    where: { isLive: true },
    orderBy: { startedAt: "desc" },
    take: 100,
    select: { id: true, title: true, startedAt: true, user: { select: { username: true, streamKey: true } } },
  });
  res.json({ streams });
});
r.post("/start", async (req, res) => {
  const { name } = req.body as { name?: string };

  if (!name) return res.status(400).json({ error: "name required" });

  const user = await prisma.user.findFirst({
    where: { streamKey: name }
  });

  if (!user) return res.status(404).json({ error: "Unknown stream key" });

  const existing = await prisma.stream.findFirst({
    where: { userId: user.id }
  });

  if (existing) {
    await prisma.stream.update({
      where: { id: existing.id },
      data: {
        isLive: true,
        startedAt: new Date(),
        title: "Live"
      }
    });
  } else {
    await prisma.stream.create({
      data: {
        userId: user.id,
        isLive: true,
        startedAt: new Date(),
        title: "Live"
      }
    });
  }

  res.json({ ok: true });
});

// Creator sets title
r.post("/streams/title", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const { title } = req.body as { title?: string };
  const safeTitle = (title || "Live").slice(0, 80);

const existing = await prisma.stream.findFirst({
  where: { userId: meId },
});

let stream;

if (existing) {
  stream = await prisma.stream.update({
    where: { id: existing.id },
    data: { title: safeTitle },
  });
} else {
  stream = await prisma.stream.create({
    data: { userId: meId, title: safeTitle },
  });
}

  res.json({ stream });
});

export default r;
