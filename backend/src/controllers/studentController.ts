import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';
import { SearchingAlgorithms } from '../dsa/Searching';
import { SortingAlgorithms } from '../dsa/Sorting';
import { AllocationService } from '../services/allocationService';

const prisma = new PrismaClient();

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, department, year, status, sortBy = 'studentId', sortOrder = 'ASC', sortAlgorithm = 'Quick Sort' } = req.query;

    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    // Query all students with room & bed details
    let students = await prisma.student.findMany({
      include: {
        room: {
          include: { block: true, floor: true },
        },
        bed: true,
      },
      orderBy: { studentId: 'asc' },
    });

    // Apply filters
    if (department) {
      students = students.filter((s) => s.department === department);
    }
    if (year) {
      students = students.filter((s) => s.year === Number(year));
    }
    if (status) {
      students = students.filter((s) => s.status === status);
    }

    let searchResult: any = null;

    // If search query is provided, demonstrate DSA search
    if (search) {
      const q = String(search).trim();
      // Test Hash Table for exact studentId lookup
      const hashLookup = dsaService.studentHashTable.search(q);

      if (hashLookup.found) {
        searchResult = {
          method: 'Hash Table (Separate Chaining)',
          timeComplexity: hashLookup.timeComplexity,
          stepLog: hashLookup.stepLog,
          explanation: hashLookup.explanation,
        };
      } else {
        // Run Linear Search across name or ID
        const linear = SearchingAlgorithms.linearSearch(students, q, 'name');
        searchResult = {
          method: 'Linear Search',
          timeComplexity: linear.timeComplexity.average,
          comparisons: linear.comparisonsCount,
          executionTimeMs: linear.executionTimeMs,
          stepTrace: linear.stepTrace.slice(0, 5),
        };
      }

      // Filter array by query match
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.studentId.toLowerCase().includes(q.toLowerCase()) ||
          s.regNumber.toLowerCase().includes(q.toLowerCase()) ||
          (s.room?.roomNumber && s.room.roomNumber.toLowerCase().includes(q.toLowerCase()))
      );
    }

    // Apply Sorting Algorithm demonstration
    let sortMetrics: any = null;
    const order = (String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';
    const field = String(sortBy) as any;

    if (sortAlgorithm === 'Bubble Sort') {
      const resSort = SortingAlgorithms.bubbleSort(students, field, order);
      students = resSort.sorted;
      sortMetrics = resSort.metrics;
    } else if (sortAlgorithm === 'Insertion Sort') {
      const resSort = SortingAlgorithms.insertionSort(students, field, order);
      students = resSort.sorted;
      sortMetrics = resSort.metrics;
    } else if (sortAlgorithm === 'Merge Sort') {
      const resSort = SortingAlgorithms.mergeSort(students, field, order);
      students = resSort.sorted;
      sortMetrics = resSort.metrics;
    } else {
      const resSort = SortingAlgorithms.quickSort(students, field, order);
      students = resSort.sorted;
      sortMetrics = resSort.metrics;
    }

    res.json({
      success: true,
      totalCount: students.length,
      data: students,
      dsaContext: {
        activeStructure: 'StudentLinkedList (List ADT)',
        totalLinkedListNodes: dsaService.studentLinkedList.size(),
        sortMetrics,
        searchResult,
      },
    });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve students.' });
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    // 1. First check Custom Hash Table: O(1)
    const hashResult = dsaService.studentHashTable.search(id as string);

    // 2. Fetch full relations from database
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: id as string }, { studentId: id as string }, { regNumber: id as string }],
      },
      include: {
        room: { include: { block: true, floor: true } },
        bed: true,
        visitors: { orderBy: { entryTime: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' } },
        maintenanceRequests: { orderBy: { submittedAt: 'desc' } },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, message: `Student with ID "${id}" not found.` });
      return;
    }

    res.json({
      success: true,
      data: student,
      dsaLookup: {
        structure: 'Hash Table with Separate Chaining',
        timeComplexity: hashResult.timeComplexity,
        bucketIndex: hashResult.bucketIndex,
        stepLog: hashResult.stepLog,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve student details.' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      department,
      year,
      gender,
      phone,
      email,
      address,
      parentName,
      parentContact,
      allocateImmediately = false,
      targetBlockId,
      preferredRoomType,
    } = req.body;

    if (!name || !department || !gender || !phone || !email) {
      res.status(400).json({ success: false, message: 'Missing required student fields.' });
      return;
    }

    // Generate unique sequential Student ID and Register Number
    const count = await prisma.student.count();
    const studentId = `STU${1001 + count}`;
    const regNumber = `2024${department.replace(/[^A-Z]/g, '')}${String(100 + count).padStart(3, '0')}`;

    const newStudent = await prisma.student.create({
      data: {
        studentId,
        name,
        regNumber,
        department,
        year: Number(year) || 1,
        gender: gender.toUpperCase(),
        phone,
        email,
        address: address || 'Campus Residence',
        parentName: parentName || 'Parent / Guardian',
        parentContact: parentContact || phone,
        status: 'ACTIVE',
      },
    });

    // Update in-memory DSA structures
    const dsaService = DSAService.getInstance();
    const linkedListLog = dsaService.studentLinkedList.insertAtTail(newStudent);
    dsaService.studentHashTable.insert(newStudent.studentId, newStudent);
    dsaService.recordOperation(linkedListLog);

    let allocationResult: any = null;
    if (allocateImmediately) {
      allocationResult = await AllocationService.allocateRoom(newStudent.studentId, targetBlockId, preferredRoomType);
    }

    res.status(201).json({
      success: true,
      message: `Student ${name} (${studentId}) registered successfully.`,
      data: newStudent,
      allocationResult,
      dsaOperation: linkedListLog,
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to register student.' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await prisma.student.update({
      where: { id: id as string },
      data: updateData,
      include: { room: true, bed: true },
    });

    const dsaService = DSAService.getInstance();
    dsaService.studentLinkedList.update(student.studentId, student);
    dsaService.studentHashTable.insert(student.studentId, student);

    res.json({
      success: true,
      message: 'Student record updated successfully.',
      data: student,
      dsaIndicator: {
        structure: 'StudentLinkedList + HashTable',
        operation: 'In-place Pointer Update',
        timeComplexity: 'O(n) in List / O(1) in HashTable',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id: id as string },
      include: { room: true, bed: true },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    // Vacate bed if currently allocated
    if (student.bedId && student.roomId) {
      await AllocationService.vacateRoom(student.studentId);
    }

    // Delete record from DB
    await prisma.student.delete({ where: { id: id as string } });

    // Remove from in-memory DSA structures
    const dsaService = DSAService.getInstance();
    const deleteLog = dsaService.studentLinkedList.delete(student.studentId);
    dsaService.studentHashTable.delete(student.studentId);
    dsaService.recordOperation(deleteLog.log);

    res.json({
      success: true,
      message: `Student ${student.name} deleted successfully.`,
      dsaOperation: deleteLog.log,
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};
