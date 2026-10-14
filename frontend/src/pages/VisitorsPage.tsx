import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  UserPlus,
  Clock,
  LogOut,
  Layers,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  Shield,
  X,
  ArrowDown,
} from 'lucide-react';
import api from '../services/api';
import { Visitor } from '../types';
import { StatCard } from '../components/common/StatCard';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const VisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dsaStack, setDsaStack] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Visitor Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [studentSearchList, setStudentSearchList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [visitorName, setVisitorName] = useState<string>('');
  const [visitorPhone, setVisitorPhone] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Parent');
  const [purpose, setPurpose] = useState<string>('Weekend Visit');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/visitors?${params.toString()}`);
      if (res.data.success) {
        setVisitors(res.data.data);
        setStats(res.data.stats);
        setDsaStack(res.data.dsaStack);
      }
    } catch (err) {
      console.error('Failed to load visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, searchQuery]);

  const loadStudentsForModal = async () => {
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        setStudentSearchList(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStudentId(res.data.data[0].studentId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/visitors', {
        name: visitorName,
        studentId: selectedStudentId,
        phone: visitorPhone,
        relationship,
        purpose,
      });

      if (res.data.success) {
        setToastNotice(res.data.message);
        setShowAddModal(false);
        setVisitorName('');
        setVisitorPhone('');
        fetchVisitors();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record entry.');
    }
  };

  const handleRecordExit = async (visitorId: string) => {
    try {
      const res = await api.put(`/visitors/${visitorId}/exit`);
      if (res.data.success) {
        setToastNotice(res.data.message);
        fetchVisitors();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record exit.');
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
            title="Today's Visits"
            value={stats.todayVisitors}
            subtitle="Security gate entries"
            icon={Calendar}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />

          <StatCard
            title="Currently Inside"
            value={stats.currentlyInside}
            subtitle="Campus premises"
            icon={UserCheck}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            trend={{ value: 'Active passes', isPositive: true }}
          />

          <StatCard
            title="Exited Visitors"
            value={stats.exitedCount}
            subtitle="Checked out"
            icon={LogOut}
            iconColor="text-slate-600"
            iconBg="bg-slate-100"
          />

          <StatCard
            title="Total Visits"
            value={stats.totalVisits}
            subtitle="All-time logs"
            icon={Shield}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>
      )}

      {/* DSA Stack Live Visualizer Container */}
      {dsaStack && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Visitor Log Stack (LIFO - Last In First Out)
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Depth: {dsaStack.stackSize}
              </span>
            </div>
            <DSAComplexityBadge structure="CustomStack" operation="Push / Pop" timeComplexity="O(1)" />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <p className="text-xs text-slate-500 mb-3">
              Each new visitor entry is <strong>pushed</strong> to the top of the Stack in O(1) time. The topmost entry represents the most recent campus access.
            </p>

            {/* Visual Stack Cards */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <div className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs">
                <span>TOP</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>

              {dsaStack.recentEntries?.slice(0, 5).map((entry: any, idx: number) => (
                <div
                  key={entry.id || idx}
                  className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs shrink-0 flex flex-col min-w-44"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-700 font-mono text-[11px]">
                      {entry.visitorId}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        entry.status === 'INSIDE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800 mt-1 truncate">{entry.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">Visiting: {entry.studentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table & Controls */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor pass, name or phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="INSIDE">Currently Inside</option>
              <option value="EXITED">Exited</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              loadStudentsForModal();
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Record Visitor Entry (Push to Stack)</span>
          </button>
        </div>

        {/* Visitors Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Student Visited</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.visitorId}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {v.name}
                    <span className="block text-[11px] text-slate-400 font-normal">{v.phone} ({v.relationship})</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="font-semibold">{v.studentName}</span>
                    {v.student?.room && (
                      <span className="text-[10px] text-indigo-600 block">
                        Room {v.student.room.roomNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{v.purpose}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(v.entryTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'INSIDE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {v.status === 'INSIDE' && (
                      <button
                        onClick={() => handleRecordExit(v.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                      >
                        Record Exit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Visitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Record Visitor Pass
                </h3>
                <p className="text-xs text-indigo-600 font-mono">
                  Stack Push Operation [O(1)]
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student to Visit</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {studentSearchList.map((s) => (
                    <option key={s.id} value={s.studentId}>
                      {s.name} ({s.studentId}) {s.room ? `• Room ${s.room.roomNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="+91 9811023456"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Relative">Relative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visit Purpose</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Fee payment / Weekend check-in"
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
                  Push to Stack & Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
