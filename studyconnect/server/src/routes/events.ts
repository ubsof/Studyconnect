import express from "express";
import { prisma } from "../prisma";

const router = express.Router();

router.get("/upcoming", async (req, res) => {
  const now = new Date();
  const events = await prisma.event.findMany({ where: { startTime: { gt: now } }, orderBy: { startTime: "asc" } });
  res.json(events);
});

export default router;
