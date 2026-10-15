import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, priority, status, search } = req.query;

    const whereClause: any = {};
    if (category) whereClause.category = String(category);
    if (priority) whereClause.priority = String(priority);
    if (status) whereClause.status = String(status);
    if (search) {
      whereClause.OR = [
        { complaintId: { contains: String(search) } },
        { studentName: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, studentId: true, name: true, department: true, room: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.complaint.count();
    const submitted = await prisma.complaint.count({ where: { status: 'SUBMITTED' } });
    const inProgress = await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } });
    const resolved = await prisma.complaint.count({ where: { status: 'RESOLVED' } });

    res.json({
      success: true,
      data: complaints,
      stats: {
        total,
        submitted,
        inProgress,
        resolved,
      },
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
};

export const createComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, category, description, priority } = req.body;

    if (!studentId || !category || !description) {
      res.status(400).json({ success: false, message: 'Student ID, category, and description are required.' });
      return;
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ id: studentId }, { studentId }] },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    const count = await prisma.complaint.count();
    const complaintId = `CMP${101 + count}`;

    const newComplaint = await prisma.complaint.create({
      data: {
        complaintId,
        studentId: student.id,
        studentName: student.name,
        category: category.toUpperCase(),
        description,
        priority: priority ? priority.toUpperCase() : 'MEDIUM',
        status: 'SUBMITTED',
      },
    });

    await prisma.activityLog.create({
      data: {
        action: 'COMPLAINT_FILED',
        details: `Ticket ${complaintId} (${category}) filed by ${student.name}`,
        entityType: 'Complaint',
        entityId: newComplaint.id,
        performedBy: student.name,
      },
    });

    res.status(201).json({
      success: true,
      message: `Complaint #${complaintId} submitted successfully.`,
      data: newComplaint,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ success: false, message: 'Failed to submit complaint.' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updated = await prisma.complaint.update({
      where: { id: id as string },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
      },
    });

    res.json({ success: true, message: 'Complaint status updated.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update complaint status.' });
  }
};

export const deleteComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await prisma.complaint.findFirst({
      where: { OR: [{ id: String(id) }, { complaintId: String(id) }] },
    });
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint record not found.' });
      return;
    }
    await prisma.complaint.delete({ where: { id: complaint.id } });
    res.json({ success: true, message: `Complaint #${complaint.complaintId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete complaint.' });
  }
};

