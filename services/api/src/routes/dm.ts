import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/middleware.js";

const r = Router();

// Send a DM
r.post("/send", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const { toUsername, body } = req.body as { toUsername?: string; body?: string };
  if (!toUsername || !body) return res.status(400).json({ error: "toUsername and body required" });

  const to = await prisma.user.findUnique({ where: { username: toUsername } });
  if (!to) return res.status(404).json({ error: "User not found" });

  const msg = await prisma.message.create({
    data: { fromId: meId, toId: to.id, body: body.slice(0, 2000) },
  });

  res.json({ message: msg });
});

// Inbox (latest 50)
r.get("/inbox", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const msgs = await prisma.message.findMany({
    where: { OR: [{ fromId: meId }, { toId: meId }] },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ messages: msgs });
});

export default r;
