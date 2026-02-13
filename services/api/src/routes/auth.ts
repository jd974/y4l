import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/auth.js";

const r = Router();

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8).max(64),
});

function makeStreamKey(username: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${username}-${rand}`.toLowerCase();
}

r.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, username, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: "USER",
        streamKey: makeStreamKey(username),
      },
      select: { id: true, email: true, username: true, role: true, streamKey: true },
    });

    const token = signToken({ sub: user.id, role: user.role });
    res.json({ token, user });
  } catch (e: any) {
    res.status(409).json({ error: "Email or username already used" });
  }
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(3),
  password: z.string().min(1),
});

r.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { emailOrUsername, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, streamKey: user.streamKey },
  });
});

export default r;
