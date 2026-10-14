/**
 * Hash Table with Separate Chaining
 * Provides average O(1) time complexity student record lookup.
 * Handles collisions via linked buckets.
 */

export class HashNode<K, V> {
  public key: K;
  public value: V;
  public next: HashNode<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

export interface BucketView<V> {
  index: number;
  chainLength: number;
  entries: { key: string; value: V }[];
}

export class CustomHashTable<V> {
  private buckets: (HashNode<string, V> | null)[];
  private tableSize: number;
  private count: number;

  constructor(size: number = 19) {
    // Prime number default table size for optimal distribution
    this.tableSize = size;
    this.buckets = new Array(this.tableSize).fill(null);
    this.count = 0;
  }

  /**
   * Polynomial rolling hash function or numeric parsing
   * Maps studentId (e.g. STU1001) to bucket index
   */
  public hash(key: string): { hashValue: number; formula: string } {
    let hash = 0;
    const primeMultiplier = 31;

    for (let i = 0; i < key.length; i++) {
      hash = (hash * primeMultiplier + key.charCodeAt(i)) % this.tableSize;
    }

    const positiveHash = Math.abs(hash) % this.tableSize;
    return {
      hashValue: positiveHash,
      formula: `(Σ charCode(key[i]) * 31^(len-1-i)) mod ${this.tableSize} = ${positiveHash}`,
    };
  }

  /**
   * Insert key-value pair: Average O(1), Worst O(n)
   */
  public insert(key: string, value: V): {
    bucketIndex: number;
    collision: boolean;
    chainDepth: number;
    timeComplexity: string;
    explanation: string;
  } {
    const { hashValue, formula } = this.hash(key);
    let head = this.buckets[hashValue];
    let depth = 0;
    let collisionOccurred = head !== null;

    // Check if key already exists in bucket chain
    let current = head;
    while (current !== null) {
      depth++;
      if (current.key.toUpperCase() === key.toUpperCase()) {
        current.value = value;
        return {
          bucketIndex: hashValue,
          collision: true,
          chainDepth: depth,
          timeComplexity: 'Average O(1), Worst O(n)',
          explanation: `Updated existing key "${key}" at bucket ${hashValue} (depth ${depth}). Formula: ${formula}`,
        };
      }
      current = current.next;
    }

    // Insert new node at head of bucket chain
    const newNode = new HashNode<string, V>(key, value);
    newNode.next = head;
    this.buckets[hashValue] = newNode;
    this.count++;

    return {
      bucketIndex: hashValue,
      collision: collisionOccurred,
      chainDepth: 1,
      timeComplexity: 'Average O(1)',
      explanation: collisionOccurred
        ? `Collision detected at bucket ${hashValue}! Resolved via Separate Chaining linked list.`
        : `Directly placed at empty bucket ${hashValue}. Formula: ${formula}`,
    };
  }

  /**
   * Search student by key: Average O(1), Worst O(n)
   */
  public search(key: string): {
    found: V | null;
    bucketIndex: number;
    traversalSteps: number;
    timeComplexity: string;
    stepLog: string[];
    explanation: string;
  } {
    const { hashValue, formula } = this.hash(key);
    const stepLog: string[] = [];
    stepLog.push(`1. Calculated Hash: ${formula}`);
    stepLog.push(`2. Inspecting Bucket Index [${hashValue}]`);

    let current = this.buckets[hashValue];
    let steps = 0;

    if (!current) {
      stepLog.push(`3. Bucket [${hashValue}] is empty (NULL). Record not found.`);
      return {
        found: null,
        bucketIndex: hashValue,
        traversalSteps: 0,
        timeComplexity: 'O(1) - Instant miss',
        stepLog,
        explanation: `No records exist at hash bucket ${hashValue}. Student "${key}" not in table.`,
      };
    }

    while (current !== null) {
      steps++;
      stepLog.push(`3.${steps}. Checking chain node: Key = "${current.key}"`);
      if (current.key.toUpperCase() === key.toUpperCase()) {
        stepLog.push(`4. Match Found at bucket ${hashValue}, chain position ${steps}!`);
        return {
          found: current.value,
          bucketIndex: hashValue,
          traversalSteps: steps,
          timeComplexity: steps === 1 ? 'O(1) - Ideal Direct Hit' : `O(${steps}) - Chained Hop`,
          stepLog,
          explanation: `Successfully retrieved student in ${steps} step(s) via Separate Chaining bucket ${hashValue}.`,
        };
      }
      current = current.next;
    }

    stepLog.push(`4. Traversed full chain of length ${steps}. Key "${key}" not present in bucket.`);
    return {
      found: null,
      bucketIndex: hashValue,
      traversalSteps: steps,
      timeComplexity: 'O(k) where k is bucket chain length',
      stepLog,
      explanation: `Student "${key}" not found after checking ${steps} nodes in bucket ${hashValue}.`,
    };
  }

  /**
   * Delete entry by key
   */
  public delete(key: string): { success: boolean; bucketIndex: number } {
    const { hashValue } = this.hash(key);
    let current = this.buckets[hashValue];
    let prev: HashNode<string, V> | null = null;

    while (current !== null) {
      if (current.key.toUpperCase() === key.toUpperCase()) {
        if (!prev) {
          this.buckets[hashValue] = current.next;
        } else {
          prev.next = current.next;
        }
        this.count--;
        return { success: true, bucketIndex: hashValue };
      }
      prev = current;
      current = current.next;
    }

    return { success: false, bucketIndex: hashValue };
  }

  /**
   * Return entire bucket state for live UI visualizer
   */
  public getVisualization(): BucketView<V>[] {
    const result: BucketView<V>[] = [];

    for (let i = 0; i < this.tableSize; i++) {
      const entries: { key: string; value: V }[] = [];
      let current = this.buckets[i];
      let depth = 0;

      while (current !== null) {
        entries.push({ key: current.key, value: current.value });
        depth++;
        current = current.next;
      }

      result.push({
        index: i,
        chainLength: depth,
        entries,
      });
    }

    return result;
  }

  public size(): number {
    return this.count;
  }
}
