import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    (req as any).user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const u = (req as any).user as { role: string } | undefined;
  if (!u) return res.status(401).json({ error: "Unauthorized" });
  if (u.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
}
