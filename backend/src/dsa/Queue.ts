/**
 * Queue ADT (FIFO - First In First Out)
 * Used for Maintenance Requests pipeline and BFS Graph traversal.
 */

export class QueueNode<T> {
  public data: T;
  public next: QueueNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

export class CustomQueue<T> {
  private frontNode: QueueNode<T> | null = null;
  private rearNode: QueueNode<T> | null = null;
  private count: number = 0;

  constructor() {
    this.frontNode = null;
    this.rearNode = null;
    this.count = 0;
  }

  /**
   * Enqueue item at the rear: O(1)
   */
  public enqueue(item: T): { item: T; queueLength: number; timeComplexity: string; description: string } {
    const newNode = new QueueNode<T>(item);
    if (!this.rearNode) {
      this.frontNode = newNode;
      this.rearNode = newNode;
    } else {
      this.rearNode.next = newNode;
      this.rearNode = newNode;
    }
    this.count++;

    return {
      item,
      queueLength: this.count,
      timeComplexity: 'O(1)',
      description: `Enqueued item at rear. Total queue size is now ${this.count}.`,
    };
  }

  /**
   * Dequeue item from the front: O(1)
   */
  public dequeue(): { dequeued: T | null; queueLength: number; timeComplexity: string; description: string } {
    if (!this.frontNode) {
      return {
        dequeued: null,
        queueLength: 0,
        timeComplexity: 'O(1)',
        description: 'Queue Underflow: No items in queue to process.',
      };
    }

    const dequeuedItem = this.frontNode.data;
    this.frontNode = this.frontNode.next;
    if (!this.frontNode) {
      this.rearNode = null;
    }
    this.count--;

    return {
      dequeued: dequeuedItem,
      queueLength: this.count,
      timeComplexity: 'O(1)',
      description: 'Dequeued item from front of queue for processing.',
    };
  }

  /**
   * Peek front item without removing: O(1)
   */
  public peek(): T | null {
    return this.frontNode ? this.frontNode.data : null;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public size(): number {
    return this.count;
  }

  /**
   * Return array of items from Front to Rear
   */
  public toArray(): T[] {
    const items: T[] = [];
    let current = this.frontNode;
    while (current !== null) {
      items.push(current.data);
      current = current.next;
    }
    return items;
  }

  public clear(): void {
    this.frontNode = null;
    this.rearNode = null;
    this.count = 0;
  }
}
