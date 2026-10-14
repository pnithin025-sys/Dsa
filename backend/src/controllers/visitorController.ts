import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';

const prisma = new PrismaClient();

export const getAllVisitors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, studentId, search } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = String(status);
    if (studentId) whereClause.studentId = String(studentId);
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { studentName: { contains: String(search) } },
        { visitorId: { contains: String(search) } },
        { phone: { contains: String(search) } },
      ];
    }

    const visitors = await prisma.visitor.findMany({
      where: whereClause,
      include: { student: { include: { room: true } } },
      orderBy: { entryTime: 'desc' },
    });

    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    // Stats
    const totalVisits = await prisma.visitor.count();
    const currentlyInside = await prisma.visitor.count({ where: { status: 'INSIDE' } });
    const exitedCount = await prisma.visitor.count({ where: { status: 'EXITED' } });

    // Count today's entries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVisitors = await prisma.visitor.count({
      where: { entryTime: { gte: startOfToday } },
    });

    // In-memory Stack top items
    const stackItems = dsaService.visitorStack.toArray().slice(0, 10);

    res.json({
      success: true,
      data: visitors,
      stats: {
        totalVisits,
        currentlyInside,
        exitedCount,
        todayVisitors,
      },
      dsaStack: {
        structure: 'CustomStack (LIFO - Last In First Out)',
        stackSize: dsaService.visitorStack.size(),
        topElement: dsaService.visitorStack.peek(),
        recentEntries: stackItems,
        pushComplexity: 'O(1)',
        popComplexity: 'O(1)',
      },
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve visitors.' });
  }
};

export const recordVisitorEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, studentId, phone, relationship, purpose } = req.body;

    if (!name || !studentId || !phone) {
      res.status(400).json({ success: false, message: 'Visitor name, studentId, and phone are required.' });
      return;
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { studentId }] },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Host student not found.' });
      return;
    }

    const count = await prisma.visitor.count();
    const visitorId = `VIS${101 + count}`;

    const newVisitor = await prisma.visitor.create({
      data: {
        visitorId,
        name,
        studentId: student.id,
        studentName: student.name,
        phone,
        relationship: relationship || 'Family',
        purpose: purpose || 'General Visit',
        status: 'INSIDE',
      },
    });

    // Push into in-memory Stack: O(1)
    const dsaService = DSAService.getInstance();
    const stackPush = dsaService.visitorStack.push(newVisitor);

    await prisma.activityLog.create({
      data: {
        action: 'VISITOR_ENTRY',
        details: `Visitor ${name} entered to meet ${student.name}`,
        entityType: 'Visitor',
        entityId: newVisitor.id,
        performedBy: 'Security Reception',
      },
    });

    res.status(201).json({
      success: true,
      message: `Visitor entry recorded for ${name}. Pass ID: ${visitorId}`,
      data: newVisitor,
      dsaOperation: stackPush,
    });
  } catch (error) {
    console.error('Error logging visitor entry:', error);
    res.status(500).json({ success: false, message: 'Failed to record visitor entry.' });
  }
};

export const recordVisitorExit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const visitor = await prisma.visitor.findFirst({
      where: { OR: [{ id }, { visitorId: id }] },
    });

    if (!visitor) {
      res.status(404).json({ success: false, message: 'Visitor pass not found.' });
      return;
    }

    if (visitor.status === 'EXITED') {
      res.status(400).json({ success: false, message: 'Visitor has already exited campus.' });
      return;
    }

    const updated = await prisma.visitor.update({
      where: { id: visitor.id },
      data: {
        status: 'EXITED',
        exitTime: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Exit recorded for visitor ${visitor.name}.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record visitor exit.' });
  }
};
