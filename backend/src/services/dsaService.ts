import { PrismaClient } from '@prisma/client';
import { StudentLinkedList, DSAOperationLog } from '../dsa/LinkedList';
import { CustomStack } from '../dsa/Stack';
import { CustomQueue } from '../dsa/Queue';
import { CustomHashTable } from '../dsa/HashTable';
import { HostelBinaryTree } from '../dsa/BinaryTree';
import { FacilityGraph } from '../dsa/Graph';
import { SearchingAlgorithms } from '../dsa/Searching';
import { SortingAlgorithms } from '../dsa/Sorting';

const prisma = new PrismaClient();

export class DSAService {
  private static instance: DSAService;

  public studentLinkedList: StudentLinkedList<any>;
  public visitorStack: CustomStack<any>;
  public maintenanceQueue: CustomQueue<any>;
  public studentHashTable: CustomHashTable<any>;
  public hostelTree: HostelBinaryTree;
  public facilityGraph: FacilityGraph;
  public lastOperations: DSAOperationLog[] = [];

  private isInitialized = false;

  private constructor() {
    this.studentLinkedList = new StudentLinkedList();
    this.visitorStack = new CustomStack();
    this.maintenanceQueue = new CustomQueue();
    this.studentHashTable = new CustomHashTable(19);
    this.hostelTree = new HostelBinaryTree();
    this.facilityGraph = new FacilityGraph();
  }

  public static getInstance(): DSAService {
    if (!DSAService.instance) {
      DSAService.instance = new DSAService();
    }
    return DSAService.instance;
  }

  /**
   * Hydrates all DSA data structures from the SQLite database
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing in-memory DSA data structures from database...');

      // 1. Populate Student Linked List & Hash Table
      const students = await prisma.student.findMany({
        include: { room: true, bed: true },
        orderBy: { studentId: 'asc' },
      });

      this.studentLinkedList = new StudentLinkedList();
      this.studentHashTable = new CustomHashTable(19);

      for (const student of students) {
        this.studentLinkedList.insertAtTail(student);
        this.studentHashTable.insert(student.studentId, student);
      }

      // 2. Populate Visitor Stack (LIFO: push recent visitor logs)
      const visitors = await prisma.visitor.findMany({
        orderBy: { entryTime: 'asc' }, // Older first, so latest ends up at TOP of stack
      });

      this.visitorStack = new CustomStack();
      for (const visitor of visitors) {
        this.visitorStack.push(visitor);
      }

      // 3. Populate Maintenance Queue (FIFO: oldest pending requests at front)
      const pendingMaintenance = await prisma.maintenanceRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { submittedAt: 'asc' },
      });

      this.maintenanceQueue = new CustomQueue();
      for (const req of pendingMaintenance) {
        this.maintenanceQueue.enqueue(req);
      }

      // 4. Build Hostel Hierarchy Tree
      const blocks = await prisma.hostelBlock.findMany({
        include: {
          floors: {
            include: {
              rooms: {
                include: {
                  beds: {
                    include: { student: true },
                  },
                },
              },
            },
          },
        },
      });

      this.hostelTree.root = HostelBinaryTree.buildHierarchicalTree(blocks);

      // 5. Build Facility Navigation Graph
      const facilities = await prisma.facility.findMany();
      const edges = await prisma.facilityEdge.findMany({
        include: { sourceFacility: true, targetFacility: true },
      });

      this.facilityGraph = new FacilityGraph();
      for (const fac of facilities) {
        this.facilityGraph.addVertex({
          id: fac.id,
          code: fac.code,
          name: fac.name,
          category: fac.category,
          description: fac.description || undefined,
          xCoord: fac.xCoord,
          yCoord: fac.yCoord,
        });
      }

      for (const edge of edges) {
        this.facilityGraph.addEdge(
          edge.sourceFacilityId,
          edge.targetFacilityId,
          edge.distanceMeters,
          edge.pathwayType
        );
      }

      this.isInitialized = true;
      console.log('✅ In-memory DSA Data Structures successfully synchronized!');
    } catch (err) {
      console.error('❌ Failed to initialize DSA structures:', err);
    }
  }

  public recordOperation(log: DSAOperationLog): void {
    this.lastOperations.unshift(log);
    if (this.lastOperations.length > 20) {
      this.lastOperations.pop();
    }
  }
}
