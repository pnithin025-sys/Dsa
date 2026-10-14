# DATA STRUCTURES AND ALGORITHMS (DSA) DOCUMENTATION
## Smart Hostel Management System — Capstone Project Specification

This document provides a comprehensive academic and engineering guide to the **8 core Data Structures and Algorithms** implemented, integrated, and actively participating in the application logic of the Smart Hostel Management System.

---

## 1. List ADT (Singly Linked List)

### Real-World Mapping
- **Module**: Student Management (`StudentLinkedList.ts`)
- **Purpose**: Dynamic student record management. Unlike static arrays, a linked list allows dynamic memory chaining where students can be enrolled at the head or tail without reallocating contiguous memory blocks.

### Internal Architecture
```
[HEAD] ──> [StudentNode: STU1001] ──> [StudentNode: STU1002] ──> ... ──> [NULL]
```
Each `StudentNode<T>` encapsulates:
- `data`: Complete student record (ID, Name, Dept, Year, Room Assignment)
- `next`: Pointer reference to the next node in heap memory

### Operations & Complexity
| Operation | Method | Time Complexity | Space Complexity | Description |
|---|---|---|---|---|
| **Insert at Head** | `insertAtHead(student)` | **O(1)** | O(1) | Prepends new student node as head; updates pointer. |
| **Insert at Tail** | `insertAtTail(student)` | **O(n)** | O(1) | Traverses to end of list and appends node. |
| **Search** | `search(studentId)` | **O(n)** | O(1) | Linear traversal comparing student ID until match or null. |
| **Delete** | `delete(studentId)` | **O(n)** | O(1) | Unlinks node by setting `prev.next = current.next`. |
| **Update** | `update(studentId, data)`| **O(n)** | O(1) | Traverses to node and updates attributes in-place. |

---

## 2. Stack ADT (LIFO — Last In First Out)

### Real-World Mapping
- **Module**: Visitor Access Logs & Recent Administrative Activity Stream (`Stack.ts`)
- **Purpose**: Tracks visitor entries and system events where the most recent check-in must be retrieved or audited first.

### Internal Architecture
```
    [TOP] ──> [Visitor VIS105 (Most Recent Entry)]
      ↓
    [Visitor VIS104]
      ↓
    [Visitor VIS103]
      ↓
    [NULL]
```

### Operations & Complexity
| Operation | Method | Time Complexity | Space Complexity | Description |
|---|---|---|---|---|
| **Push** | `push(item)` | **O(1)** | O(1) | New visitor entry placed at top; top pointer updated. |
| **Pop** | `pop()` | **O(1)** | O(1) | Topmost visitor entry removed (Stack Underflow safe). |
| **Peek** | `peek()` | **O(1)** | O(1) | Inspects the most recent entry without mutation. |
| **isEmpty** | `isEmpty()` | **O(1)** | O(1) | Checks whether stack count is zero. |

---

## 3. Queue ADT (FIFO — First In First Out)

### Real-World Mapping
- **Module**: Maintenance Request Pipeline (`Queue.ts`)
- **Purpose**: Guarantees fairness for hostel residents filing repair tickets (electrical, plumbing, furniture, Internet). The warden processes tickets in exact order of submission.

### Internal Architecture
```
[FRONT] ──> [Ticket #101: Electrical] ──> [Ticket #102: Plumbing] ──> [Ticket #103: Wi-Fi] ──> [REAR]
```

### Operations & Complexity
| Operation | Method | Time Complexity | Space Complexity | Description |
|---|---|---|---|---|
| **Enqueue** | `enqueue(item)` | **O(1)** | O(1) | Appends ticket at rear using rear pointer. |
| **Dequeue** | `dequeue()` | **O(1)** | O(1) | Removes ticket from front for servicing via "Process Next". |
| **Peek** | `peek()` | **O(1)** | O(1) | Inspects current front ticket waiting to be serviced. |
| **isEmpty** | `isEmpty()` | **O(1)** | O(1) | Returns true if queue length is 0. |

---

## 4. Searching Algorithms

### Real-World Mapping
- **Module**: Student Search & Room Occupant Lookup (`Searching.ts`)
- **Purpose**: Provides element lookup across student IDs, names, and register numbers.

### Algorithms Implemented
1. **Linear Search (`linearSearch`)**:
   - Compares elements sequentially from index `0` to `n-1`.
   - Used for unsorted, arbitrary student lists.
   - **Best Case**: $O(1)$ (target is at index 0)
   - **Average / Worst Case**: $O(n)$

2. **Binary Search (`binarySearch`)**:
   - Operates on a sorted array of students (sorted by `studentId` or `regNumber`).
   - Calculates `mid = Math.floor((low + high) / 2)`.
   - Halves the search space at every step:
     - If `key === mid`: Found.
     - If `key < mid`: Discards right half (`high = mid - 1`).
     - If `key > mid`: Discards left half (`low = mid + 1`).
   - **Time Complexity**: $O(\log n)$ (Takes at most 6 comparisons for 52 students!)
   - **Space Complexity**: $O(1)$ (Iterative implementation)

---

## 5. Sorting Algorithms

### Real-World Mapping
- **Module**: Student Roster & Room Sorting (`Sorting.ts`)
- **Purpose**: Sorts residents by Student ID, Name, Department, or Year in Ascending or Descending order.

### Algorithms Implemented & Benchmark Comparison
| Algorithm | Best Case | Average Case | Worst Case | Space Complexity | Characteristics |
|---|---|---|---|---|---|
| **Bubble Sort** | $O(n)$ (Optimized flag) | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Simple pairwise adjacent swaps; stable. |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Inserts elements into sorted subarray; highly efficient for nearly sorted data. |
| **Merge Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Divide-and-conquer; divides in half, recursively merges sorted halves. |
| **Quick Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | In-place partition around pivot; standard production sorting algorithm. |

---

## 6. Hashing (Hash Table with Separate Chaining)

### Real-World Mapping
- **Module**: Fast Student ID Record Index (`HashTable.ts`)
- **Purpose**: Enables immediate retrieval of student records by Student ID (e.g. `STU1015`) in average $O(1)$ constant time.

### Polynomial Rolling Hash Function
$$\text{hash}(key) = \left( \sum_{i=0}^{k-1} \text{charCode}(key[i]) \times 31^{k - 1 - i} \right) \pmod{\text{TableSize}}$$
- Table size selected: $19$ (Prime number to minimize harmonic collision frequencies).

### Collision Resolution: Separate Chaining
```
Bucket [0]  ──> NULL
Bucket [1]  ──> [STU1001: Aarav] ──> [STU1020: Isha] ──> NULL  (Collision handled via chain)
Bucket [2]  ──> [STU1002: Vivaan] ──> NULL
Bucket [3]  ──> NULL
...
Bucket [18] ──> [STU1018: Ananya] ──> NULL
```
- **Average Search / Insert Time**: $O(1)$
- **Worst-Case Time (Extreme Clustering)**: $O(n)$
- **Space Complexity**: $O(n)$

---

## 7. Binary Tree & Hierarchical Tree

### Real-World Mapping
- **Module**: Hostel Architectural Layout & Occupancy Hierarchy (`BinaryTree.ts`)
- **Purpose**: Represents the multi-tier structure of campus accommodations:
  - **Root**: Hostel Complex
  - **Level 1**: Blocks (Block A, Block B, Block C)
  - **Level 2**: Floors (Floor 1, Floor 2, Floor 3)
  - **Level 3**: Rooms (A-101, A-102...)
  - **Level 4**: Individual Beds (Bed 1, Bed 2, Bed 3, Bed 4)

### Traversal Algorithms Implemented
1. **Preorder Traversal** (`Root → Left → Right`):
   - Used for structural replication and serialization of hostel hierarchy.
   - Time: $O(n)$, Space: $O(h)$
2. **Inorder Traversal** (`Left → Root → Right`):
   - Produces strictly monotonic alphanumeric room numbers in the Binary Search Tree projection.
   - Time: $O(n)$, Space: $O(h)$
3. **Postorder Traversal** (`Left → Right → Root`):
   - Used for bottom-up calculation of bed vacancy and floor evacuations.
   - Time: $O(n)$, Space: $O(h)$
4. **Level-Order Traversal (BFS Queue)**:
   - Visits all nodes level-by-level: Level 0 (Hostel) $\to$ Level 1 (Blocks) $\to$ Level 2 (Floors) $\to$ Level 3 (Rooms).
   - Time: $O(n)$, Space: $O(w)$

---

## 8. Graph & Shortest Path Routing

### Real-World Mapping
- **Module**: Campus Facility Navigation (`Graph.ts`)
- **Purpose**: Represents campus locations (Hostel A, Mess, Library, Gym, Medical Centre, Parking, Sports Complex) as vertices and walkways as edges.

### Algorithms Implemented
1. **Breadth-First Search (BFS Shortest Path)**:
   - Finds path with the **minimum number of connection hops**.
   - Uses an explicit queue and visited set.
   - **Time Complexity**: $O(V + E)$
   - **Space Complexity**: $O(V)$

2. **Dijkstra's Algorithm (Shortest Physical Walking Distance in Meters)**:
   - Finds path minimizing **total cumulative meters walked**.
   - Edge relaxation: If $\text{dist}[u] + \text{weight}(u, v) < \text{dist}[v]$, update $\text{dist}[v]$.
   - **Time Complexity**: $O((V + E) \log V)$
   - **Space Complexity**: $O(V)$

3. **Depth-First Search (DFS Exploration)**:
   - Explores full connected subgraph recursively before backtracking.
   - **Time Complexity**: $O(V + E)$

---

## Summary Complexity Matrix

| DSA Concept | Core Class | Primary Operation | Average Time | Space Complexity |
|---|---|---|---|---|
| **List ADT** | `StudentLinkedList` | Insert at Head / Search | $O(1) / O(n)$ | $O(n)$ |
| **Stack** | `CustomStack` | Push / Pop | $O(1)$ | $O(n)$ |
| **Queue** | `CustomQueue` | Enqueue / Dequeue | $O(1)$ | $O(n)$ |
| **Searching** | `SearchingAlgorithms` | Binary Search | $O(\log n)$ | $O(1)$ |
| **Sorting** | `SortingAlgorithms` | Quick Sort / Merge Sort | $O(n \log n)$ | $O(\log n) / O(n)$ |
| **Hash Table** | `CustomHashTable` | Modulo Search | $O(1)$ | $O(n)$ |
| **Binary Tree** | `HostelBinaryTree` | Traversals (Pre/In/Post) | $O(n)$ | $O(h)$ |
| **Graph** | `FacilityGraph` | BFS / Dijkstra | $O(V + E) / O((V+E)\log V)$ | $O(V)$ |
