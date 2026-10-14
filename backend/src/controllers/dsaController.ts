import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';
import { SearchingAlgorithms } from '../dsa/Searching';
import { SortingAlgorithms } from '../dsa/Sorting';

const prisma = new PrismaClient();

export const getDsaSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    const summary = [
      {
        id: 'linked-list',
        name: 'List ADT (Linked List)',
        application: 'Student Management & Dynamic Record Storage',
        operations: ['Insert at Head O(1)', 'Insert at Tail O(n)', 'Search O(n)', 'Delete O(n)'],
        activeItemsCount: dsaService.studentLinkedList.size(),
        timeComplexity: 'O(1) to O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        id: 'stack',
        name: 'Stack (LIFO)',
        application: 'Visitor Entry History & Recent Administrative Actions',
        operations: ['Push O(1)', 'Pop O(1)', 'Peek O(1)', 'isEmpty O(1)'],
        activeItemsCount: dsaService.visitorStack.size(),
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)',
      },
      {
        id: 'queue',
        name: 'Queue (FIFO)',
        application: 'Maintenance Ticket Pipeline & Order-of-Arrival Processing',
        operations: ['Enqueue O(1)', 'Dequeue O(1)', 'Peek O(1)', 'isEmpty O(1)'],
        activeItemsCount: dsaService.maintenanceQueue.size(),
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(n)',
      },
      {
        id: 'hash-table',
        name: 'Hash Table (Separate Chaining)',
        application: 'Instant Student ID Lookup & Indexing',
        operations: ['Hash Modulo O(1)', 'Search Avg O(1)', 'Insert Avg O(1)', 'Delete Avg O(1)'],
        activeItemsCount: dsaService.studentHashTable.size(),
        timeComplexity: 'Average O(1), Worst O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        id: 'searching',
        name: 'Searching Algorithms',
        application: 'Linear Search (Unsorted) & Binary Search (Sorted Register No)',
        operations: ['Linear Search O(n)', 'Binary Search O(log n)'],
        activeItemsCount: dsaService.studentLinkedList.size(),
        timeComplexity: 'O(log n) to O(n)',
        spaceComplexity: 'O(1)',
      },
      {
        id: 'sorting',
        name: 'Sorting Algorithms',
        application: 'Bubble, Insertion, Merge, and Quick Sort for Student Lists',
        operations: ['Bubble Sort O(n²)', 'Insertion Sort O(n²)', 'Merge Sort O(n log n)', 'Quick Sort O(n log n)'],
        activeItemsCount: dsaService.studentLinkedList.size(),
        timeComplexity: 'O(n log n) to O(n²)',
        spaceComplexity: 'O(1) to O(n)',
      },
      {
        id: 'binary-tree',
        name: 'Hierarchical & Binary Tree',
        application: 'Hostel Hierarchy: Hostel → Block → Floor → Room → Bed',
        operations: ['Preorder O(n)', 'Inorder O(n)', 'Postorder O(n)', 'Level-Order (BFS) O(n)'],
        activeItemsCount: 30, // Rooms in hostel
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
      {
        id: 'graph',
        name: 'Graph (Adjacency List)',
        application: 'Campus Facility Navigation & Shortest Pathway Routing',
        operations: ['BFS Shortest Hops O(V+E)', 'Dijkstra Shortest Meters O((V+E)log V)', 'DFS Exploration O(V+E)'],
        activeItemsCount: dsaService.facilityGraph.getAllVertices().length,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
      },
    ];

    res.json({
      success: true,
      data: summary,
      recentOperations: dsaService.lastOperations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve DSA summary.' });
  }
};

export const visualizeSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key = 'STU1015', algorithm = 'BINARY', field = 'studentId' } = req.body;

    const students = await prisma.student.findMany({
      select: { studentId: true, name: true, regNumber: true, department: true },
      orderBy: { [field]: 'asc' },
    });

    let result: any;
    if (algorithm.toUpperCase() === 'BINARY') {
      result = SearchingAlgorithms.binarySearch(students, key, field);
    } else {
      result = SearchingAlgorithms.linearSearch(students, key, field);
    }

    res.json({
      success: true,
      data: result,
      totalElements: students.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search visualization failed.' });
  }
};

export const visualizeSort = async (req: Request, res: Response): Promise<void> => {
  try {
    const { field = 'studentId', order = 'ASC' } = req.body;

    const students = await prisma.student.findMany({
      select: { studentId: true, name: true, regNumber: true, department: true, year: true },
    });

    const bubble = SortingAlgorithms.bubbleSort(students, field, order);
    const insertion = SortingAlgorithms.insertionSort(students, field, order);
    const merge = SortingAlgorithms.mergeSort(students, field, order);
    const quick = SortingAlgorithms.quickSort(students, field, order);

    res.json({
      success: true,
      data: {
        comparison: [
          bubble.metrics,
          insertion.metrics,
          merge.metrics,
          quick.metrics,
        ],
        sampleSorted: quick.sorted.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sorting visualization failed.' });
  }
};

export const getHashTableState = async (req: Request, res: Response): Promise<void> => {
  try {
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    const buckets = dsaService.studentHashTable.getVisualization();

    res.json({
      success: true,
      data: {
        tableSize: 19,
        totalEntries: dsaService.studentHashTable.size(),
        loadFactor: Number((dsaService.studentHashTable.size() / 19).toFixed(2)),
        collisionHandling: 'Separate Chaining (Linked Nodes in each bucket)',
        hashFormula: 'hash = (Σ charCode(key[i]) * 31^(len-1-i)) mod 19',
        buckets,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve hash table state.' });
  }
};
