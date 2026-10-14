import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  ArrowRight,
  Route,
  Activity,
  Sparkles,
  Layers,
  Footprints,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { Facility, FacilityEdge } from '../types';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [edges, setEdges] = useState<FacilityEdge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Route Planning State
  const [startId, setStartId] = useState<string>('');
  const [destId, setDestId] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<'BFS' | 'DIJKSTRA'>('BFS');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [navigating, setNavigating] = useState<boolean>(false);
  const [dfsResult, setDfsResult] = useState<any>(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/facilities');
      if (res.data.success) {
        setFacilities(res.data.data.facilities);
        setEdges(res.data.data.edges);

        if (res.data.data.facilities.length >= 2) {
          // Default: Hostel A to Medical
          const hA = res.data.data.facilities.find((f: any) => f.code === 'HOSTEL_A');
          const med = res.data.data.facilities.find((f: any) => f.code === 'MEDICAL');
          if (hA && med) {
            setStartId(hA.id);
            setDestId(med.id);
          } else {
            setStartId(res.data.data.facilities[0].id);
            setDestId(res.data.data.facilities[1].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleFindRoute = async () => {
    if (!startId || !destId) return;
    try {
      setNavigating(true);
      setDfsResult(null);
      const res = await api.post('/facilities/navigate', {
        startFacilityId: startId,
        destinationFacilityId: destId,
        algorithm,
      });

      if (res.data.success) {
        setRouteResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Route calculation failed.');
    } finally {
      setNavigating(false);
    }
  };

  const handleRunDFS = async () => {
    try {
      setNavigating(true);
      setRouteResult(null);
      const res = await api.get(`/facilities/explore-dfs?startId=${startId}`);
      if (res.data.success) {
        setDfsResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'DFS exploration failed.');
    } finally {
      setNavigating(false);
    }
  };

  const isNodeOnRoute = (nodeId: string) => {
    if (!routeResult?.path) return false;
    return routeResult.path.some((p: any) => p.id === nodeId);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                Campus Facility Navigation & Graph Routing
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hostel facilities represented as graph vertices. Walking walkways represented as weighted edges.
            </p>
          </div>
          <DSAComplexityBadge
            structure="Graph (Adjacency List)"
            operation="BFS / Dijkstra"
            timeComplexity="O(V + E) / O((V+E) log V)"
            spaceComplexity="O(V)"
          />
        </div>
      </div>

      {/* Route Finder Query Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Origin Point (From)</label>
            <select
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Destination (To)</label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Optimization Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900"
            >
              <option value="BFS">Breadth-First Search (Shortest Hops)</option>
              <option value="DIJKSTRA">Dijkstra's Algorithm (Shortest Meters)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleFindRoute}
              disabled={navigating}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{navigating ? 'Routing...' : 'Find Route'}</span>
            </button>

            <button
              onClick={handleRunDFS}
              disabled={navigating}
              title="Run Depth-First Search exploration"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
            >
              DFS Explore
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Interactive Graph Canvas + Path Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Campus Map Canvas (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Interactive Campus Topological Map
            </h3>
            <span className="text-[11px] text-slate-400">
              {facilities.length} Vertices • {edges.length / 2} Pathways
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-96 bg-slate-50/70 border border-slate-200/70 rounded-xl overflow-hidden p-2">
            <svg className="w-full h-full" viewBox="50 50 780 500">
              {/* Draw Edges */}
              {edges.map((edge, idx) => {
                const s = facilities.find((f) => f.id === edge.sourceFacilityId);
                const t = facilities.find((f) => f.id === edge.targetFacilityId);
                if (!s || !t) return null;

                const isPathEdge =
                  routeResult?.path &&
                  routeResult.path.some((p: any, i: number) => {
                    if (i === 0) return false;
                    const prev = routeResult.path[i - 1];
                    return (
                      (prev.id === s.id && p.id === t.id) ||
                      (prev.id === t.id && p.id === s.id)
                    );
                  });

                return (
                  <g key={`${edge.id}-${idx}`}>
                    <line
                      x1={s.xCoord}
                      y1={s.yCoord}
                      x2={t.xCoord}
                      y2={t.yCoord}
                      stroke={isPathEdge ? '#4f46e5' : '#cbd5e1'}
                      strokeWidth={isPathEdge ? 3.5 : 1.5}
                      strokeDasharray={isPathEdge ? '' : '3 3'}
                      className="transition-all duration-300"
                    />
                    {/* Distance label */}
                    <text
                      x={(s.xCoord + t.xCoord) / 2}
                      y={(s.yCoord + t.yCoord) / 2 - 4}
                      fill={isPathEdge ? '#4338ca' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight={isPathEdge ? 'bold' : 'normal'}
                    >
                      {edge.distanceMeters}m
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes (Facilities) */}
              {facilities.map((fac) => {
                const isOnRoute = isNodeOnRoute(fac.id);
                const isStart = fac.id === startId;
                const isDest = fac.id === destId;

                return (
                  <g
                    key={fac.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (!startId) setStartId(fac.id);
                      else setDestId(fac.id);
                    }}
                  >
                    <circle
                      cx={fac.xCoord}
                      cy={fac.yCoord}
                      r={isStart || isDest ? 14 : isOnRoute ? 12 : 9}
                      fill={
                        isStart
                          ? '#10b981'
                          : isDest
                          ? '#ef4444'
                          : isOnRoute
                          ? '#4f46e5'
                          : '#ffffff'
                      }
                      stroke={
                        isStart
                          ? '#059669'
                          : isDest
                          ? '#dc2626'
                          : isOnRoute
                          ? '#4338ca'
                          : '#64748b'
                      }
                      strokeWidth={isStart || isDest || isOnRoute ? 2.5 : 1.5}
                      className="transition-all duration-300 group-hover:scale-110"
                    />

                    {/* Label */}
                    <text
                      x={fac.xCoord}
                      y={fac.yCoord + 22}
                      fill={isStart || isDest ? '#0f172a' : isOnRoute ? '#4338ca' : '#475569'}
                      fontSize="10"
                      fontWeight={isStart || isDest || isOnRoute ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      {fac.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Route Details & Execution Trace (Right col) */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Route className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Navigation Route Result
            </h3>
          </div>

          {routeResult ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Algorithm: {routeResult.algorithm}
                </div>
                <div className="text-sm font-extrabold text-indigo-900 mt-1">
                  Total Walking Distance: {routeResult.totalDistanceMeters} meters
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Connections: {routeResult.hopCount} hops • Inspected: {routeResult.visitedNodesCount} nodes
                </div>
              </div>

              {/* Step-by-Step Waypoint Itinerary */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Waypoint Route:
                </span>
                <div className="space-y-1.5">
                  {routeResult.pathSteps?.map((step: any, i: number) => (
                    <div
                      key={step.facility.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <span className="font-semibold text-slate-800 truncate">
                          {step.facility.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap ml-2">
                        {step.cumulativeDistance}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Steps Trace */}
              {routeResult.executionSteps && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono space-y-1 max-h-40 overflow-y-auto">
                  <span className="text-slate-400 font-bold block mb-1">GRAPH SEARCH TRACE:</span>
                  {routeResult.executionSteps.map((st: string, idx: number) => (
                    <div key={idx} className="text-slate-700">
                      {st}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : dfsResult ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950">
                <span className="text-[11px] font-bold text-indigo-700 uppercase">
                  DFS Exploration Order
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Starting at: <strong>{dfsResult.startNode?.name}</strong>
                </p>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto font-mono text-[11px]">
                {dfsResult.traceSteps?.map((st: string, idx: number) => (
                  <div key={idx} className="p-1 bg-slate-50 rounded text-slate-700">
                    {st}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select origin and destination facilities and click <strong>Find Route</strong> to run BFS or Dijkstra pathfinding.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
