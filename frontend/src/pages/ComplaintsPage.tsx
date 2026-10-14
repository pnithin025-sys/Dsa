import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Building,
  User,
  Shield,
  Zap,
  Wifi,
  Droplets,
  Utensils,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../services/api';
import { Complaint } from '../types';
import { StatCard } from '../components/common/StatCard';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Complaint Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [category, setCategory] = useState<string>('ROOM');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [categoryFilter, priorityFilter, statusFilter, searchQuery]);

  const loadStudents = async () => {
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStudentId(res.data.data[0].studentId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/complaints', {
        studentId: selectedStudentId,
        category,
        description,
        priority,
      });

      if (res.data.success) {
        setToastNotice(res.data.message);
        setShowAddModal(false);
        setDescription('');
        fetchComplaints();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to file complaint.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/complaints/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'FOOD':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'WATER':
        return <Droplets className="w-3.5 h-3.5 text-blue-500" />;
      case 'ELECTRICITY':
        return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case 'INTERNET':
        return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case 'SECURITY':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Building className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-emerald-700 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            subtitle="Logged tickets"
            icon={AlertCircle}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />

          <StatCard
            title="Newly Submitted"
            value={stats.submitted}
            subtitle="Awaiting review"
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            subtitle="Under investigation"
            icon={AlertCircle}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />

          <StatCard
            title="Resolved"
            value={stats.resolved}
            subtitle="Successfully addressed"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>
      )}

      {/* Controls & Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID or student..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="ROOM">Room</option>
              <option value="FOOD">Food</option>
              <option value="CLEANING">Cleaning</option>
              <option value="WATER">Water</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="INTERNET">Internet</option>
              <option value="SECURITY">Security</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              loadStudents();
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Complaint</span>
          </button>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status & Transition</th>
                <th className="py-3 px-4">Filed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">#{c.complaintId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {c.studentName}
                    {c.student?.room && (
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Room {c.student.room.roomNumber}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      {getCategoryIcon(c.category)}
                      <span>{c.category}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{c.description}</td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : c.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border focus:outline-none ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Log Resident Complaint
                </h3>
                <p className="text-xs text-slate-400">Hostel grievance ticketing system</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filing Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.studentId}>
                      {s.name} ({s.studentId}) {s.room ? `• Room ${s.room.roomNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="ROOM">Room Structure</option>
                    <option value="FOOD">Food & Mess</option>
                    <option value="CLEANING">Cleaning & Waste</option>
                    <option value="WATER">Water Supply</option>
                    <option value="ELECTRICITY">Electricity</option>
                    <option value="INTERNET">Wi-Fi & Internet</option>
                    <option value="SECURITY">Security / Gate</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the complaint in detail..."
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
