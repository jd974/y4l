import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/middleware.js";

const r = Router();

r.get("/", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const me = await prisma.user.findUnique({
    where: { id: meId },
    select: { id: true, email: true, username: true, role: true, streamKey: true, createdAt: true },
  });
  res.json({ me });
});

r.post("/stream-key/rotate", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const me = await prisma.user.findUnique({ where: { id: meId } });
  if (!me) return res.status(404).json({ error: "Not found" });

  const rand = Math.random().toString(36).slice(2, 10);
  const streamKey = `${me.username}-${rand}`.toLowerCase();

  const updated = await prisma.user.update({
    where: { id: meId },
    data: { streamKey },
    select: { streamKey: true },
  });

  res.json(updated);
});

export default r;
