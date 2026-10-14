/**
 * Sorting Algorithms Module
 * Implements Bubble Sort, Insertion Sort, Merge Sort, and Quick Sort.
 * Gathers operational metrics (comparisons, swaps, execution time) and complexity.
 */

export interface SortMetrics {
  algorithm: string;
  field: string;
  order: 'ASC' | 'DESC';
  totalElements: number;
  comparisonsCount: number;
  swapsCount: number;
  executionTimeMs: number;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  initialSample: string[];
  sortedSample: string[];
}

export class SortingAlgorithms {
  private static compareValues(valA: any, valB: any, order: 'ASC' | 'DESC'): number {
    const a = typeof valA === 'string' ? valA.toLowerCase() : valA;
    const b = typeof valB === 'string' ? valB.toLowerCase() : valB;

    if (a < b) return order === 'ASC' ? -1 : 1;
    if (a > b) return order === 'ASC' ? 1 : -1;
    return 0;
  }

  /**
   * Bubble Sort: O(n^2)
   */
  public static bubbleSort<T>(
    items: T[],
    field: keyof T,
    order: 'ASC' | 'DESC' = 'ASC'
  ): { sorted: T[]; metrics: SortMetrics } {
    const arr = [...items];
    const initialSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));
    const startTime = performance.now();

    let comparisons = 0;
    let swaps = 0;
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        if (this.compareValues(arr[j][field], arr[j + 1][field], order) > 0) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          swappedInPass = true;
        }
      }
      if (!swappedInPass) break; // Optimized bubble sort early exit
    }

    const endTime = performance.now();
    const sortedSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));

    return {
      sorted: arr,
      metrics: {
        algorithm: 'Bubble Sort',
        field: String(field),
        order,
        totalElements: arr.length,
        comparisonsCount: comparisons,
        swapsCount: swaps,
        executionTimeMs: Number((endTime - startTime).toFixed(3)),
        timeComplexity: {
          best: 'O(n) - Already sorted with early-exit flag',
          average: 'O(n²)',
          worst: 'O(n²) - Reverse sorted array',
        },
        spaceComplexity: 'O(1)',
        initialSample,
        sortedSample,
      },
    };
  }

  /**
   * Insertion Sort: O(n^2)
   */
  public static insertionSort<T>(
    items: T[],
    field: keyof T,
    order: 'ASC' | 'DESC' = 'ASC'
  ): { sorted: T[]; metrics: SortMetrics } {
    const arr = [...items];
    const initialSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));
    const startTime = performance.now();

    let comparisons = 0;
    let swaps = 0;

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= 0) {
        comparisons++;
        if (this.compareValues(arr[j][field], key[field], order) > 0) {
          arr[j + 1] = arr[j];
          swaps++;
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
    }

    const endTime = performance.now();
    const sortedSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));

    return {
      sorted: arr,
      metrics: {
        algorithm: 'Insertion Sort',
        field: String(field),
        order,
        totalElements: arr.length,
        comparisonsCount: comparisons,
        swapsCount: swaps,
        executionTimeMs: Number((endTime - startTime).toFixed(3)),
        timeComplexity: {
          best: 'O(n) - Nearly sorted array',
          average: 'O(n²)',
          worst: 'O(n²) - Reverse sorted array',
        },
        spaceComplexity: 'O(1)',
        initialSample,
        sortedSample,
      },
    };
  }

  /**
   * Merge Sort: O(n log n)
   */
  public static mergeSort<T>(
    items: T[],
    field: keyof T,
    order: 'ASC' | 'DESC' = 'ASC'
  ): { sorted: T[]; metrics: SortMetrics } {
    const arr = [...items];
    const initialSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));
    const startTime = performance.now();

    let comparisons = 0;
    let movements = 0;

    const merge = (left: T[], right: T[]): T[] => {
      const result: T[] = [];
      let l = 0;
      let r = 0;

      while (l < left.length && r < right.length) {
        comparisons++;
        if (this.compareValues(left[l][field], right[r][field], order) <= 0) {
          result.push(left[l]);
          l++;
        } else {
          result.push(right[r]);
          r++;
        }
        movements++;
      }

      while (l < left.length) {
        result.push(left[l]);
        l++;
        movements++;
      }

      while (r < right.length) {
        result.push(right[r]);
        r++;
        movements++;
      }

      return result;
    };

    const divide = (list: T[]): T[] => {
      if (list.length <= 1) return list;
      const mid = Math.floor(list.length / 2);
      const left = divide(list.slice(0, mid));
      const right = divide(list.slice(mid));
      return merge(left, right);
    };

    const sorted = divide(arr);
    const endTime = performance.now();
    const sortedSample = sorted.slice(0, 8).map((x: any) => String(x[field] || ''));

    return {
      sorted,
      metrics: {
        algorithm: 'Merge Sort',
        field: String(field),
        order,
        totalElements: arr.length,
        comparisonsCount: comparisons,
        swapsCount: movements,
        executionTimeMs: Number((endTime - startTime).toFixed(3)),
        timeComplexity: {
          best: 'O(n log n)',
          average: 'O(n log n) - Divide & Conquer guarantee',
          worst: 'O(n log n)',
        },
        spaceComplexity: 'O(n) - Auxiliary array allocations',
        initialSample,
        sortedSample,
      },
    };
  }

  /**
   * Quick Sort: Average O(n log n)
   */
  public static quickSort<T>(
    items: T[],
    field: keyof T,
    order: 'ASC' | 'DESC' = 'ASC'
  ): { sorted: T[]; metrics: SortMetrics } {
    const arr = [...items];
    const initialSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));
    const startTime = performance.now();

    let comparisons = 0;
    let swaps = 0;

    const partition = (low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        comparisons++;
        if (this.compareValues(arr[j][field], pivot[field], order) <= 0) {
          i++;
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          swaps++;
        }
      }

      const temp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = temp;
      swaps++;
      return i + 1;
    };

    const sortRecursive = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        sortRecursive(low, pi - 1);
        sortRecursive(pi + 1, high);
      }
    };

    if (arr.length > 1) {
      sortRecursive(0, arr.length - 1);
    }

    const endTime = performance.now();
    const sortedSample = arr.slice(0, 8).map((x: any) => String(x[field] || ''));

    return {
      sorted: arr,
      metrics: {
        algorithm: 'Quick Sort',
        field: String(field),
        order,
        totalElements: arr.length,
        comparisonsCount: comparisons,
        swapsCount: swaps,
        executionTimeMs: Number((endTime - startTime).toFixed(3)),
        timeComplexity: {
          best: 'O(n log n) - Balanced pivot partitioning',
          average: 'O(n log n) - In-place cache-friendly',
          worst: 'O(n²) - Extreme pivot imbalance',
        },
        spaceComplexity: 'O(log n) - Call stack',
        initialSample,
        sortedSample,
      },
    };
  }
}
