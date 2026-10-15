import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Sparkles,
  Layers,
  Building,
  User,
  X,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { MaintenanceRequest } from '../types';
import { StatCard } from '../components/common/StatCard';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const MaintenancePage: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dsaQueue, setDsaQueue] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [operationLog, setOperationLog] = useState<any>(null);

  // New Request Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [roomNumber, setRoomNumber] = useState<string>('A-101');
  const [category, setCategory] = useState<string>('ELECTRICAL');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('HIGH');

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/maintenance?${params.toString()}`);
      if (res.data.success) {
        setRequests(res.data.data);
        setStats(res.data.stats);
        setDsaQueue(res.data.dsaQueue);
      }
    } catch (err) {
      console.error('Failed to load maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [categoryFilter, statusFilter]);

  const handleProcessNext = async () => {
    try {
      setProcessing(true);
      setOperationLog(null);
      const res = await api.post('/maintenance/process-next');
      if (res.data.success) {
        setOperationLog(res.data);
        fetchMaintenance();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Queue is currently empty.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/maintenance', {
        roomNumber,
        category,
        description,
        priority,
      });

      if (res.data.success) {
        setShowAddModal(false);
        setDescription('');
        fetchMaintenance();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleDeleteMaintenance = async (id: string, requestId?: string) => {
    if (!confirm(`Are you sure you want to delete maintenance ticket ${requestId || id}?`)) return;
    try {
      const res = await api.delete(`/maintenance/${id}`);
      if (res.data.success) {
        setOperationLog({ message: res.data.message || 'Maintenance request deleted successfully.' });
        fetchMaintenance();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete maintenance request.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Operation Notice / Result of Dequeue */}
      {operationLog && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>FIFO Dequeue Operation Successful!</span>
            </div>
            <button
              onClick={() => setOperationLog(null)}
              className="text-indigo-600 hover:underline text-[11px] font-semibold"
            >
              Dismiss
            </button>
          </div>
          <p className="text-slate-700">
            {operationLog.message}
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1 text-slate-600">
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
              Remaining in Queue: {operationLog.dsaOperation?.remainingQueueLength}
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
              Next in Line: {operationLog.dsaOperation?.nextInLine}
            </span>
            <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700 font-bold">
              Time: O(1)
            </span>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Total Tickets"
            value={stats.totalRequests}
            subtitle="All logged repairs"
            icon={Wrench}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />

          <StatCard
            title="Pending in Queue"
            value={stats.pendingCount}
            subtitle="FIFO waiting line"
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            trend={{ value: `${stats.pendingCount} unserviced`, isPositive: false }}
          />

          <StatCard
            title="In Progress"
            value={stats.inProgressCount}
            subtitle="Technician dispatched"
            icon={Wrench}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />

          <StatCard
            title="Resolved / Done"
            value={stats.completedCount}
            subtitle="Successfully closed"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>
      )}

      {/* FIFO Queue Visualizer Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Maintenance Requests Queue (FIFO ADT)
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Queue Length: {dsaQueue?.queueLength || 0}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict First-In, First-Out order. Front item is always processed first.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DSAComplexityBadge structure="CustomQueue" operation="Enqueue / Dequeue" timeComplexity="O(1)" />
            <button
              onClick={handleProcessNext}
              disabled={processing || dsaQueue?.queueLength === 0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{processing ? 'Processing...' : 'Process Next in Queue (FIFO Dequeue)'}</span>
            </button>
          </div>
        </div>

        {/* Visual Queue Pipeline */}
        <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
          {dsaQueue?.elements && dsaQueue.elements.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* FRONT Indicator */}
              <div className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs">
                <span>FRONT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              {dsaQueue.elements.map((req: any, index: number) => (
                <React.Fragment key={req.id}>
                  <div
                    className={`p-3 rounded-xl border shadow-2xs text-xs shrink-0 min-w-48 transition-all ${
                      index === 0
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        #{req.requestId}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          req.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : req.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 mt-1 truncate">
                      {req.category}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Room {req.roomNumber}
                    </div>
                  </div>

                  {index < dsaQueue.elements.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              ))}

              {/* REAR Indicator */}
              <div className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg shrink-0">
                REAR
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              Queue is empty! All maintenance requests have been dequeued and serviced.
            </div>
          )}
        </div>
      </div>

      {/* Requests History Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="FURNITURE">Furniture</option>
              <option value="INTERNET">Internet</option>
              <option value="CLEANING">Cleaning</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending (In Queue)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enqueue Maintenance Ticket (O(1))</span>
          </button>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">#{r.requestId}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-700">Room {r.roomNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.category}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{r.description}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.priority === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : r.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(r.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteMaintenance(r.id, r.requestId)}
                      title="Delete Maintenance Request"
                      className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Submit Maintenance Request
                </h3>
                <p className="text-xs text-indigo-600 font-mono">
                  Enqueues at rear of FIFO Queue [O(1)]
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A-102"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="INTERNET">Internet</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical (Emergency)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the repair required in detail..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Enqueue Request (FIFO)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
