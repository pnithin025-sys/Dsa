/**
 * Searching Algorithms Module
 * Implements Linear Search and Binary Search with step-by-step trace generation
 * and complexity analysis.
 */

export interface SearchStepTrace {
  step: number;
  index: number;
  elementId: string;
  elementName: string;
  lowIndex?: number;
  midIndex?: number;
  highIndex?: number;
  comparison: string;
  outcome: 'MATCH' | 'LESS' | 'GREATER' | 'NOT_MATCH';
}

export interface SearchResult<T> {
  algorithm: string;
  searchKey: string;
  field: string;
  targetFound: boolean;
  foundIndex: number;
  item: T | null;
  totalSteps: number;
  comparisonsCount: number;
  stepTrace: SearchStepTrace[];
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  executionTimeMs: number;
}

export class SearchingAlgorithms {
  /**
   * Linear Search
   * Suitable for unsorted or arbitrary order collections
   * Time Complexity: O(n)
   */
  public static linearSearch<T extends { studentId: string; name: string; regNumber?: string }>(
    list: T[],
    query: string,
    field: 'studentId' | 'name' | 'regNumber' = 'studentId'
  ): SearchResult<T> {
    const startTime = performance.now();
    const stepTrace: SearchStepTrace[] = [];
    const normalizedQuery = query.trim().toUpperCase();
    let foundIndex = -1;
    let foundItem: T | null = null;
    let comparisons = 0;

    for (let i = 0; i < list.length; i++) {
      comparisons++;
      const current = list[i];
      const fieldValue = String((current as any)[field] || '').toUpperCase();
      const isMatch = fieldValue.includes(normalizedQuery);

      stepTrace.push({
        step: i + 1,
        index: i,
        elementId: current.studentId,
        elementName: current.name,
        comparison: `Comparing index ${i}: "${fieldValue}" against query "${normalizedQuery}"`,
        outcome: isMatch ? 'MATCH' : 'NOT_MATCH',
      });

      if (isMatch) {
        foundIndex = i;
        foundItem = current;
        break;
      }
    }

    const endTime = performance.now();

    return {
      algorithm: 'Linear Search',
      searchKey: query,
      field,
      targetFound: foundIndex !== -1,
      foundIndex,
      item: foundItem,
      totalSteps: stepTrace.length,
      comparisonsCount: comparisons,
      stepTrace,
      timeComplexity: {
        best: 'O(1) - Target is first element',
        average: 'O(n) - Target in middle on average',
        worst: 'O(n) - Target at end or missing',
      },
      spaceComplexity: 'O(1)',
      executionTimeMs: Number((endTime - startTime).toFixed(3)),
    };
  }

  /**
   * Binary Search
   * Requires array to be sorted by search key
   * Time Complexity: O(log n)
   */
  public static binarySearch<T extends { studentId: string; name: string; regNumber?: string }>(
    sortedList: T[],
    query: string,
    field: 'studentId' | 'name' | 'regNumber' = 'studentId'
  ): SearchResult<T> {
    const startTime = performance.now();
    const stepTrace: SearchStepTrace[] = [];
    const normalizedQuery = query.trim().toUpperCase();

    let low = 0;
    let high = sortedList.length - 1;
    let foundIndex = -1;
    let foundItem: T | null = null;
    let stepCount = 0;
    let comparisons = 0;

    while (low <= high) {
      stepCount++;
      const mid = Math.floor((low + high) / 2);
      const current = sortedList[mid];
      const midValue = String((current as any)[field] || '').toUpperCase();
      comparisons++;

      if (midValue === normalizedQuery) {
        stepTrace.push({
          step: stepCount,
          index: mid,
          lowIndex: low,
          midIndex: mid,
          highIndex: high,
          elementId: current.studentId,
          elementName: current.name,
          comparison: `Mid index [${mid}] value "${midValue}" === "${normalizedQuery}"`,
          outcome: 'MATCH',
        });
        foundIndex = mid;
        foundItem = current;
        break;
      } else if (midValue < normalizedQuery) {
        stepTrace.push({
          step: stepCount,
          index: mid,
          lowIndex: low,
          midIndex: mid,
          highIndex: high,
          elementId: current.studentId,
          elementName: current.name,
          comparison: `Mid index [${mid}] value "${midValue}" < "${normalizedQuery}". Discarding left half [${low}..${mid}]. Shifting right.`,
          outcome: 'LESS',
        });
        low = mid + 1;
      } else {
        stepTrace.push({
          step: stepCount,
          index: mid,
          lowIndex: low,
          midIndex: mid,
          highIndex: high,
          elementId: current.studentId,
          elementName: current.name,
          comparison: `Mid index [${mid}] value "${midValue}" > "${normalizedQuery}". Discarding right half [${mid}..${high}]. Shifting left.`,
          outcome: 'GREATER',
        });
        high = mid - 1;
      }
    }

    const endTime = performance.now();

    return {
      algorithm: 'Binary Search',
      searchKey: query,
      field,
      targetFound: foundIndex !== -1,
      foundIndex,
      item: foundItem,
      totalSteps: stepCount,
      comparisonsCount: comparisons,
      stepTrace,
      timeComplexity: {
        best: 'O(1) - Target is middle element',
        average: 'O(log n) - Search space halved every step',
        worst: 'O(log n) - Subdivided until interval is 1',
      },
      spaceComplexity: 'O(1)',
      executionTimeMs: Number((endTime - startTime).toFixed(3)),
    };
  }
}
