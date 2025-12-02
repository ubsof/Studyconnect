import express from "express";
import { prisma } from "../prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/create", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      subject,
      smallDesc,
      description,
      startTime,
      endTime,
      capacity,
      typeOfStudy,
      language,
      location,
      tags = []
    } = req.body;

    const userId = req.userId!;
    const group = await prisma.group.create({
      data: {
        subject,
        smallDesc,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: Number(capacity) || 0,
        typeOfStudy,
        language,
        location,
        createdBy: userId
      }
    });

    // attach tags
    for (const t of tags) {
      const tag = await prisma.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
      await prisma.groupTag.create({ data: { groupId: group.id, tagId: tag.id } });
    }

    // add creator as admin
    await prisma.userGroup.create({ data: { userId, groupId: group.id, role: "admin" } });

    res.json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/all", async (req, res) => {
  const groups = await prisma.group.findMany({ include: { groupTags: { include: { tag: true } } } });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name) })));
});

router.get("/search", async (req, res) => {
  const q = (req.query.q as string) || "";
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { subject: { contains: q, mode: "insensitive" } },
        { smallDesc: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ]
    },
    include: { groupTags: { include: { tag: true } } }
  });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name) })));
});

router.post("/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { groupId } = req.body;
    const existing = await prisma.userGroup.findUnique({ where: { userId_groupId: { userId, groupId } } });
    if (existing) return res.status(400).json({ error: "Already a member" });
    const ug = await prisma.userGroup.create({ data: { userId, groupId, role: "member" } });
    res.json(ug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const ugs = await prisma.userGroup.findMany({ where: { userId }, include: { group: true } });
  res.json(ugs.map(u => u.group));
});

router.get("/suggested", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  // find user tags
  const userTags = await prisma.userTag.findMany({ where: { userId }, include: { tag: true } });
  const tagNames = userTags.map(ut => ut.tag.name);
  if (tagNames.length === 0) {
    // fallback: return recent groups
    const recent = await prisma.group.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { groupTags: { include: { tag: true } } } });
    return res.json(recent.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name) })));
  }

  // find groups that have these tags
  const groups = await prisma.group.findMany({
    where: { groupTags: { some: { tag: { name: { in: tagNames } } } } },
    include: { groupTags: { include: { tag: true } } },
    take: 20
  });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name) })));
});

export default router;
