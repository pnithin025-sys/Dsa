import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';

const prisma = new PrismaClient();

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    // 1. Metric Counts
    const totalStudents = await prisma.student.count();
    const totalRooms = await prisma.room.count();
    const rooms = await prisma.room.findMany();
    const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const availableBeds = rooms.reduce((acc, r) => acc + r.availableBeds, 0);
    const fullyOccupiedRooms = rooms.filter((r) => r.status === 'FULL').length;

    const pendingComplaints = await prisma.complaint.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'] } },
    });

    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: 'PENDING' },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVisitors = await prisma.visitor.count({
      where: { entryTime: { gte: startOfToday } },
    });

    // 2. Room Occupancy by Block (Chart 1)
    const blocks = await prisma.hostelBlock.findMany({
      include: { rooms: true },
    });

    const roomOccupancyByBlock = blocks.map((b) => {
      const cap = b.rooms.reduce((acc, r) => acc + r.capacity, 0);
      const occ = b.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
      return {
        block: b.name,
        capacity: cap,
        occupied: occ,
        available: cap - occ,
        rate: cap > 0 ? Number(((occ / cap) * 100).toFixed(1)) : 0,
      };
    });

    // 3. Complaints by Category (Chart 2)
    const complaints = await prisma.complaint.findMany();
    const complaintCategoryMap: { [cat: string]: number } = {};
    for (const c of complaints) {
      complaintCategoryMap[c.category] = (complaintCategoryMap[c.category] || 0) + 1;
    }
    const complaintsByCategory = Object.entries(complaintCategoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    // 4. Maintenance Requests by Status (Chart 3)
    const maintenance = await prisma.maintenanceRequest.findMany();
    const maintenanceMap: { [status: string]: number } = {};
    for (const m of maintenance) {
      maintenanceMap[m.status] = (maintenanceMap[m.status] || 0) + 1;
    }
    const maintenanceStatus = Object.entries(maintenanceMap).map(([status, count]) => ({
      status,
      count,
    }));

    // 5. Student Distribution by Department (Chart 4)
    const students = await prisma.student.findMany();
    const deptMap: { [dept: string]: number } = {};
    for (const s of students) {
      deptMap[s.department] = (deptMap[s.department] || 0) + 1;
    }
    const studentsByDepartment = Object.entries(deptMap).map(([dept, count]) => ({
      dept,
      count,
    }));

    // 6. Recent Activity Log (Stack-driven LIFO)
    const recentActivities = await prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        kpi: {
          totalStudents,
          totalRooms,
          totalBeds,
          occupiedBeds,
          availableBeds,
          fullyOccupiedRooms,
          occupancyPercentage: totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0,
          pendingComplaints,
          pendingMaintenance,
          todayVisitors,
        },
        charts: {
          roomOccupancyByBlock,
          complaintsByCategory,
          maintenanceStatus,
          studentsByDepartment,
        },
        recentActivities,
        dsaState: {
          studentListLength: dsaService.studentLinkedList.size(),
          visitorStackDepth: dsaService.visitorStack.size(),
          maintenanceQueueLength: dsaService.maintenanceQueue.size(),
          hashTableLoadFactor: Number((dsaService.studentHashTable.size() / 19).toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
};
