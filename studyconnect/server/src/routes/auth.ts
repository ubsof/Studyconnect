import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../prisma";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret_dev";

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, year, course, institution } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name, year, course, institution } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

import { requireAuth, AuthRequest } from "../middleware/auth";

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, name: user.name, year: user.year, course: user.course, institution: user.institution });
});

router.put("/update-profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { institution } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { institution }
    });
    res.json({ id: updated.id, email: updated.email, name: updated.name, year: updated.year, course: updated.course, institution: updated.institution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
