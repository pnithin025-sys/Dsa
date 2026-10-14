import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type = 'students', startDate, endDate } = req.query;

    let reportData: any[] = [];
    let title = '';
    let columns: { key: string; label: string }[] = [];

    if (type === 'occupancy') {
      title = 'Hostel Room Occupancy Report';
      const rooms = await prisma.room.findMany({
        include: { block: true, floor: true, beds: { include: { student: true } } },
        orderBy: { roomNumber: 'asc' },
      });

      columns = [
        { key: 'roomNumber', label: 'Room Number' },
        { key: 'block', label: 'Block' },
        { key: 'floor', label: 'Floor' },
        { key: 'type', label: 'Room Type' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'occupied', label: 'Occupied' },
        { key: 'available', label: 'Available' },
        { key: 'status', label: 'Status' },
      ];

      reportData = rooms.map((r) => ({
        roomNumber: r.roomNumber,
        block: r.block.name,
        floor: r.floor.name,
        type: r.roomType,
        capacity: r.capacity,
        occupied: r.occupiedBeds,
        available: r.availableBeds,
        status: r.status,
      }));
    } else if (type === 'visitors') {
      title = 'Visitor Entry Log Report';
      const visitors = await prisma.visitor.findMany({
        include: { student: true },
        orderBy: { entryTime: 'desc' },
      });

      columns = [
        { key: 'visitorId', label: 'Pass ID' },
        { key: 'name', label: 'Visitor Name' },
        { key: 'studentName', label: 'Student Visited' },
        { key: 'phone', label: 'Contact' },
        { key: 'relationship', label: 'Relationship' },
        { key: 'purpose', label: 'Purpose' },
        { key: 'entryTime', label: 'Entry Time' },
        { key: 'status', label: 'Status' },
      ];

      reportData = visitors.map((v) => ({
        visitorId: v.visitorId,
        name: v.name,
        studentName: v.studentName,
        phone: v.phone,
        relationship: v.relationship,
        purpose: v.purpose,
        entryTime: new Date(v.entryTime).toLocaleString(),
        status: v.status,
      }));
    } else if (type === 'complaints') {
      title = 'Complaints & Grievances Report';
      const complaints = await prisma.complaint.findMany({
        orderBy: { createdAt: 'desc' },
      });

      columns = [
        { key: 'complaintId', label: 'Ticket ID' },
        { key: 'studentName', label: 'Student' },
        { key: 'category', label: 'Category' },
        { key: 'priority', label: 'Priority' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Filed Date' },
      ];

      reportData = complaints.map((c) => ({
        complaintId: c.complaintId,
        studentName: c.studentName,
        category: c.category,
        priority: c.priority,
        description: c.description,
        status: c.status,
        createdAt: new Date(c.createdAt).toLocaleDateString(),
      }));
    } else if (type === 'maintenance') {
      title = 'Maintenance Queue & Resolutions Report';
      const requests = await prisma.maintenanceRequest.findMany({
        orderBy: { submittedAt: 'desc' },
      });

      columns = [
        { key: 'requestId', label: 'Request ID' },
        { key: 'roomNumber', label: 'Room' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Issue Description' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Queue Status' },
        { key: 'submittedAt', label: 'Submission Time' },
      ];

      reportData = requests.map((m) => ({
        requestId: m.requestId,
        roomNumber: m.roomNumber,
        category: m.category,
        description: m.description,
        priority: m.priority,
        status: m.status,
        submittedAt: new Date(m.submittedAt).toLocaleString(),
      }));
    } else {
      title = 'Student Master Roster Report';
      const students = await prisma.student.findMany({
        include: { room: { include: { block: true } }, bed: true },
        orderBy: { studentId: 'asc' },
      });

      columns = [
        { key: 'studentId', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'regNumber', label: 'Register No' },
        { key: 'department', label: 'Department' },
        { key: 'year', label: 'Year' },
        { key: 'block', label: 'Hostel Block' },
        { key: 'room', label: 'Room' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' },
      ];

      reportData = students.map((s) => ({
        studentId: s.studentId,
        name: s.name,
        regNumber: s.regNumber,
        department: s.department,
        year: `Year ${s.year}`,
        block: s.room?.block?.name || 'Unassigned',
        room: s.room?.roomNumber ? `${s.room.roomNumber} (Bed ${s.bed?.bedNumber || 1})` : 'Unassigned',
        phone: s.phone,
        status: s.status,
      }));
    }

    res.json({
      success: true,
      title,
      type,
      generatedAt: new Date().toLocaleString(),
      totalRecords: reportData.length,
      columns,
      data: reportData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
};
