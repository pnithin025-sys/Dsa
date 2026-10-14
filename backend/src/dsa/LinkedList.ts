/**
 * Student Linked List (List ADT)
 * Implements a singly linked list specifically designed for Student record management.
 * Demonstrates node chaining, traversal, search, insertion, and deletion.
 */

export class StudentNode<T> {
  public data: T;
  public next: StudentNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

export interface DSAOperationLog {
  operation: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  stepsCount: number;
  description: string;
  timestamp: string;
}

export class StudentLinkedList<T extends { studentId: string; name: string }> {
  private head: StudentNode<T> | null = null;
  private length: number = 0;

  constructor() {
    this.head = null;
    this.length = 0;
  }

  /**
   * Insert student at head: O(1)
   */
  public insertAtHead(student: T): DSAOperationLog {
    const newNode = new StudentNode<T>(student);
    newNode.next = this.head;
    this.head = newNode;
    this.length++;

    return {
      operation: 'Insert at Head',
      dataStructure: 'Singly Linked List',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      stepsCount: 1,
      description: `Inserted student ${student.name} (${student.studentId}) at the head of the linked list.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Insert student at tail: O(n)
   */
  public insertAtTail(student: T): DSAOperationLog {
    const newNode = new StudentNode<T>(student);
    if (!this.head) {
      this.head = newNode;
      this.length++;
      return {
        operation: 'Insert at Tail (Empty List)',
        dataStructure: 'Singly Linked List',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        stepsCount: 1,
        description: `List was empty. Set ${student.name} as head.`,
        timestamp: new Date().toISOString(),
      };
    }

    let current = this.head;
    let steps = 0;
    while (current.next !== null) {
      current = current.next;
      steps++;
    }
    current.next = newNode;
    this.length++;

    return {
      operation: 'Insert at Tail',
      dataStructure: 'Singly Linked List',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      stepsCount: steps + 1,
      description: `Traversed ${steps} nodes and appended ${student.name} (${student.studentId}) at tail.`,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Search student by studentId: O(n)
   */
  public search(studentId: string): { found: T | null; log: DSAOperationLog; stepByStep: string[] } {
    let current = this.head;
    let steps = 0;
    const stepByStep: string[] = [];

    while (current !== null) {
      steps++;
      stepByStep.push(`Step ${steps}: Inspected node with ID [${current.data.studentId}]`);
      if (current.data.studentId.toUpperCase() === studentId.toUpperCase()) {
        stepByStep.push(`Match confirmed! Found student: ${current.data.name}`);
        return {
          found: current.data,
          stepByStep,
          log: {
            operation: 'Linear Search in Linked List',
            dataStructure: 'Singly Linked List',
            timeComplexity: 'O(n) - Best: O(1), Worst: O(n)',
            spaceComplexity: 'O(1)',
            stepsCount: steps,
            description: `Found student ${current.data.name} after visiting ${steps} node(s).`,
            timestamp: new Date().toISOString(),
          },
        };
      }
      current = current.next;
    }

    stepByStep.push(`Traversed entire list (length: ${this.length}). Student with ID ${studentId} not found.`);
    return {
      found: null,
      stepByStep,
      log: {
        operation: 'Linear Search in Linked List (Not Found)',
        dataStructure: 'Singly Linked List',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        stepsCount: steps,
        description: `Searched ${steps} nodes, record not present in linked list.`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Delete student by studentId: O(n)
   */
  public delete(studentId: string): { success: boolean; log: DSAOperationLog } {
    if (!this.head) {
      return {
        success: false,
        log: {
          operation: 'Delete',
          dataStructure: 'Singly Linked List',
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          stepsCount: 0,
          description: 'Cannot delete from empty list.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    let steps = 1;
    if (this.head.data.studentId.toUpperCase() === studentId.toUpperCase()) {
      this.head = this.head.next;
      this.length--;
      return {
        success: true,
        log: {
          operation: 'Delete Head Node',
          dataStructure: 'Singly Linked List',
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          stepsCount: 1,
          description: `Deleted head node matching ${studentId}. Updated head pointer.`,
          timestamp: new Date().toISOString(),
        },
      };
    }

    let current = this.head;
    while (current.next !== null && current.next.data.studentId.toUpperCase() !== studentId.toUpperCase()) {
      current = current.next;
      steps++;
    }

    if (current.next !== null) {
      const deletedStudent = current.next.data;
      current.next = current.next.next;
      this.length--;
      return {
        success: true,
        log: {
          operation: 'Delete Intermediate Node',
          dataStructure: 'Singly Linked List',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          stepsCount: steps + 1,
          description: `Unlinked node for ${deletedStudent.name} (${studentId}) at position ${steps + 1}.`,
          timestamp: new Date().toISOString(),
        },
      };
    }

    return {
      success: false,
      log: {
        operation: 'Delete (Node Not Found)',
        dataStructure: 'Singly Linked List',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        stepsCount: steps,
        description: `Student ID ${studentId} not found in linked list after ${steps} checks.`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Update student: O(n)
   */
  public update(studentId: string, updatedData: Partial<T>): { success: boolean; log: DSAOperationLog } {
    let current = this.head;
    let steps = 0;

    while (current !== null) {
      steps++;
      if (current.data.studentId.toUpperCase() === studentId.toUpperCase()) {
        current.data = { ...current.data, ...updatedData };
        return {
          success: true,
          log: {
            operation: 'Update Node Data',
            dataStructure: 'Singly Linked List',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            stepsCount: steps,
            description: `Updated record for ${studentId} after ${steps} traversal step(s).`,
            timestamp: new Date().toISOString(),
          },
        };
      }
      current = current.next;
    }

    return {
      success: false,
      log: {
        operation: 'Update Node Data (Not Found)',
        dataStructure: 'Singly Linked List',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        stepsCount: steps,
        description: `Student ${studentId} not found to update.`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Convert linked list to array for serialization / display
   */
  public toArray(): T[] {
    const list: T[] = [];
    let current = this.head;
    while (current !== null) {
      list.push(current.data);
      current = current.next;
    }
    return list;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.length === 0;
  }
}
