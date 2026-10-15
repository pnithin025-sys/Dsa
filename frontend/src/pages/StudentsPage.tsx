import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  DoorOpen,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Hash,
  Sparkles,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import api from '../services/api';
import { Student } from '../types';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';
import { EmptyState } from '../components/common/EmptyState';

export const StudentsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('studentId');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [sortAlgorithm, setSortAlgorithm] = useState<string>('Quick Sort');
  const [dsaContext, setDsaContext] = useState<any>(null);

  // Modals
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAllocateModal, setShowAllocateModal] = useState<Student | null>(null);
  const [allocationBlocks, setAllocationBlocks] = useState<any[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [preferredRoomType, setPreferredRoomType] = useState<string>('NON_AC');
  const [allocationResult, setAllocationResult] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form for New Student
  const [formData, setFormData] = useState({
    name: '',
    department: 'CSE',
    year: 1,
    gender: 'MALE',
    phone: '',
    email: '',
    address: '',
    parentName: '',
    parentContact: '',
    allocateImmediately: true,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (departmentFilter) params.append('department', departmentFilter);
      if (yearFilter) params.append('year', yearFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('sortAlgorithm', sortAlgorithm);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data);
        setDsaContext(res.data.dsaContext);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, departmentFilter, yearFilter, statusFilter, sortBy, sortOrder, sortAlgorithm]);

  // Load blocks for allocation modal
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await api.get('/rooms');
        if (res.data.success) {
          // Unique blocks
          const blkMap: { [id: string]: any } = {};
          res.data.data.forEach((r: any) => {
            if (r.block) blkMap[r.block.id] = r.block;
          });
          setAllocationBlocks(Object.values(blkMap));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlocks();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        setActionNotice(res.data.message);
        setShowAddModal(false);
        setFormData({
          name: '',
          department: 'CSE',
          year: 1,
          gender: 'MALE',
          phone: '',
          email: '',
          address: '',
          parentName: '',
          parentContact: '',
          allocateImmediately: true,
        });
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add student.');
    }
  };

  const handleRunAllocation = async () => {
    if (!showAllocateModal) return;
    try {
      const res = await api.post('/rooms/allocate', {
        studentId: showAllocateModal.studentId,
        targetBlockId: selectedBlockId || undefined,
        preferredRoomType,
      });

      setAllocationResult(res.data);
      fetchStudents();
    } catch (err: any) {
      setAllocationResult({
        success: false,
        message: err.response?.data?.message || 'Room allocation failed.',
      });
    }
  };

  const handleVacateRoom = async (studentId: string) => {
    if (!confirm('Are you sure you want to vacate this bed?')) return;
    try {
      const res = await api.post('/rooms/vacate', { studentId });
      if (res.data.success) {
        setActionNotice(res.data.message);
        fetchStudents();
        if (viewStudent?.studentId === studentId) {
          setViewStudent(null);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Vacate failed.');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Permanently remove student ${name}? This unlinks their node in StudentLinkedList.`)) return;
    try {
      const res = await api.delete(`/students/${id}`);
      if (res.data.success) {
        setActionNotice(res.data.message);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* DSA Operational Metric Indicator Ribbon */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span className="text-xs font-bold text-slate-900 font-mono">List ADT Operation:</span>
          <span className="text-xs text-slate-600">
            Current Structure: <strong className="text-indigo-600">StudentLinkedList</strong> (Length:{' '}
            {dsaContext?.totalLinkedListNodes || students.length})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {dsaContext?.sortMetrics && (
            <DSAComplexityBadge
              structure="Sorting Algorithm"
              operation={`${dsaContext.sortMetrics.algorithm} (${dsaContext.sortMetrics.comparisonsCount} comps, ${dsaContext.sortMetrics.swapsCount} moves)`}
              timeComplexity={dsaContext.sortMetrics.timeComplexity.average}
            />
          )}

          {dsaContext?.searchResult && (
            <DSAComplexityBadge
              structure="Search Engine"
              operation={dsaContext.searchResult.method}
              timeComplexity={dsaContext.searchResult.timeComplexity}
            />
          )}
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Algorithm & Sort */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID (Hash), Name or Room..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons: Add Student and Allocate Room */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const unallocated = students.find((s) => !s.room);
                if (unallocated) {
                  setShowAllocateModal(unallocated);
                } else if (students.length > 0) {
                  setShowAllocateModal(students[0]);
                } else {
                  alert('No students available for room allocation. Please add a student first.');
                }
                setAllocationResult(null);
              }}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Allocate Room (Algorithm)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student (Insert Node)</span>
            </button>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="IT">IT</option>
            <option value="AI & DS">AI & DS</option>
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          {/* Sort By Field */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="studentId">Sort: Student ID</option>
            <option value="name">Sort: Name</option>
            <option value="department">Sort: Department</option>
            <option value="year">Sort: Year</option>
          </select>

          {/* Sort Algorithm Choice */}
          <select
            value={sortAlgorithm}
            onChange={(e) => setSortAlgorithm(e.target.value)}
            className="px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-200 text-indigo-800 font-semibold rounded-lg focus:outline-none"
          >
            <option value="Quick Sort">Algo: Quick Sort</option>
            <option value="Merge Sort">Algo: Merge Sort</option>
            <option value="Insertion Sort">Algo: Insertion Sort</option>
            <option value="Bubble Sort">Algo: Bubble Sort</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>{sortOrder === 'ASC' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Traversing linked list nodes and running {sortAlgorithm}...
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            title="No Students Found"
            description="No student records match the active filters or search criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setDepartmentFilter('');
              setYearFilter('');
              setStatusFilter('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student ID / Reg</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Dept & Year</th>
                  <th className="py-3 px-4">Hostel Allocation</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono">{student.studentId}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.regNumber}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {student.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{student.gender}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{student.department}</span>
                      <span className="text-slate-400 ml-1">Yr {student.year}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {student.room ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-medium">
                          <Building className="w-3 h-3 text-indigo-600" />
                          <span>
                            {student.room.roomNumber} (Bed {student.bed?.bedNumber || 1})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unallocated
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <div>{student.phone}</div>
                      <div className="text-[11px] text-slate-400">{student.email}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => setViewStudent(student)}
                        title="View Full Profile"
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {student.room ? (
                        <>
                          <button
                            onClick={() => {
                              setShowAllocateModal(student);
                              setAllocationResult(null);
                            }}
                            title="Reallocate / Change Room"
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <Building className="w-3 h-3" />
                            <span>Reallocate</span>
                          </button>
                          <button
                            onClick={() => handleVacateRoom(student.studentId)}
                            title="Vacate Bed"
                            className="p-1 rounded hover:bg-amber-50 text-amber-600 hover:text-amber-800"
                          >
                            <DoorOpen className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setShowAllocateModal(student);
                            setAllocationResult(null);
                          }}
                          title="Run Room Allocation Algorithm"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] shadow-xs inline-flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-200" />
                          <span>Allocate Room</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        title="Delete Student"
                        className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: View Student Profile Details */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Student Record: {viewStudent.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {viewStudent.studentId} • Reg: {viewStudent.regNumber}
                </p>
              </div>
              <button onClick={() => setViewStudent(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Department & Year</span>
                <span className="font-semibold text-slate-800">
                  {viewStudent.department} • Year {viewStudent.year}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-800">{viewStudent.gender}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">{viewStudent.phone}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800 truncate block">{viewStudent.email}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                <span className="text-slate-400 block">Parent / Guardian</span>
                <span className="font-semibold text-slate-800">
                  {viewStudent.parentName} ({viewStudent.parentContact})
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                <span className="text-slate-400 block">Residential Address</span>
                <span className="font-semibold text-slate-800">{viewStudent.address}</span>
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg col-span-2">
                <span className="text-indigo-600 font-semibold block">Hostel Room Allocation</span>
                <span className="font-bold text-indigo-900">
                  {viewStudent.room
                    ? `Room ${viewStudent.room.roomNumber} (Bed ${viewStudent.bed?.bedNumber || 1}) • ${viewStudent.room.roomType}`
                    : 'Currently Not Allocated'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Student (Insert Node into Linked List) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Add New Student
                </h3>
                <p className="text-xs text-indigo-600 font-mono">
                  DSA Operation: StudentLinkedList.insertAtTail() [O(n)]
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="IT">IT</option>
                    <option value="AI & DS">AI & DS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9845012999"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@campus.edu"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Name & Contact</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Parent / Guardian Name"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.parentContact}
                    onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                    placeholder="Emergency Contact"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permanent Home Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full residential address..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoAlloc"
                  checked={formData.allocateImmediately}
                  onChange={(e) => setFormData({ ...formData, allocateImmediately: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="autoAlloc" className="text-slate-700 cursor-pointer">
                  Automatically run Room Allocation algorithm after student registration
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-xs hover:bg-indigo-700"
                >
                  Insert Node into Linked List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Room Allocation Algorithm Visualizer */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Room Allocation Algorithm
                </h3>
                <p className="text-xs text-slate-500">
                  Target Student: <strong>{showAllocateModal.name}</strong> ({showAllocateModal.studentId})
                </p>
              </div>
              <button onClick={() => setShowAllocateModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!allocationResult ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Student</label>
                  <select
                    value={showAllocateModal.id}
                    onChange={(e) => {
                      const found = students.find((s) => s.id === e.target.value);
                      if (found) setShowAllocateModal(found);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.studentId}) — {st.department} {st.room ? `[Allocated: ${st.room.roomNumber}]` : '[Unallocated]'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Hostel Block</label>
                  <select
                    value={selectedBlockId}
                    onChange={(e) => setSelectedBlockId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Auto-Detect based on Gender ({showAllocateModal.gender})</option>
                    {allocationBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.genderType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Type Preference</label>
                  <select
                    value={preferredRoomType}
                    onChange={(e) => setPreferredRoomType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="NON_AC">Standard Non-AC (4 Sharing)</option>
                    <option value="AC">AC Room (4 Sharing)</option>
                    <option value="DELUXE">Deluxe Scholar (2 Sharing)</option>
                  </select>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-slate-600 leading-relaxed">
                  <strong className="text-indigo-900 block mb-1">Algorithm Execution Steps:</strong>
                  1. Filter target block rooms.<br />
                  2. Linear scan of rooms with available beds &gt; 0.<br />
                  3. Select first-fit available bed in ascending order.<br />
                  4. Atomically commit room occupancy and synchronize Linked List.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowAllocateModal(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunAllocation}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Execute Allocation</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {allocationResult.success ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Allocation Result: SUCCESS
                    </div>
                    <div>Allocated: {allocationResult.blockName}, <strong>Room {allocationResult.roomNumber}</strong>, <strong>Bed {allocationResult.bedNumber}</strong></div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Allocation Failed
                    </div>
                    <div>{allocationResult.message}</div>
                  </div>
                )}

                {/* Step trace display */}
                {allocationResult.steps && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400 font-semibold mb-1">ALGORITHM EXECUTION TRACE:</div>
                    {allocationResult.steps.map((s: any) => (
                      <div key={s.step} className="text-slate-700">
                        [{s.step}] {s.action}: <span className="text-slate-500">{s.detail}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowAllocateModal(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs"
                  >
                    Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
