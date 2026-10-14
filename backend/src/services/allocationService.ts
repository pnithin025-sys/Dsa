import { PrismaClient } from '@prisma/client';
import { DSAService } from './dsaService';

const prisma = new PrismaClient();

export interface AllocationTraceStep {
  step: number;
  action: string;
  detail: string;
  status: 'INFO' | 'SUCCESS' | 'WARNING';
}

export interface AllocationResult {
  success: boolean;
  message: string;
  studentName?: string;
  studentId?: string;
  blockName?: string;
  roomNumber?: string;
  bedNumber?: number;
  steps: AllocationTraceStep[];
  algorithmComplexity: {
    roomSearch: string;
    bedAssignment: string;
    overall: string;
  };
}

export class AllocationService {
  /**
   * Room Allocation Algorithm
   * 1. Check student existence and current allocation status.
   * 2. Filter target block rooms based on gender/preference.
   * 3. Efficiently search available rooms with availableBeds > 0.
   * 4. Locate first unallocated bed.
   * 5. Atomically update bed, room occupancy, and student record.
   * 6. Synchronize in-memory StudentLinkedList, HashTable, and HostelTree.
   */
  public static async allocateRoom(
    studentId: string,
    targetBlockId?: string,
    preferredRoomType?: string
  ): Promise<AllocationResult> {
    const steps: AllocationTraceStep[] = [];
    const dsaService = DSAService.getInstance();

    steps.push({
      step: 1,
      action: 'Fetch Student Record',
      detail: `Querying student with ID: ${studentId}`,
      status: 'INFO',
    });

    const student = await prisma.student.findUnique({
      where: { studentId },
      include: { room: true, bed: true },
    });

    if (!student) {
      steps.push({
        step: 2,
        action: 'Student Validation Failed',
        detail: `No student found matching ID ${studentId}.`,
        status: 'WARNING',
      });
      return {
        success: false,
        message: `Student with ID ${studentId} does not exist.`,
        steps,
        algorithmComplexity: { roomSearch: 'O(1)', bedAssignment: 'O(1)', overall: 'O(1)' },
      };
    }

    if (student.roomId && student.bedId) {
      steps.push({
        step: 2,
        action: 'Existing Allocation Found',
        detail: `Student ${student.name} is already assigned to Room ${student.room?.roomNumber}, Bed ${student.bed?.bedNumber}.`,
        status: 'WARNING',
      });
      return {
        success: false,
        message: `Student ${student.name} is already assigned to Room ${student.room?.roomNumber}, Bed ${student.bed?.bedNumber}. Vacate first before reallocating.`,
        studentName: student.name,
        studentId: student.studentId,
        steps,
        algorithmComplexity: { roomSearch: 'O(1)', bedAssignment: 'O(1)', overall: 'O(1)' },
      };
    }

    steps.push({
      step: 2,
      action: 'Filter Hostel Blocks',
      detail: `Student Gender: ${student.gender}. Determining eligible blocks.`,
      status: 'INFO',
    });

    // Determine target block based on student gender if not explicitly passed
    let blockId = targetBlockId;
    if (!blockId) {
      const eligibleBlock = await prisma.hostelBlock.findFirst({
        where: {
          genderType: student.gender === 'FEMALE' ? 'GIRLS' : 'BOYS',
        },
      });
      if (eligibleBlock) {
        blockId = eligibleBlock.id;
      } else {
        // Fallback to COED block
        const coed = await prisma.hostelBlock.findFirst({ where: { genderType: 'COED' } });
        blockId = coed?.id;
      }
    }

    const block = await prisma.hostelBlock.findUnique({ where: { id: blockId } });
    steps.push({
      step: 3,
      action: 'Search Available Rooms',
      detail: `Scanning rooms in [${block?.name || 'Selected Block'}] with capacity > occupied beds...`,
      status: 'INFO',
    });

    // Query rooms with available beds
    const roomQuery: any = {
      blockId,
      availableBeds: { gt: 0 },
      status: { in: ['AVAILABLE', 'PARTIALLY_OCCUPIED'] },
    };

    if (preferredRoomType) {
      roomQuery.roomType = preferredRoomType;
    }

    const availableRooms = await prisma.room.findMany({
      where: roomQuery,
      include: {
        beds: {
          where: { isOccupied: false },
          orderBy: { bedNumber: 'asc' },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    if (availableRooms.length === 0) {
      steps.push({
        step: 4,
        action: 'Exhausted Availability',
        detail: `No vacant beds found in ${block?.name} matching criteria.`,
        status: 'WARNING',
      });
      return {
        success: false,
        message: `No vacant rooms available in ${block?.name}. All beds are currently occupied.`,
        studentName: student.name,
        studentId: student.studentId,
        steps,
        algorithmComplexity: { roomSearch: 'O(R)', bedAssignment: 'O(B)', overall: 'O(R * B)' },
      };
    }

    // Select first room and first available bed
    const selectedRoom = availableRooms[0];
    const selectedBed = selectedRoom.beds[0];

    steps.push({
      step: 4,
      action: 'Optimal Bed Selected',
      detail: `Allocating first suitable match: Room ${selectedRoom.roomNumber}, Bed ${selectedBed.bedNumber}.`,
      status: 'SUCCESS',
    });

    // Execute atomic assignment
    await prisma.$transaction([
      prisma.bed.update({
        where: { id: selectedBed.id },
        data: { isOccupied: true },
      }),
      prisma.room.update({
        where: { id: selectedRoom.id },
        data: {
          occupiedBeds: { increment: 1 },
          availableBeds: { decrement: 1 },
          status: selectedRoom.occupiedBeds + 1 >= selectedRoom.capacity ? 'FULL' : 'PARTIALLY_OCCUPIED',
        },
      }),
      prisma.student.update({
        where: { id: student.id },
        data: {
          blockId: block?.id,
          roomId: selectedRoom.id,
          bedId: selectedBed.id,
        },
      }),
      prisma.activityLog.create({
        data: {
          action: 'ROOM_ALLOCATED',
          details: `Student ${student.name} (${student.studentId}) allocated to ${block?.name}, Room ${selectedRoom.roomNumber}, Bed ${selectedBed.bedNumber}`,
          entityType: 'Room',
          entityId: selectedRoom.id,
          performedBy: 'System Algorithm',
        },
      }),
    ]);

    steps.push({
      step: 5,
      action: 'State Synchronization',
      detail: 'Updated database relations and recorded activity log.',
      status: 'SUCCESS',
    });

    // Update in-memory DSA structures
    const updatedStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: { room: true, bed: true },
    });

    if (updatedStudent) {
      dsaService.studentLinkedList.update(updatedStudent.studentId, updatedStudent);
      dsaService.studentHashTable.insert(updatedStudent.studentId, updatedStudent);
      dsaService.recordOperation({
        operation: 'Room Allocation (Search & Update)',
        dataStructure: 'Linked List + Hash Table',
        timeComplexity: 'O(R + B)',
        spaceComplexity: 'O(1)',
        stepsCount: steps.length,
        description: `Allocated ${student.name} to Room ${selectedRoom.roomNumber}, Bed ${selectedBed.bedNumber}`,
        timestamp: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `Successfully allocated Room ${selectedRoom.roomNumber}, Bed ${selectedBed.bedNumber} in ${block?.name} to ${student.name}.`,
      studentName: student.name,
      studentId: student.studentId,
      blockName: block?.name,
      roomNumber: selectedRoom.roomNumber,
      bedNumber: selectedBed.bedNumber,
      steps,
      algorithmComplexity: {
        roomSearch: 'O(R) where R is total rooms in block',
        bedAssignment: 'O(B) where B is beds per room (typically 4)',
        overall: 'O(R + B) Linear Scan & First-Fit Selection',
      },
    };
  }

  /**
   * Vacate a student from their allocated bed
   */
  public static async vacateRoom(studentId: string): Promise<{ success: boolean; message: string }> {
    const student = await prisma.student.findUnique({
      where: { studentId },
      include: { room: true, bed: true },
    });

    if (!student || !student.roomId || !student.bedId) {
      return { success: false, message: 'Student does not currently have an allocated bed.' };
    }

    const roomId = student.roomId;
    const bedId = student.bedId;
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    await prisma.$transaction([
      prisma.bed.update({
        where: { id: bedId },
        data: { isOccupied: false },
      }),
      prisma.room.update({
        where: { id: roomId },
        data: {
          occupiedBeds: { decrement: 1 },
          availableBeds: { increment: 1 },
          status: (room?.occupiedBeds || 1) - 1 <= 0 ? 'AVAILABLE' : 'PARTIALLY_OCCUPIED',
        },
      }),
      prisma.student.update({
        where: { id: student.id },
        data: {
          blockId: null,
          roomId: null,
          bedId: null,
        },
      }),
      prisma.activityLog.create({
        data: {
          action: 'ROOM_VACATED',
          details: `Student ${student.name} (${student.studentId}) vacated Room ${room?.roomNumber}`,
          entityType: 'Room',
          entityId: roomId,
          performedBy: 'System Algorithm',
        },
      }),
    ]);

    const dsaService = DSAService.getInstance();
    const updated = await prisma.student.findUnique({ where: { id: student.id } });
    if (updated) {
      dsaService.studentLinkedList.update(updated.studentId, updated);
      dsaService.studentHashTable.insert(updated.studentId, updated);
    }

    return { success: true, message: `Bed vacated successfully for student ${student.name}.` };
  }
}
