import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AllocationService } from '../services/allocationService';

const prisma = new PrismaClient();

export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockId, status, roomType, floor } = req.query;

    const whereClause: any = {};
    if (blockId) whereClause.blockId = String(blockId);
    if (status) whereClause.status = String(status);
    if (roomType) whereClause.roomType = String(roomType);
    if (floor) whereClause.floor = { floorNumber: Number(floor) };

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        block: true,
        floor: true,
        beds: {
          include: {
            student: {
              select: { id: true, studentId: true, name: true, department: true, year: true, phone: true },
            },
          },
          orderBy: { bedNumber: 'asc' },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    // Calculate room summary stats
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const availableBeds = rooms.reduce((acc, r) => acc + r.availableBeds, 0);
    const occupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      data: rooms,
      summary: {
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve rooms.' });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findFirst({
      where: {
        OR: [{ id: id as string }, { roomNumber: id as string }],
      },
      include: {
        block: true,
        floor: true,
        beds: {
          include: { student: true },
          orderBy: { bedNumber: 'asc' },
        },
      },
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }

    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve room details.' });
  }
};

export const allocateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, targetBlockId, preferredRoomType } = req.body;

    if (!studentId) {
      res.status(400).json({ success: false, message: 'Please specify the studentId to allocate.' });
      return;
    }

    const result = await AllocationService.allocateRoom(studentId, targetBlockId, preferredRoomType);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error during room allocation:', error);
    res.status(500).json({ success: false, message: error.message || 'Room allocation failed.' });
  }
};

export const vacateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({ success: false, message: 'Student ID is required.' });
      return;
    }

    const result = await AllocationService.vacateRoom(studentId);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to vacate bed.' });
  }
};

export const updateRoomStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, roomType } = req.body;

    const updated = await prisma.room.update({
      where: { id: id as string },
      data: {
        ...(status && { status }),
        ...(roomType && { roomType }),
      },
    });

    res.json({ success: true, message: 'Room status updated successfully.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update room status.' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findFirst({
      where: { OR: [{ id: String(id) }, { roomNumber: String(id) }] },
    });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found.' });
      return;
    }
    // Vacate any students in room first
    await prisma.student.updateMany({
      where: { roomId: room.id },
      data: { roomId: null, bedId: null },
    });
    // Delete beds
    await prisma.bed.deleteMany({ where: { roomId: room.id } });
    // Delete room
    await prisma.room.delete({ where: { id: room.id } });

    res.json({ success: true, message: `Room ${room.roomNumber} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete room.' });
  }
};

