import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';

const prisma = new PrismaClient();

export const getAllMaintenanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, priority } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = String(status);
    if (category) whereClause.category = String(category);
    if (priority) whereClause.priority = String(priority);

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: { student: true },
      orderBy: { submittedAt: 'asc' }, // FIFO timeline order
    });

    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    const pendingQueueItems = dsaService.maintenanceQueue.toArray();
    const frontItem = dsaService.maintenanceQueue.peek();

    const totalRequests = await prisma.maintenanceRequest.count();
    const pendingCount = await prisma.maintenanceRequest.count({ where: { status: 'PENDING' } });
    const inProgressCount = await prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } });
    const completedCount = await prisma.maintenanceRequest.count({ where: { status: 'COMPLETED' } });

    res.json({
      success: true,
      data: requests,
      stats: {
        totalRequests,
        pendingCount,
        inProgressCount,
        completedCount,
      },
      dsaQueue: {
        structure: 'CustomQueue (FIFO - First In First Out)',
        queueLength: dsaService.maintenanceQueue.size(),
        frontElement: frontItem,
        elements: pendingQueueItems,
        enqueueComplexity: 'O(1) with rear pointer',
        dequeueComplexity: 'O(1) with front pointer',
      },
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve maintenance requests.' });
  }
};

export const createMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, roomNumber, category, description, priority } = req.body;

    if (!roomNumber || !category || !description) {
      res.status(400).json({ success: false, message: 'Room number, category, and description are required.' });
      return;
    }

    let studentName = null;
    let studentDbId = null;

    if (studentId) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ id: studentId }, { studentId }] },
      });
      if (student) {
        studentDbId = student.id;
        studentName = student.name;
      }
    }

    const count = await prisma.maintenanceRequest.count();
    const requestId = `MNT${101 + count}`;

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        requestId,
        studentId: studentDbId,
        studentName,
        roomNumber,
        category: category.toUpperCase(),
        description,
        priority: priority ? priority.toUpperCase() : 'MEDIUM',
        status: 'PENDING',
      },
    });

    // Enqueue in-memory FIFO queue: O(1)
    const dsaService = DSAService.getInstance();
    const queueLog = dsaService.maintenanceQueue.enqueue(newRequest);

    await prisma.activityLog.create({
      data: {
        action: 'MAINTENANCE_ENQUEUED',
        details: `Ticket ${requestId} (${category}) for Room ${roomNumber} added to FIFO queue`,
        entityType: 'Maintenance',
        entityId: newRequest.id,
        performedBy: studentName || 'Hostel Resident',
      },
    });

    res.status(201).json({
      success: true,
      message: `Maintenance request #${requestId} enqueued successfully.`,
      data: newRequest,
      dsaOperation: queueLog,
    });
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit maintenance request.' });
  }
};

/**
 * Process Next in Queue (FIFO Dequeue)
 * Pops the frontmost pending maintenance request and marks it as IN_PROGRESS or COMPLETED
 */
export const processNextMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    if (dsaService.maintenanceQueue.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Maintenance Queue is empty! No pending requests waiting for processing.',
        dsaQueue: {
          structure: 'CustomQueue',
          queueLength: 0,
          status: 'EMPTY',
        },
      });
      return;
    }

    // Dequeue front element: O(1)
    const { dequeued, queueLength, timeComplexity, description } = dsaService.maintenanceQueue.dequeue();

    if (!dequeued) {
      res.status(400).json({ success: false, message: 'Queue is empty.' });
      return;
    }

    // Update in database to COMPLETED
    const updated = await prisma.maintenanceRequest.update({
      where: { id: dequeued.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'MAINTENANCE_DEQUEUED_COMPLETED',
        details: `Processed Ticket ${dequeued.requestId} (${dequeued.category} in ${dequeued.roomNumber})`,
        entityType: 'Maintenance',
        entityId: dequeued.id,
        performedBy: 'Warden / Maintenance Head',
      },
    });

    const nextWaiting = dsaService.maintenanceQueue.peek();

    res.json({
      success: true,
      message: `Processed Ticket #${dequeued.requestId} (${dequeued.category} for Room ${dequeued.roomNumber}) in FIFO order!`,
      processedRequest: updated,
      dsaOperation: {
        operation: 'FIFO Dequeue (Pop from Front)',
        dataStructure: 'Queue ADT',
        timeComplexity,
        remainingQueueLength: queueLength,
        nextInLine: nextWaiting ? `#${nextWaiting.requestId} (${nextWaiting.category})` : 'Queue Empty',
        description,
      },
    });
  } catch (error) {
    console.error('Error processing next maintenance request:', error);
    res.status(500).json({ success: false, message: 'Failed to process maintenance request.' });
  }
};

export const updateMaintenanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.maintenanceRequest.update({
      where: { id: id as string },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });

    // Re-sync queue from database
    const dsaService = DSAService.getInstance();
    const pending = await prisma.maintenanceRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
    });
    dsaService.maintenanceQueue.clear();
    for (const r of pending) {
      dsaService.maintenanceQueue.enqueue(r);
    }

    res.json({ success: true, message: 'Status updated.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request.' });
  }
};

export const deleteMaintenanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const request = await prisma.maintenanceRequest.findFirst({
      where: { OR: [{ id: String(id) }, { requestId: String(id) }] },
    });
    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance request not found.' });
      return;
    }
    await prisma.maintenanceRequest.delete({ where: { id: request.id } });

    // Re-sync FIFO queue
    const dsaService = DSAService.getInstance();
    const pending = await prisma.maintenanceRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { submittedAt: 'asc' },
    });
    dsaService.maintenanceQueue.clear();
    for (const r of pending) {
      dsaService.maintenanceQueue.enqueue(r);
    }

    res.json({ success: true, message: `Maintenance request #${request.requestId} deleted.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete maintenance request.' });
  }
};

