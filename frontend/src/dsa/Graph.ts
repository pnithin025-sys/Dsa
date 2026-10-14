/**
 * Graph Data Structure for Facility Navigation
 * Adjacency List representation.
 * Implements BFS (Shortest Hops), Dijkstra (Shortest Walking Distance in meters), and DFS.
 */

export interface FacilityVertex {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  xCoord: number;
  yCoord: number;
}

export interface GraphEdge {
  targetId: string;
  distanceMeters: number;
  pathwayType: string;
}

export interface PathStep {
  facility: FacilityVertex;
  distanceFromPrevious: number;
  cumulativeDistance: number;
}

export interface GraphSearchResult {
  algorithm: string;
  start: FacilityVertex;
  destination: FacilityVertex;
  path: FacilityVertex[];
  pathSteps: PathStep[];
  totalDistanceMeters: number;
  hopCount: number;
  visitedNodesCount: number;
  executionSteps: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

export class FacilityGraph {
  private adjacencyList: Map<string, GraphEdge[]>;
  private vertices: Map<string, FacilityVertex>;

  constructor() {
    this.adjacencyList = new Map();
    this.vertices = new Map();
  }

  public addVertex(vertex: FacilityVertex): void {
    if (!this.vertices.has(vertex.id)) {
      this.vertices.set(vertex.id, vertex);
      this.adjacencyList.set(vertex.id, []);
    }
  }

  public addEdge(sourceId: string, targetId: string, distanceMeters: number = 50, pathwayType: string = 'PAVED_WALKWAY'): void {
    if (!this.adjacencyList.has(sourceId)) this.adjacencyList.set(sourceId, []);
    if (!this.adjacencyList.has(targetId)) this.adjacencyList.set(targetId, []);

    this.adjacencyList.get(sourceId)!.push({
      targetId,
      distanceMeters,
      pathwayType,
    });
  }

  public getVertex(id: string): FacilityVertex | undefined {
    return this.vertices.get(id);
  }

  public getAllVertices(): FacilityVertex[] {
    return Array.from(this.vertices.values());
  }

  public getAllEdges(): { source: string; target: string; distance: number; type: string }[] {
    const list: { source: string; target: string; distance: number; type: string }[] = [];
    for (const [source, edges] of this.adjacencyList.entries()) {
      for (const edge of edges) {
        list.push({
          source,
          target: edge.targetId,
          distance: edge.distanceMeters,
          type: edge.pathwayType,
        });
      }
    }
    return list;
  }

  /**
   * Breadth-First Search (BFS)
   * Finds shortest path by NUMBER OF CONNECTIONS (Hops)
   * Time Complexity: O(V + E)
   */
  public bfsShortestPath(startId: string, destId: string): GraphSearchResult {
    const startVertex = this.vertices.get(startId);
    const destVertex = this.vertices.get(destId);

    if (!startVertex || !destVertex) {
      throw new Error('Start or destination facility not found in graph.');
    }

    const queue: string[] = [startId];
    const visited: Set<string> = new Set([startId]);
    const previous: Map<string, { prevId: string; distance: number }> = new Map();
    const executionSteps: string[] = [];

    executionSteps.push(`1. Initialize BFS Queue with origin facility: "${startVertex.name}"`);

    let found = false;
    let stepNumber = 2;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentVertex = this.vertices.get(currentId)!;
      executionSteps.push(`${stepNumber++}. Dequeued [${currentVertex.name}]. Checking connected paths...`);

      if (currentId === destId) {
        executionSteps.push(`${stepNumber++}. Reached destination "${destVertex.name}"!`);
        found = true;
        break;
      }

      const neighbors = this.adjacencyList.get(currentId) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          previous.set(edge.targetId, { prevId: currentId, distance: edge.distanceMeters });
          queue.push(edge.targetId);
          const nVertex = this.vertices.get(edge.targetId)!;
          executionSteps.push(`   → Discovered unvisited neighbor: "${nVertex.name}" (Weight: ${edge.distanceMeters}m). Enqueued.`);
        }
      }
    }

    if (!found) {
      return {
        algorithm: 'Breadth-First Search (BFS)',
        start: startVertex,
        destination: destVertex,
        path: [],
        pathSteps: [],
        totalDistanceMeters: 0,
        hopCount: 0,
        visitedNodesCount: visited.size,
        executionSteps,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
      };
    }

    // Reconstruct path
    const pathIds: string[] = [];
    let curr = destId;
    while (curr) {
      pathIds.unshift(curr);
      const prevInfo = previous.get(curr);
      if (!prevInfo) break;
      curr = prevInfo.prevId;
    }

    const pathVertices = pathIds.map((id) => this.vertices.get(id)!);
    let totalDist = 0;
    const pathSteps: PathStep[] = [];

    for (let i = 0; i < pathVertices.length; i++) {
      const stepDist = i === 0 ? 0 : previous.get(pathVertices[i].id)?.distance || 0;
      totalDist += stepDist;
      pathSteps.push({
        facility: pathVertices[i],
        distanceFromPrevious: stepDist,
        cumulativeDistance: totalDist,
      });
    }

    return {
      algorithm: 'Breadth-First Search (BFS)',
      start: startVertex,
      destination: destVertex,
      path: pathVertices,
      pathSteps,
      totalDistanceMeters: totalDist,
      hopCount: pathVertices.length - 1,
      visitedNodesCount: visited.size,
      executionSteps,
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
    };
  }

  /**
   * Dijkstra's Algorithm
   * Finds shortest path by PHYSICAL WALKING DISTANCE (Weighted)
   * Time Complexity: O((V + E) log V)
   */
  public dijkstraShortestPath(startId: string, destId: string): GraphSearchResult {
    const startVertex = this.vertices.get(startId);
    const destVertex = this.vertices.get(destId);

    if (!startVertex || !destVertex) {
      throw new Error('Start or destination facility not found in graph.');
    }

    const distances: Map<string, number> = new Map();
    const previous: Map<string, { prevId: string; distance: number }> = new Map();
    const unvisited: Set<string> = new Set();
    const executionSteps: string[] = [];

    for (const vId of this.vertices.keys()) {
      distances.set(vId, Infinity);
      unvisited.add(vId);
    }
    distances.set(startId, 0);

    executionSteps.push(`1. Initialized Dijkstra: Distance to "${startVertex.name}" set to 0m, all others to ∞`);

    let stepNum = 2;

    while (unvisited.size > 0) {
      // Find vertex with minimum distance in unvisited set
      let minNode: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        const d = distances.get(node)!;
        if (d < minDistance) {
          minDistance = d;
          minNode = node;
        }
      }

      if (!minNode || minDistance === Infinity) {
        break; // Remaining nodes are unreachable
      }

      unvisited.delete(minNode);
      const currentVertex = this.vertices.get(minNode)!;
      executionSteps.push(`${stepNum++}. Picked lowest tentative distance node: "${currentVertex.name}" (${minDistance}m)`);

      if (minNode === destId) {
        executionSteps.push(`${stepNum++}. Destination "${destVertex.name}" reached with confirmed shortest distance of ${minDistance}m!`);
        break;
      }

      const neighbors = this.adjacencyList.get(minNode) || [];
      for (const edge of neighbors) {
        if (unvisited.has(edge.targetId)) {
          const altDistance = distances.get(minNode)! + edge.distanceMeters;
          const currentRecorded = distances.get(edge.targetId)!;
          const targetVertex = this.vertices.get(edge.targetId)!;

          if (altDistance < currentRecorded) {
            distances.set(edge.targetId, altDistance);
            previous.set(edge.targetId, { prevId: minNode, distance: edge.distanceMeters });
            executionSteps.push(`   → Relaxed edge to "${targetVertex.name}": New shorter route found (${altDistance}m vs old ${currentRecorded === Infinity ? '∞' : currentRecorded + 'm'})`);
          }
        }
      }
    }

    // Reconstruct path
    const pathIds: string[] = [];
    let curr = destId;
    while (curr) {
      pathIds.unshift(curr);
      const prev = previous.get(curr);
      if (!prev) break;
      curr = prev.prevId;
    }

    const pathVertices = pathIds.map((id) => this.vertices.get(id)!);
    let cumulative = 0;
    const pathSteps: PathStep[] = [];

    for (let i = 0; i < pathVertices.length; i++) {
      const stepDist = i === 0 ? 0 : previous.get(pathVertices[i].id)?.distance || 0;
      cumulative += stepDist;
      pathSteps.push({
        facility: pathVertices[i],
        distanceFromPrevious: stepDist,
        cumulativeDistance: cumulative,
      });
    }

    return {
      algorithm: "Dijkstra's Shortest Path Algorithm",
      start: startVertex,
      destination: destVertex,
      path: pathVertices,
      pathSteps,
      totalDistanceMeters: distances.get(destId) === Infinity ? 0 : distances.get(destId)!,
      hopCount: Math.max(0, pathVertices.length - 1),
      visitedNodesCount: this.vertices.size - unvisited.size,
      executionSteps,
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
    };
  }

  /**
   * Depth-First Search (DFS)
   * Graph exploration traversal
   * Time Complexity: O(V + E)
   */
  public dfsExploration(startId: string): { order: FacilityVertex[]; steps: string[] } {
    const visited: Set<string> = new Set();
    const order: FacilityVertex[] = [];
    const steps: string[] = [];

    const traverse = (currentId: string, depth: number) => {
      visited.add(currentId);
      const vertex = this.vertices.get(currentId)!;
      order.push(vertex);
      steps.push(`${'  '.repeat(depth)}DFS visited: ${vertex.name}`);

      const neighbors = this.adjacencyList.get(currentId) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.targetId)) {
          traverse(edge.targetId, depth + 1);
        }
      }
    };

    if (this.vertices.has(startId)) {
      traverse(startId, 0);
    }

    return { order, steps };
  }
}
