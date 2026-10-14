/**
 * Stack ADT (LIFO - Last In First Out)
 * Used for Visitor Log history, Action Tracking, and Navigation backtracking.
 */

export class StackNode<T> {
  public data: T;
  public next: StackNode<T> | null;

  constructor(data: T) {
    this.data = data;
    this.next = null;
  }
}

export class CustomStack<T> {
  private topNode: StackNode<T> | null = null;
  private count: number = 0;

  constructor() {
    this.topNode = null;
    this.count = 0;
  }

  /**
   * Push item onto stack: O(1)
   */
  public push(item: T): { item: T; stackSize: number; timeComplexity: string; description: string } {
    const newNode = new StackNode<T>(item);
    newNode.next = this.topNode;
    this.topNode = newNode;
    this.count++;

    return {
      item,
      stackSize: this.count,
      timeComplexity: 'O(1)',
      description: `Pushed item to top of stack. New stack depth is ${this.count}.`,
    };
  }

  /**
   * Pop item from top of stack: O(1)
   */
  public pop(): { popped: T | null; stackSize: number; timeComplexity: string; description: string } {
    if (!this.topNode) {
      return {
        popped: null,
        stackSize: 0,
        timeComplexity: 'O(1)',
        description: 'Stack Underflow: Stack is empty, cannot pop.',
      };
    }

    const poppedData = this.topNode.data;
    this.topNode = this.topNode.next;
    this.count--;

    return {
      popped: poppedData,
      stackSize: this.count,
      timeComplexity: 'O(1)',
      description: 'Popped topmost item from stack.',
    };
  }

  /**
   * Peek topmost item without removing: O(1)
   */
  public peek(): T | null {
    return this.topNode ? this.topNode.data : null;
  }

  public isEmpty(): boolean {
    return this.count === 0;
  }

  public size(): number {
    return this.count;
  }

  /**
   * Return stack items from Top to Bottom
   */
  public toArray(): T[] {
    const items: T[] = [];
    let current = this.topNode;
    while (current !== null) {
      items.push(current.data);
      current = current.next;
    }
    return items;
  }

  public clear(): void {
    this.topNode = null;
    this.count = 0;
  }
}
