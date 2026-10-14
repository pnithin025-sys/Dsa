# SMART HOSTEL MANAGEMENT SYSTEM
### Advanced Full-Stack DSA Capstone Project

A modern, responsive, and production-grade **Smart Hostel Management System** developed as a Data Structures and Algorithms (DSA) Capstone Project. Built with a clean enterprise SaaS aesthetic, this system demonstrates real-world application of foundational computer science principles.

---

## 🌟 Key Highlights

- **Real DSA Integration**: Every Data Structure and Algorithm directly powers actual application features rather than serving as passive visual labels.
- **Dedicated "DSA Visualizer"**: Interactive showcase allowing users to test, animate, and compare algorithmic operations side-by-side with Big-O complexity indicators.
- **Zero-Config Database**: Backed by SQLite via Prisma ORM for instantaneous local startup without requiring separate database server daemons.
- **Modern Tech Stack**: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons, Recharts, Node.js, Express, and JWT Authentication.
- **Realistic Seed Data**: Seeded with 52 students with authentic Indian names, 30 hostel rooms across 3 blocks, 20 visitors, 15 complaints, 15 maintenance requests, and 10 campus facilities connected via 34 graph pathways.

---

## 📚 DSA Concept Mapping

| # | Data Structure / Algorithm | Hostel Management Feature | Core File Location | Big-O Complexity |
|---|---|---|---|---|
| **1** | **List ADT (Linked List)** | Student master enrollment, node traversal & dynamic chaining | `backend/src/dsa/LinkedList.ts` | $O(1)$ Head Insert, $O(n)$ Search |
| **2** | **Stack ADT (LIFO)** | Visitor access log history & administrative activity tracking | `backend/src/dsa/Stack.ts` | $O(1)$ Push / Pop |
| **3** | **Queue ADT (FIFO)** | Maintenance requests pipeline with order-of-arrival "Process Next" | `backend/src/dsa/Queue.ts` | $O(1)$ Enqueue / Dequeue |
| **4** | **Searching** | Student lookup via **Linear Search** (unsorted) & **Binary Search** (sorted) | `backend/src/dsa/Searching.ts` | $O(\log n)$ Binary Search |
| **5** | **Sorting** | Comparative student roster sorting (**Quick**, **Merge**, **Insertion**, **Bubble**) | `backend/src/dsa/Sorting.ts` | $O(n \log n)$ Quick/Merge |
| **6** | **Hash Table** | Instant student ID lookup with polynomial hash & **Separate Chaining** | `backend/src/dsa/HashTable.ts` | Average $O(1)$, Worst $O(n)$ |
| **7** | **Binary & Hierarchical Tree** | Hostel architecture hierarchy (Hostel $\to$ Block $\to$ Floor $\to$ Room $\to$ Bed) with Preorder, Inorder, Postorder & Level-Order traversals | `backend/src/dsa/BinaryTree.ts` | $O(n)$ Traversal, $O(h)$ Depth |
| **8** | **Graph & Routing** | Campus facility navigation with **BFS** (Shortest Hops), **Dijkstra** (Shortest Meters) & **DFS** | `backend/src/dsa/Graph.ts` | $O(V + E)$ BFS/DFS, $O((V+E)\log V)$ Dijkstra |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 (Modern SaaS Light Theme)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Bar charts, Donut charts)
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js v24
- **Web Framework**: Express 5 + TypeScript
- **Database**: SQLite (`dev.db`)
- **ORM**: Prisma 6.19
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Clone or Open Project
```bash
cd "e:\III sem capstorn project\DSA"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies (already installed in workspace)
npm install

# Push schema to SQLite database and generate client
npx prisma db push
npx prisma generate

# Seed realistic database records
npm run seed

# Start backend dev server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
Open a second terminal window:
```bash
cd "e:\III sem capstorn project\DSA\frontend"

# Install dependencies
npm install

# Start Vite dev server (Runs on http://localhost:5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Login Credentials

The database is pre-seeded with 1-click quick-fill buttons on the login page:

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Chief Administrator** | `admin@hostel.com` | `Admin@123` | Full access across all student, room, and system controls |
| **Hostel Warden** | `warden@hostel.com` | `Warden@123` | Student roster, room allocation, maintenance queue, visitors, reports |

---

## 📁 System Architecture & Directory Structure

```
DSA/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data models (13 tables)
│   │   ├── seed.ts             # Realistic database seeder
│   │   └── dev.db              # SQLite zero-daemon database file
│   └── src/
│       ├── controllers/        # REST API controllers
│       ├── dsa/                # Manual DSA implementations:
│       │   ├── LinkedList.ts   # List ADT (Singly Linked List)
│       │   ├── Stack.ts        # Stack ADT (LIFO)
│       │   ├── Queue.ts        # Queue ADT (FIFO)
│       │   ├── HashTable.ts    # Custom Separate Chaining Hash Table
│       │   ├── BinaryTree.ts   # Tree structure & traversals
│       │   ├── Graph.ts        # Graph Adjacency List, BFS, Dijkstra, DFS
│       │   ├── Searching.ts    # Linear & Binary Search
│       │   └── Sorting.ts      # Bubble, Insertion, Merge, Quick Sort
│       ├── middleware/         # JWT verification & role authorization
│       ├── routes/             # Master API router
│       ├── services/           # DSA Singleton service & Allocation logic
│       └── index.ts            # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & Layouts
│   │   ├── context/            # Authentication React Context
│   │   ├── pages/              # 12 Full Dashboard Views:
│   │   │   ├── LandingLoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── RoomsPage.tsx
│   │   │   ├── VisitorsPage.tsx
│   │   │   ├── ComplaintsPage.tsx
│   │   │   ├── MaintenancePage.tsx
│   │   │   ├── HostelStructurePage.tsx
│   │   │   ├── FacilitiesPage.tsx
│   │   │   ├── DsaVisualizerPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interface definitions
│   └── vite.config.ts          # Vite configuration with Tailwind v4 & Proxy
│
├── DSA_DOCUMENTATION.md        # Comprehensive 8-concept academic documentation
└── README.md                   # Project documentation
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check and DSA engine status |
| `/api/auth/login` | POST | Authenticates user and returns JWT token |
| `/api/auth/register` | POST | Registers new Warden or Admin |
| `/api/dashboard` | GET | Aggregates KPI statistics, charts, and Stack activity |
| `/api/students` | GET | Student roster with Linked List metadata, search & sort |
| `/api/students` | POST | Inserts student node into Linked List & Hash Table |
| `/api/rooms` | GET | Room cards with capacity, occupancy, and bed slots |
| `/api/rooms/allocate`| POST | Executes First-Fit Room Allocation algorithm |
| `/api/rooms/vacate` | POST | Vacates student bed and updates room occupancy |
| `/api/visitors` | GET | Visitor logs and Stack (LIFO) recent entries |
| `/api/visitors` | POST | Pushes new visitor check-in to top of Stack |
| `/api/maintenance` | GET | Maintenance tickets and FIFO Queue state |
| `/api/maintenance/process-next` | POST | **FIFO Dequeue**: pops and completes front ticket |
| `/api/hostel/structure` | GET | Tree hierarchy with Preorder, Inorder, Postorder traversals |
| `/api/facilities` | GET | Campus vertices (facilities) and edges (pathways) |
| `/api/facilities/navigate` | POST | Computes route via **BFS** (Hops) or **Dijkstra** (Meters) |
| `/api/dsa/summary` | GET | Live state and metrics for all 8 DSA engines |
| `/api/dsa/search-visualize` | POST | Step-by-step trace of Linear vs Binary Search |
| `/api/dsa/sort-visualize` | POST | Benchmark comparison of Quick, Merge, Insert, Bubble Sort |
| `/api/dsa/hash-table` | GET | Visualizes all 19 separate chaining buckets |
| `/api/reports` | GET | Generates printable and CSV-exportable reports |

---

## 🧪 Testing Instructions

1. **Verify Authentication**:
   - Navigate to `http://localhost:5173/login`.
   - Click **Admin Account** button $\to$ click **Sign in to Dashboard**.
2. **Test FIFO Maintenance Queue**:
   - Go to `http://localhost:5173/maintenance`.
   - Observe the horizontal FIFO queue pipeline with FRONT and REAR indicators.
   - Click **[Process Next in Queue (FIFO Dequeue)]**.
   - Notice the front ticket is removed, remaining queue length updates in O(1) time, and resolution message appears.
3. **Test Room Allocation Algorithm**:
   - Go to `http://localhost:5173/students`.
   - Click **Allocate** next to any unallocated student.
   - Observe the first-fit bed search, atomic update, and step-by-step trace.
4. **Test Campus Facility Graph Routing**:
   - Go to `http://localhost:5173/facilities`.
   - Select origin (e.g. *Boys Hostel Block A*) and destination (e.g. *Campus Health Centre*).
   - Select **BFS** or **Dijkstra's Algorithm** $\to$ click **Find Route**.
   - Watch the SVG pathways highlight and inspect the waypoint itinerary.
5. **Test DSA Visualizer**:
   - Go to `http://localhost:5173/dsa-visualizer`.
   - Explore tabs for List ADT, Stack, Queue, Searching, Sorting, and Hash Table.
   - Run live benchmarks and inspect step-by-step decision traces.
6. **Test Report Export & Printing**:
   - Go to `http://localhost:5173/reports`.
   - Switch between report categories $\to$ click **Export CSV** or **Print Report**.

---

## 🎓 Academic Evaluation Checklist

- [x] **List ADT**: Custom `StudentLinkedList` class with insert, delete, search, update, and Big-O tags.
- [x] **Stack**: Custom `CustomStack` class for visitor logs & undo timeline.
- [x] **Queue**: Custom `CustomQueue` class for maintenance tickets with FIFO "Process Next".
- [x] **Searching**: Linear Search & Binary Search with comparison steps and halving trace.
- [x] **Sorting**: Bubble Sort, Insertion Sort, Merge Sort, Quick Sort with swaps & timing metrics.
- [x] **Hashing**: Custom `CustomHashTable` with polynomial modulo formula & separate chaining.
- [x] **Binary Tree**: Multi-tier hostel structure with Preorder, Inorder, Postorder & Level-Order traversals.
- [x] **Graph**: Campus facility graph with BFS shortest hops, Dijkstra shortest meters & DFS exploration.
- [x] **Visualizer**: Dedicated capstone page providing interactive testing for all 8 DSA concepts.
- [x] **Security**: JWT authentication, bcrypt password hashing, and role-based permissions.
- [x] **Modern UI/UX**: SaaS-grade dashboard design adhering strictly to professional typography and clean layout guidelines.
