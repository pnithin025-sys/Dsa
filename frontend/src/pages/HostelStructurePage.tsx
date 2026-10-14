import React, { useState, useEffect } from 'react';
import {
  Network,
  Building2,
  Layers,
  DoorOpen,
  Bed as BedIcon,
  ChevronRight,
  ChevronDown,
  Play,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const HostelStructurePage: React.FC = () => {
  const [structureData, setStructureData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTraversal, setSelectedTraversal] = useState<'preorder' | 'inorder' | 'postorder' | 'levelOrder'>('preorder');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);

  // Expanded tree nodes state
  const [expandedNodes, setExpandedNodes] = useState<{ [id: string]: boolean }>({
    HOSTEL_ROOT: true,
  });

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hostel/structure');
      if (res.data.success) {
        setStructureData(res.data.data);
        // Expand first block by default
        if (res.data.data.blocks?.length > 0) {
          setExpandedNodes((prev) => ({
            ...prev,
            HOSTEL_ROOT: true,
            [res.data.data.blocks[0].id]: true,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load hostel tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handlePlayTraversal = () => {
    if (!structureData?.traversals) return;
    const currentList = structureData.traversals[selectedTraversal]?.order || [];
    if (currentList.length === 0) return;

    setIsPlaying(true);
    setHighlightedIndex(0);

    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      if (idx >= currentList.length) {
        clearInterval(timer);
        setIsPlaying(false);
      } else {
        setHighlightedIndex(idx);
      }
    }, 450);
  };

  const handleResetTraversal = () => {
    setHighlightedIndex(-1);
    setIsPlaying(false);
  };

  if (loading || !structureData) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-56"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { blocks, traversals } = structureData;
  const activeTraversal = traversals[selectedTraversal];

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Hierarchical & Binary Tree Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hostel layout modeled as an n-ary multi-way tree with Binary Search Tree projection for algorithmic traversals.
            </p>
          </div>
          <DSAComplexityBadge structure="Tree ADT" operation="Tree Traversal" timeComplexity="O(n)" spaceComplexity="O(h)" />
        </div>
      </div>

      {/* Traversal Controls & Step-by-Step Sequence */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Traversal Algorithm:</span>
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
              {(['preorder', 'inorder', 'postorder', 'levelOrder'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTraversal(type);
                    handleResetTraversal();
                  }}
                  className={`px-3 py-1 rounded-md font-semibold capitalize transition-all ${
                    selectedTraversal === type
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {type === 'levelOrder' ? 'Level-Order (BFS)' : type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayTraversal}
              disabled={isPlaying}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isPlaying ? 'Animating...' : 'Run Traversal Step-by-Step'}</span>
            </button>

            <button
              onClick={handleResetTraversal}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Algorithm Formula & Complexity */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex flex-wrap items-center justify-between text-xs text-indigo-950 gap-2">
          <div>
            <span className="font-bold">Formula: </span>
            <span className="font-mono text-[11px] text-indigo-800">{activeTraversal?.formula}</span>
          </div>
          <div className="font-mono text-[11px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            {activeTraversal?.complexity}
          </div>
        </div>

        {/* Highlighted Traversal Node Badges */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Traversal Sequence Order:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            {activeTraversal?.order?.map((node: any, idx: number) => {
              const isCurrent = idx === highlightedIndex;
              const isVisited = idx < highlightedIndex;

              return (
                <button
                  key={`${node.id}-${idx}`}
                  onClick={() => setSelectedNodeDetails(node)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                    isCurrent
                      ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-md scale-105'
                      : isVisited
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mr-1">#{idx + 1}</span>
                  {node.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Tree Visualizer + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Multi-Way Tree Viewer (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Hostel Multi-Way Tree Layout
            </h3>
            <span className="text-xs text-slate-400">Click any node to expand / inspect</span>
          </div>

          <div className="font-mono text-xs space-y-2 select-none">
            {/* ROOT NODE: HOSTEL */}
            <div className="space-y-2">
              <div
                onClick={() => toggleNode('HOSTEL_ROOT')}
                className="p-2.5 bg-slate-900 text-white rounded-lg flex items-center justify-between cursor-pointer shadow-xs hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  {expandedNodes['HOSTEL_ROOT'] ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold font-sans">ROOT: Smart Hostel Complex</span>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {blocks.length} Blocks
                </span>
              </div>

              {/* LEVEL 1: BLOCKS */}
              {expandedNodes['HOSTEL_ROOT'] && (
                <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-4">
                  {blocks.map((block: any) => {
                    const isBlockExpanded = expandedNodes[block.id];

                    return (
                      <div key={block.id} className="space-y-2">
                        <div
                          onClick={() => toggleNode(block.id)}
                          className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-indigo-100/70"
                        >
                          <div className="flex items-center gap-2">
                            {isBlockExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />
                            )}
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="font-bold text-indigo-950 font-sans">{block.name}</span>
                            <span className="text-[10px] text-slate-500">({block.genderType})</span>
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                            {block.floors?.length} Floors
                          </span>
                        </div>

                        {/* LEVEL 2: FLOORS */}
                        {isBlockExpanded && (
                          <div className="pl-6 space-y-2 border-l-2 border-indigo-200 ml-3">
                            {block.floors?.map((floor: any) => {
                              const isFloorExpanded = expandedNodes[floor.id];

                              return (
                                <div key={floor.id} className="space-y-1.5">
                                  <div
                                    onClick={() => toggleNode(floor.id)}
                                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between cursor-pointer hover:bg-slate-100"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      {isFloorExpanded ? (
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 text-slate-400" />
                                      )}
                                      <span className="font-semibold text-slate-800">{floor.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                      {floor.rooms?.length} Rooms
                                    </span>
                                  </div>

                                  {/* LEVEL 3: ROOMS */}
                                  {isFloorExpanded && (
                                    <div className="pl-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 border-l-2 border-slate-200 ml-2">
                                      {floor.rooms?.map((room: any) => (
                                        <button
                                          key={room.id}
                                          onClick={() =>
                                            setSelectedNodeDetails({
                                              id: room.id,
                                              name: `Room ${room.roomNumber}`,
                                              type: 'ROOM',
                                              capacity: room.capacity,
                                              occupancy: `${room.occupiedBeds}/${room.capacity}`,
                                              status: room.status,
                                              meta: {
                                                block: block.name,
                                                floor: floor.name,
                                                type: room.roomType,
                                                beds: room.beds,
                                              },
                                            })
                                          }
                                          className="p-1.5 bg-white border border-slate-200 hover:border-indigo-300 rounded text-left flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-1">
                                            <DoorOpen className="w-3 h-3 text-indigo-600" />
                                            <span className="font-bold text-slate-800">{room.roomNumber}</span>
                                          </div>
                                          <span className="text-[9px] text-slate-400">
                                            {room.occupiedBeds}/{room.capacity}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tree Node Details Inspector (Right col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Info className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Node Inspector
              </h3>
            </div>

            {selectedNodeDetails ? (
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Selected Tree Element</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedNodeDetails.name}</div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                    TYPE: {selectedNodeDetails.type}
                  </span>
                </div>

                {selectedNodeDetails.capacity && (
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Occupancy</span>
                    <span className="font-semibold text-slate-800">{selectedNodeDetails.occupancy} Beds occupied</span>
                  </div>
                )}

                {selectedNodeDetails.status && (
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block text-[11px]">Status</span>
                    <span className="font-semibold text-slate-800">{selectedNodeDetails.status}</span>
                  </div>
                )}

                {selectedNodeDetails.meta?.beds && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-400 block text-[11px] font-semibold">Bed Occupants:</span>
                    {selectedNodeDetails.meta.beds.map((b: any) => (
                      <div key={b.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800">Bed {b.bedNumber}</span>
                        <span className="text-[11px] text-slate-500">
                          {b.student?.name || 'Vacant'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 mt-6">
                Click any room or traversal step badge to inspect its tree metadata and bed assignments.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
            <strong>Tree Depth:</strong> 4 Levels (Hostel → Block → Floor → Room)<br />
            <strong>Traversals:</strong> Visited via depth-first and breadth-first recursion.
          </div>
        </div>
      </div>
    </div>
  );
};
