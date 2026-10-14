import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  Search,
  ArrowUpDown,
  Hash,
  Network,
  Compass,
  CheckCircle2,
  Clock,
  Code2,
} from 'lucide-react';
import api from '../services/api';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const DsaVisualizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'list' | 'stack' | 'queue' | 'search' | 'sort' | 'hash' | 'tree' | 'graph'
  >('list');

  // 1. List ADT state
  const [listNodes, setListNodes] = useState<{ id: string; name: string }[]>([
    { id: 'STU1001', name: 'Aarav Sharma' },
    { id: 'STU1002', name: 'Vivaan Patel' },
    { id: 'STU1003', name: 'Aditya Verma' },
    { id: 'STU1004', name: 'Vihaan Rao' },
  ]);
  const [newNodeId, setNewNodeId] = useState('STU1099');
  const [newNodeName, setNewNodeName] = useState('New Enrollee');
  const [listSearchId, setListSearchId] = useState('STU1002');
  const [listSearchResult, setListSearchResult] = useState<string | null>(null);

  // 2. Stack state
  const [stackItems, setStackItems] = useState<string[]>([
    'VIS105 - Mr. Sharma (Parent)',
    'VIS104 - Dr. Rao (Doctor)',
    'VIS103 - Luggage Delivery',
    'VIS102 - Campus Tour',
  ]);
  const [newStackItem, setNewStackItem] = useState('VIS106 - Weekend Visit');

  // 3. Queue state
  const [queueItems, setQueueItems] = useState<string[]>([
    'MNT101 - Room A-101 (Electrical)',
    'MNT102 - Room A-102 (Plumbing)',
    'MNT103 - Room A-103 (Furniture)',
    'MNT104 - Room B-101 (Internet)',
  ]);
  const [newQueueItem, setNewQueueItem] = useState('MNT105 - Room C-101 (AC Repair)');
  const [queueMessage, setQueueMessage] = useState<string | null>(null);

  // 4. Searching State
  const [searchKey, setSearchKey] = useState<string>('STU1015');
  const [searchAlgorithm, setSearchAlgorithm] = useState<'LINEAR' | 'BINARY'>('BINARY');
  const [searchResultData, setSearchResultData] = useState<any>(null);

  // 5. Sorting State
  const [sortField, setSortField] = useState<string>('studentId');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [sortResultData, setSortResultData] = useState<any>(null);

  // 6. Hash Table State
  const [hashTableData, setHashTableData] = useState<any>(null);
  const [hashKeyQuery, setHashKeyQuery] = useState<string>('STU1005');
  const [hashCalcResult, setHashCalcResult] = useState<any>(null);

  // Load backend live DSA data
  useEffect(() => {
    const fetchDsaData = async () => {
      try {
        const hashRes = await api.get('/dsa/hash-table');
        if (hashRes.data.success) {
          setHashTableData(hashRes.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDsaData();
  }, []);

  // List ADT Handlers
  const handleInsertListHead = () => {
    setListNodes([{ id: newNodeId, name: newNodeName }, ...listNodes]);
  };
  const handleInsertListTail = () => {
    setListNodes([...listNodes, { id: newNodeId, name: newNodeName }]);
  };
  const handleDeleteListNode = (id: string) => {
    setListNodes(listNodes.filter((n) => n.id !== id));
  };
  const handleSearchList = () => {
    let steps = 0;
    for (let i = 0; i < listNodes.length; i++) {
      steps++;
      if (listNodes[i].id.toUpperCase() === listSearchId.trim().toUpperCase()) {
        setListSearchResult(`Found node "${listNodes[i].name}" at position ${steps} in O(${steps}) steps.`);
        return;
      }
    }
    setListSearchResult(`Node with ID "${listSearchId}" not found after traversing all ${listNodes.length} nodes (O(n) worst case).`);
  };

  // Stack Handlers
  const handlePushStack = () => {
    if (newStackItem.trim()) {
      setStackItems([newStackItem.trim(), ...stackItems]);
    }
  };
  const handlePopStack = () => {
    if (stackItems.length > 0) {
      setStackItems(stackItems.slice(1));
    }
  };

  // Queue Handlers
  const handleEnqueue = () => {
    if (newQueueItem.trim()) {
      setQueueItems([...queueItems, newQueueItem.trim()]);
    }
  };
  const handleDequeue = () => {
    if (queueItems.length > 0) {
      const removed = queueItems[0];
      setQueueItems(queueItems.slice(1));
      setQueueMessage(`Dequeued & Processed: "${removed}" in O(1) time.`);
    }
  };

  // Search Visualizer Handler
  const handleRunSearch = async () => {
    try {
      const res = await api.post('/dsa/search-visualize', {
        key: searchKey,
        algorithm: searchAlgorithm,
        field: 'studentId',
      });
      if (res.data.success) {
        setSearchResultData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sort Visualizer Handler
  const handleRunSort = async () => {
    try {
      const res = await api.post('/dsa/sort-visualize', {
        field: sortField,
        order: sortOrder,
      });
      if (res.data.success) {
        setSortResultData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Hash Calculation Handler
  const handleComputeHash = () => {
    const tableSize = 19;
    let hash = 0;
    const primeMultiplier = 31;
    for (let i = 0; i < hashKeyQuery.length; i++) {
      hash = (hash * primeMultiplier + hashKeyQuery.charCodeAt(i)) % tableSize;
    }
    const bucket = Math.abs(hash) % tableSize;
    setHashCalcResult({
      key: hashKeyQuery,
      formula: `(Σ charCode("${hashKeyQuery}"[i]) * 31^(len-1-i)) mod ${tableSize}`,
      bucketIndex: bucket,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Data Structures & Algorithms Visualizer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interactive testbed and evaluation harness for all 8 DSA concepts implemented in the Smart Hostel System.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            8 Algorithmic Modules Active
          </span>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'list', label: '1. List ADT (Linked List)' },
          { id: 'stack', label: '2. Stack (LIFO)' },
          { id: 'queue', label: '3. Queue (FIFO)' },
          { id: 'search', label: '4. Searching Algorithms' },
          { id: 'sort', label: '5. Sorting Algorithms' },
          { id: 'hash', label: '6. Hash Table' },
          { id: 'tree', label: '7. Binary Tree' },
          { id: 'graph', label: '8. Graph Navigation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: List ADT (Singly Linked List) */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  StudentLinkedList (Singly Linked List)
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamic memory chaining for student enrollment without continuous memory reallocation.
                </p>
              </div>
              <DSAComplexityBadge structure="Singly Linked List" operation="Insert: O(1) / O(n), Search: O(n)" timeComplexity="O(1) to O(n)" />
            </div>

            {/* Interactive Operations Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Node ID</label>
                <input
                  type="text"
                  value={newNodeId}
                  onChange={(e) => setNewNodeId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleInsertListHead}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                >
                  Insert Head (O(1))
                </button>
                <button
                  onClick={handleInsertListTail}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
                >
                  Insert Tail (O(n))
                </button>
              </div>
            </div>

            {/* Search in Linked List */}
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={listSearchId}
                onChange={(e) => setListSearchId(e.target.value)}
                placeholder="Search Student ID in List..."
                className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                onClick={handleSearchList}
                className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100"
              >
                Traverse & Search (O(n))
              </button>
              {listSearchResult && <span className="text-slate-600 font-medium">{listSearchResult}</span>}
            </div>

            {/* Node Chaining Visualization */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Live Memory Linked Chain:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shrink-0">
                  HEAD
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                {listNodes.map((node, i) => (
                  <React.Fragment key={`${node.id}-${i}`}>
                    <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs shrink-0 flex flex-col min-w-40">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-600 text-xs">{node.id}</span>
                        <button
                          onClick={() => handleDeleteListNode(node.id)}
                          className="text-[10px] text-rose-500 hover:underline"
                        >
                          delete
                        </button>
                      </div>
                      <span className="font-semibold text-slate-800 text-xs mt-1 truncate">{node.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 mt-1">
                        next → {i < listNodes.length - 1 ? listNodes[i + 1].id : 'NULL'}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </React.Fragment>
                ))}

                <div className="px-3 py-2 bg-slate-200 text-slate-600 text-xs font-bold font-mono rounded-lg shrink-0">
                  NULL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Stack (LIFO) */}
      {activeTab === 'stack' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  CustomStack (LIFO - Last In First Out)
                </h3>
                <p className="text-xs text-slate-500">
                  Used for tracking visitor entry/exit history and administrative action undo logs.
                </p>
              </div>
              <DSAComplexityBadge structure="Stack" operation="Push / Pop / Peek" timeComplexity="O(1)" spaceComplexity="O(n)" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={newStackItem}
                onChange={(e) => setNewStackItem(e.target.value)}
                className="w-80 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                onClick={handlePushStack}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Push (O(1))
              </button>
              <button
                onClick={handlePopStack}
                disabled={stackItems.length === 0}
                className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-lg hover:bg-rose-100 disabled:opacity-50"
              >
                Pop (O(1))
              </button>
            </div>

            {/* Vertical Stack Animation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2">
              <div className="text-center font-bold text-xs text-indigo-700 font-mono pb-1 border-b border-slate-200 flex items-center justify-center gap-1">
                <span>TOP OF STACK</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 rounded">O(1) Access</span>
              </div>

              {stackItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs font-mono border transition-all ${
                    idx === 0
                      ? 'bg-indigo-600 text-white font-bold shadow-md scale-102 border-indigo-600'
                      : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item}</span>
                    <span className="text-[10px] opacity-70">Pos {stackItems.length - idx}</span>
                  </div>
                </div>
              ))}

              <div className="text-center font-bold text-xs text-slate-400 font-mono pt-1 border-t border-slate-200">
                BOTTOM OF STACK
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Queue (FIFO) */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  CustomQueue (FIFO - First In First Out)
                </h3>
                <p className="text-xs text-slate-500">
                  Used for maintenance requests pipeline. Warden processes requests in strict order of arrival.
                </p>
              </div>
              <DSAComplexityBadge structure="Queue" operation="Enqueue / Dequeue" timeComplexity="O(1)" spaceComplexity="O(n)" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={newQueueItem}
                onChange={(e) => setNewQueueItem(e.target.value)}
                className="w-80 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <button
                onClick={handleEnqueue}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Enqueue at Rear (O(1))
              </button>
              <button
                onClick={handleDequeue}
                disabled={queueItems.length === 0}
                className="px-3.5 py-1.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                Dequeue Front (O(1))
              </button>
            </div>

            {queueMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {queueMessage}
              </div>
            )}

            {/* Horizontal Pipeline */}
            <div className="flex items-center gap-2 overflow-x-auto p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shrink-0">
                FRONT
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              {queueItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`p-3 rounded-lg border text-xs font-mono shrink-0 min-w-44 ${
                      idx === 0
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20 font-bold'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Index {idx}</div>
                    <div className="text-slate-800 mt-0.5">{item}</div>
                  </div>
                  {idx < queueItems.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />}
                </React.Fragment>
              ))}

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg shrink-0">
                REAR
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Searching Algorithms */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Linear Search vs Binary Search
                </h3>
                <p className="text-xs text-slate-500">
                  Compare search space halving in Binary Search vs element-by-element scan in Linear Search.
                </p>
              </div>
              <DSAComplexityBadge
                structure="Search"
                operation="Binary Search: O(log n) vs Linear: O(n)"
                timeComplexity="O(log n) vs O(n)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Search Key (Student ID)</label>
                <input
                  type="text"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="e.g. STU1025"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Algorithm</label>
                <select
                  value={searchAlgorithm}
                  onChange={(e) => setSearchAlgorithm(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="BINARY">Binary Search (Sorted Array)</option>
                  <option value="LINEAR">Linear Search (Unsorted Array)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunSearch}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Execute Search</span>
                </button>
              </div>
            </div>

            {/* Results Display */}
            {searchResultData && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-900 block text-sm">
                      {searchResultData.targetFound ? 'Target Element Found!' : 'Search Key Not Present'}
                    </span>
                    <span className="text-slate-600">
                      Index: {searchResultData.foundIndex} • Total Comparisons: {searchResultData.comparisonsCount} • Time: {searchResultData.executionTimeMs}ms
                    </span>
                  </div>
                  <div className="font-mono text-xs bg-white px-3 py-1 rounded border border-indigo-200 text-indigo-700 font-bold">
                    {searchResultData.algorithm === 'Binary Search' ? 'O(log n)' : 'O(n)'}
                  </div>
                </div>

                {/* Step Trace */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Step-by-Step Decision Trace:
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {searchResultData.stepTrace.map((st: any) => (
                      <div
                        key={st.step}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          st.outcome === 'MATCH'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-indigo-600 font-bold mr-2">Step {st.step}:</span>
                          <span>{st.comparison}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          {st.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Sorting Algorithms Benchmark */}
      {activeTab === 'sort' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Sorting Algorithms Benchmark (Quick, Merge, Insertion, Bubble)
                </h3>
                <p className="text-xs text-slate-500">
                  Simultaneously executes all 4 algorithms on identical student records to compare swaps, comparisons and timings.
                </p>
              </div>
              <DSAComplexityBadge structure="Sorting" operation="Multi-Sort Benchmark" timeComplexity="O(n log n) vs O(n²)" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="studentId">Sort Field: Student ID</option>
                <option value="name">Sort Field: Full Name</option>
                <option value="department">Sort Field: Department</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ASC">Ascending (A-Z)</option>
                <option value="DESC">Descending (Z-A)</option>
              </select>

              <button
                onClick={handleRunSort}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Benchmark</span>
              </button>
            </div>

            {/* Benchmark Comparative Cards */}
            {sortResultData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {sortResultData.comparison.map((metric: any) => (
                  <div
                    key={metric.algorithm}
                    className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs font-['Plus_Jakarta_Sans']">
                          {metric.algorithm}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {metric.timeComplexity.average}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Comparisons:</span>
                          <span className="font-bold text-slate-800">{metric.comparisonsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Swaps / Moves:</span>
                          <span className="font-bold text-slate-800">{metric.swapsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Runtime:</span>
                          <span className="font-bold text-indigo-600">{metric.executionTimeMs} ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      Space: {metric.spaceComplexity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: Hash Table & Collision Handling */}
      {activeTab === 'hash' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  CustomHashTable with Separate Chaining
                </h3>
                <p className="text-xs text-slate-500">
                  Provides average O(1) student lookups. Collisions are handled gracefully using chained buckets.
                </p>
              </div>
              <DSAComplexityBadge structure="Hash Table" operation="Modulo Hash & Separate Chaining" timeComplexity="Average O(1), Worst O(n)" />
            </div>

            {/* Test Hash Function */}
            <div className="flex items-center gap-2 text-xs">
              <input
                type="text"
                value={hashKeyQuery}
                onChange={(e) => setHashKeyQuery(e.target.value)}
                placeholder="Enter Student ID (e.g. STU1005)..."
                className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
              <button
                onClick={handleComputeHash}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
              >
                Compute Hash & Bucket
              </button>
            </div>

            {hashCalcResult && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Hash Formula: </span>
                  <code className="text-indigo-800 font-mono text-[11px]">{hashCalcResult.formula}</code>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Target Bucket Index: </span>
                  <span className="font-bold text-indigo-700 text-sm">Bucket [{hashCalcResult.bucketIndex}]</span>
                </div>
              </div>
            )}

            {/* Live 19 Buckets Visualization */}
            {hashTableData && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  19 Chained Buckets (Load Factor: {hashTableData.loadFactor}):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto p-1">
                  {hashTableData.buckets.map((b: any) => (
                    <div
                      key={b.index}
                      className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                        hashCalcResult?.bucketIndex === b.index
                          ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/20'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="font-bold text-slate-800">Bucket [{b.index}]</span>
                        <span className="text-[10px] text-slate-400">
                          Chain: {b.chainLength} {b.chainLength > 1 && '⚠️ Collision'}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        {b.entries.length === 0 ? (
                          <span className="text-slate-300">NULL</span>
                        ) : (
                          b.entries.map((e: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-1 text-[11px] text-slate-700 truncate">
                              <span className="text-indigo-600 font-bold">{e.key}</span>
                              <span className="text-slate-400">→</span>
                              <span className="truncate">{e.value.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: Binary Tree (Redirect / Overview) */}
      {activeTab === 'tree' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Hierarchical & Binary Tree Architecture
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The full hostel layout is structured in an interactive Multi-Way Tree with BST traversals on the dedicated structure page.
          </p>
          <a
            href="/hostel-structure"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs"
          >
            <span>Open Dedicated Tree Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* TAB 8: Graph Navigation (Redirect / Overview) */}
      {activeTab === 'graph' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Facility Navigation Graph Engine
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The campus map is modeled as an undirected weighted Graph with Breadth-First Search (BFS) and Dijkstra's algorithm for shortest pathway navigation.
          </p>
          <a
            href="/facilities"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs"
          >
            <span>Open Interactive Map & Graph Router</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
};
