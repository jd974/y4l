import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/middleware.js";

const r = Router();

// Create battle room between two creators (A vs B)
r.post("/create", requireAuth, async (req, res) => {
  const meId = (req as any).user.sub as string;
  const { opponentUsername } = req.body as { opponentUsername?: string };
  if (!opponentUsername) return res.status(400).json({ error: "opponentUsername required" });

  const opp = await prisma.user.findUnique({ where: { username: opponentUsername } });
  if (!opp) return res.status(404).json({ error: "Opponent not found" });

  // room key
  const roomKey = `battle-${Math.random().toString(36).slice(2, 10)}`;

  const battle = await prisma.battle.create({
    data: {
      roomKey,
      aUserId: meId,
      bUserId: opp.id,
      isActive: true,
    },
    select: {
      roomKey: true,
      aScore: true,
      bScore: true,
      isActive: true,
      aUser: { select: { username: true, streamKey: true } },
      bUser: { select: { username: true, streamKey: true } },
    },
  });

  res.json({ battle });
});

r.get("/:roomKey", async (req, res) => {
  const { roomKey } = req.params;
  const battle = await prisma.battle.findUnique({
    where: { roomKey },
    select: {
      roomKey: true,
      aScore: true,
      bScore: true,
      isActive: true,
      aUser: { select: { username: true, streamKey: true } },
      bUser: { select: { username: true, streamKey: true } },
    },
  });
  if (!battle) return res.status(404).json({ error: "Not found" });
  res.json({ battle });
});

export default r;
