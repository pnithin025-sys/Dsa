import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DoorOpen,
  UserCheck,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

const COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleProcessNextMaintenance = async () => {
    try {
      setProcessingQueue(true);
      setQueueNotice(null);
      const res = await api.post('/maintenance/process-next');
      if (res.data.success) {
        setQueueNotice(res.data.message);
        fetchDashboardData();
      }
    } catch (err: any) {
      setQueueNotice(err.response?.data?.message || 'Queue is currently empty.');
    } finally {
      setProcessingQueue(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {
    totalStudents: data?.metrics?.totalStudents ?? 52,
    totalRooms: data?.metrics?.totalRooms ?? 30,
    totalBeds: data?.metrics?.totalBeds ?? 102,
    occupiedBeds: data?.metrics?.occupiedBeds ?? 38,
    availableBeds: data?.metrics?.availableBeds ?? 64,
    fullyOccupiedRooms: data?.metrics?.occupiedRooms ?? 8,
    occupancyPercentage: data?.metrics?.occupancyRate ?? 37.3,
    pendingComplaints: data?.metrics?.pendingComplaints ?? 5,
    pendingMaintenance: data?.metrics?.pendingMaintenance ?? 8,
    todayVisitors: data?.metrics?.activeVisitors ?? 6,
  };

  const charts = data?.charts || {
    roomOccupancyByBlock: [
      { block: 'Block A', capacity: 44, occupied: 19, available: 25, rate: 43.2 },
      { block: 'Block B', capacity: 44, occupied: 19, available: 25, rate: 43.2 },
      { block: 'Block C', capacity: 14, occupied: 0, available: 14, rate: 0.0 },
    ],
    complaintsByCategory: [
      { category: 'ROOM', count: 3 },
      { category: 'FOOD', count: 2 },
      { category: 'WATER', count: 2 },
      { category: 'ELECTRICITY', count: 4 },
      { category: 'INTERNET', count: 4 },
    ],
    studentsByDepartment: [
      { dept: 'CSE', count: 12 },
      { dept: 'ECE', count: 9 },
      { dept: 'AI & DS', count: 8 },
      { dept: 'IT', count: 7 },
      { dept: 'MECH', count: 6 },
      { dept: 'EEE', count: 5 },
      { dept: 'CIVIL', count: 5 },
    ],
    maintenanceStatus: [
      { status: 'PENDING', count: 8 },
      { status: 'IN_PROGRESS', count: 3 },
      { status: 'COMPLETED', count: 4 },
    ],
  };

  const recentActivities = data?.recentActivities || [];
  const dsaState = data?.dsaState || {
    studentListLength: kpi.totalStudents || 52,
    visitorStackDepth: 20,
    maintenanceQueueLength: kpi.pendingMaintenance || 8,
    hashTableLoadFactor: 2.74,
  };

  return (
    <div className="space-y-6">
      {/* Banner Notice / Quick Action */}
      {queueNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{queueNotice}</span>
          </div>
          <button onClick={() => setQueueNotice(null)} className="text-emerald-700 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={kpi.totalStudents}
          subtitle="Enrolled residents"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={{ value: `${dsaState.studentListLength} Nodes in List ADT`, isPositive: true }}
          onClick={() => navigate('/students')}
        />

        <StatCard
          title="Bed Occupancy"
          value={`${kpi.occupiedBeds} / ${kpi.totalBeds}`}
          subtitle={`${kpi.occupancyPercentage}% occupied`}
          icon={DoorOpen}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={{ value: `${kpi.availableBeds} beds available`, isPositive: kpi.availableBeds > 0 }}
          onClick={() => navigate('/rooms')}
        />

        <StatCard
          title="Maintenance Queue"
          value={kpi.pendingMaintenance}
          subtitle="Pending in FIFO queue"
          icon={Wrench}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 'Queue ADT: O(1) Dequeue', isPositive: false }}
          onClick={() => navigate('/maintenance')}
        />

        <StatCard
          title="Today's Visitors"
          value={kpi.todayVisitors}
          subtitle="Logged at security"
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: `${dsaState.visitorStackDepth} items in Stack`, isPositive: true }}
          onClick={() => navigate('/visitors')}
        />
      </div>

      {/* Quick Action Bar with Active DSA Indicators */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-slate-800">Quick Actions:</span>
          <span className="hidden sm:inline text-xs text-slate-500">Run direct DSA operations on the hostel database</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/rooms')}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Allocate Room (Algorithm)
          </button>

          <button
            onClick={handleProcessNextMaintenance}
            disabled={processingQueue || kpi.pendingMaintenance === 0}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            {processingQueue ? 'Processing...' : 'Process Next in Queue (FIFO)'}
          </button>

          <button
            onClick={() => navigate('/dsa-visualizer')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            DSA Visualizer
          </button>
        </div>
      </div>

      {/* Charts Section: 2x2 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Room Occupancy by Hostel Block */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Room Occupancy by Hostel Block
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Capacity vs Occupied beds</p>
            </div>
            <DSAComplexityBadge structure="Tree" operation="Node Aggregate" timeComplexity="O(R)" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.roomOccupancyByBlock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="block" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Beds" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaints by Category */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Complaints by Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Resident issues breakdown</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {kpi.pendingComplaints} Pending
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.complaintsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {charts.complaintsByCategory.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Student Distribution by Department */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Students by Academic Department
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across engineering programs</p>
            </div>
            <DSAComplexityBadge structure="Hash Table" operation="Frequency Count" timeComplexity="O(N)" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.studentsByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Enrolled Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Maintenance Request Statuses */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
                Maintenance Resolution Status
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pending vs In Progress vs Completed</p>
            </div>
            <DSAComplexityBadge structure="Queue (FIFO)" operation="Pipeline Track" timeComplexity="O(1)" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.maintenanceStatus} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Total Tickets" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section (LIFO Stack Demonstration) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Recent Activity Stream
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Stack (LIFO) Top Elements
            </span>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.map((act: any) => (
            <div key={act.id} className="py-3 flex items-start justify-between text-xs gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                <div>
                  <span className="font-semibold text-slate-800">{act.action.replace(/_/g, ' ')}: </span>
                  <span className="text-slate-600">{act.details}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">By {act.performedBy}</div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
