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
      date,
      startTime,
      endTime,
      capacity,
      typeOfStudy,
      scheduleType,
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
        date,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: Number(capacity) || 0,
        typeOfStudy,
        scheduleType,
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

    // add creator as admin with approved status
    await prisma.userGroup.create({ data: { userId, groupId: group.id, role: "admin", status: "approved" } });

    res.json({ group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/all", async (req, res) => {
  const groups = await prisma.group.findMany({ 
    include: { 
      groupTags: { include: { tag: true } },
      userGroups: { where: { status: "approved" } }
    } 
  });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name), _count: { userGroups: g.userGroups.length } })));
});

router.get("/search", async (req, res) => {
  const q = (req.query.q as string) || "";
  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { subject: { contains: q } },
        { smallDesc: { contains: q } },
        { description: { contains: q } }
      ]
    },
    include: { 
      groupTags: { include: { tag: true } },
      userGroups: { where: { status: "approved" } }
    }
  });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name), _count: { userGroups: g.userGroups.length } })));
});

router.post("/join", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { groupId } = req.body;
    const existing = await prisma.userGroup.findUnique({ where: { userId_groupId: { userId, groupId } } });
    if (existing) return res.status(400).json({ error: "Request already sent or you are already a member" });
    // Create join request with pending status
    const ug = await prisma.userGroup.create({ data: { userId, groupId, role: "member", status: "pending" } });
    res.json(ug);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const ugs = await prisma.userGroup.findMany({ 
    where: { userId, status: "approved" }, 
    include: { 
      group: {
        include: {
          userGroups: { where: { status: "approved" } }
        }
      } 
    } 
  });
  res.json(ugs.map(u => ({ ...u.group, _count: { userGroups: u.group.userGroups.length } })));
});

// Groups for current user (approved memberships)
router.get("/mine", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const ugs = await prisma.userGroup.findMany({ 
    where: { userId, status: "approved" }, 
    include: { 
      group: {
        include: {
          userGroups: { where: { status: "approved" } }
        }
      } 
    } 
  });
  res.json(ugs.map(u => ({ ...u.group, _count: { userGroups: u.group.userGroups.length } })));
});

// Get groups created by user
router.get("/created", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const groups = await prisma.group.findMany({ 
    where: { createdBy: userId },
    include: { 
      groupTags: { include: { tag: true } },
      userGroups: { where: { status: "approved" } }
    }
  });
  res.json(groups.map(g => ({ ...g, tags: g.groupTags.map(gt => gt.tag.name), _count: { userGroups: g.userGroups.length } })));
});

// Get pending requests for a group (admin only)
router.get("/requests/:groupId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.groupId);
    
    // Check if user is admin of this group
    const adminCheck = await prisma.userGroup.findFirst({ 
      where: { userId, groupId, role: "admin" } 
    });
    if (!adminCheck) return res.status(403).json({ error: "Not authorized" });
    
    // Get pending requests
    const requests = await prisma.userGroup.findMany({
      where: { groupId, status: "pending" },
      include: { user: { select: { id: true, name: true, email: true, year: true, course: true } } }
    });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Get all pending requests for all groups created by the user
router.get("/all-pending-requests", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    // Get all groups created by this user
    const myGroups = await prisma.group.findMany({
      where: { createdBy: userId },
      select: { id: true, subject: true }
    });
    
    const groupIds = myGroups.map(g => g.id);
    
    // Get all pending requests for these groups
    const requests = await prisma.userGroup.findMany({
      where: { 
        groupId: { in: groupIds }, 
        status: "pending" 
      },
      include: { 
        user: { select: { id: true, name: true, email: true, year: true, course: true } },
        group: { select: { id: true, subject: true } }
      }
    });
    
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Approve or reject join request
router.post("/request/update", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { requestId, status } = req.body; // status: approved or rejected
    
    // Get the request
    const request = await prisma.userGroup.findUnique({ where: { id: requestId } });
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    // Check if user is admin of this group
    const adminCheck = await prisma.userGroup.findFirst({ 
      where: { userId, groupId: request.groupId, role: "admin" } 
    });
    if (!adminCheck) return res.status(403).json({ error: "Not authorized" });
    
    // Update status
    const updated = await prisma.userGroup.update({
      where: { id: requestId },
      data: { status }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
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

// Get a single group by ID
router.get("/:groupId", async (req, res) => {
  try {
    const groupId = Number(req.params.groupId);
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { 
        groupTags: { include: { tag: true } },
        userGroups: { where: { status: "approved" } }
      }
    });
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ ...group, tags: group.groupTags.map(gt => gt.tag.name), _count: { userGroups: group.userGroups.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Get members of a group (for group owner)
router.get("/:groupId/members", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.groupId);
    
    // Check if user is the creator of this group
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.createdBy !== userId) return res.status(403).json({ error: "Not authorized" });
    
    // Get all approved members
    const members = await prisma.userGroup.findMany({
      where: { groupId, status: "approved" },
      include: { 
        user: { select: { id: true, name: true, email: true, year: true, course: true } }
      }
    });
    
    res.json(members.map(m => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Kick a member from group (owner only)
router.post("/:groupId/kick/:memberId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.groupId);
    const memberId = Number(req.params.memberId);
    
    // Check if user is the creator of this group
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.createdBy !== userId) return res.status(403).json({ error: "Not authorized - only the owner can kick members" });
    
    // Can't kick yourself (the owner)
    if (memberId === userId) return res.status(400).json({ error: "You cannot kick yourself from the group" });
    
    // Delete the user from the group
    await prisma.userGroup.deleteMany({
      where: { groupId, userId: memberId }
    });
    
    // Create a notification for the kicked member
    await prisma.notification.create({
      data: {
        userId: memberId,
        message: `You have been removed from the group "${group.subject}".`,
        groupId: groupId,
        type: "info"
      }
    });
    
    res.json({ success: true, message: "Member removed from group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Update a group (owner only)
router.put("/update/:groupId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const groupId = Number(req.params.groupId);
    
    // Check if user is the creator of this group
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: "Group not found" });
    if (group.createdBy !== userId) return res.status(403).json({ error: "Not authorized - only the owner can edit" });
    
    const {
      subject,
      smallDesc,
      description,
      date,
      startTime,
      endTime,
      capacity,
      typeOfStudy,
      scheduleType,
      language,
      location
    } = req.body;
    
    // Update the group
    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        subject,
        smallDesc,
        description,
        date,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: Number(capacity),
        typeOfStudy,
        scheduleType,
        language,
        location
      }
    });
    
    // Get all members of this group (except the owner)
    const members = await prisma.userGroup.findMany({
      where: { groupId, status: "approved", userId: { not: userId } }
    });
    
    // Create notifications for all members
    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          message: `The group "${subject}" has been updated by the owner.`,
          groupId: groupId,
          type: "update"
        }
      });
    }
    
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Get notifications for current user
router.get("/notifications/mine", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Mark notification as read
router.post("/notifications/read/:notificationId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const notificationId = Number(req.params.notificationId);
    
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Mark all notifications as read
router.post("/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
