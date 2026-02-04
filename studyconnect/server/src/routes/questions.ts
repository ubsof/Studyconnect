import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const router = Router();

// Set up multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all questions
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        answers: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get single question with answers
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create a new question
router.post('/', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, subject } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const question = await prisma.question.create({
      data: {
        title,
        description,
        subject: subject || null,
        imageUrl,
        userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Delete a question (only owner can delete)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const questionId = parseInt(req.params.id);

    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    // Delete the image file if it exists
    if (question.imageUrl) {
      const imagePath = path.join(__dirname, '../..', question.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.question.delete({
      where: { id: questionId }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Add an answer to a question
router.post('/:id/answers', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const questionId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Answer content is required' });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { user: { select: { id: true, name: true } } }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answer = await prisma.answer.create({
      data: {
        content,
        questionId,
        userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    // Create notification for the question owner (only if answerer is not the owner)
    if (question.userId !== userId) {
      const answererName = answer.user?.name || 'Someone';
      await prisma.notification.create({
        data: {
          userId: question.userId,
          message: `${answererName} answered your question: "${question.title}"`,
          questionId: questionId,
          type: 'forum_answer'
        }
      });
    }

    res.status(201).json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add answer' });
  }
});

// Delete an answer (only owner can delete)
router.delete('/answers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const answerId = parseInt(req.params.id);

    const answer = await prisma.answer.findUnique({
      where: { id: answerId }
    });

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    if (answer.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this answer' });
    }

    await prisma.answer.delete({
      where: { id: answerId }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// Search questions
router.get('/search/:query', requireAuth, async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const questions = await prisma.question.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { subject: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        answers: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search questions' });
  }
});

export default router;
