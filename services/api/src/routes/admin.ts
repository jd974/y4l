import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../lib/middleware.js";

const r = Router();

r.get("/stats", requireAuth, requireAdmin, async (_req, res) => {
  const [users, live] = await Promise.all([
    prisma.user.count(),
    prisma.stream.count({ where: { isLive: true } }),
  ]);
  res.json({ users, live });
});

r.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, username: true, role: true, streamKey: true, createdAt: true },
  });
  res.json({ users });
});

r.post("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const { role } = req.body as { role?: "USER" | "CREATOR" | "ADMIN" };
  if (!role) return res.status(400).json({ error: "role required" });

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, username: true, role: true },
  });
  res.json({ user });
});

export default r;
