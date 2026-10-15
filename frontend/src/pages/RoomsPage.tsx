import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Building,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Users,
  Layers,
  Sparkles,
  Bed as BedIcon,
  Filter,
  X,
  UserPlus,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { Room } from '../types';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);

  // Modals
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState<Room | null>(null);
  const [unallocatedStudents, setUnallocatedStudents] = useState<any[]>([]);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [allocationNotice, setAllocationNotice] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBlockId) params.append('blockId', selectedBlockId);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedRoomType) params.append('roomType', selectedRoomType);

      const res = await api.get(`/rooms?${params.toString()}`);
      if (res.data.success) {
        setRooms(res.data.data);
        setSummary(res.data.summary);

        // Extract blocks
        const blkMap: { [id: string]: any } = {};
        res.data.data.forEach((r: any) => {
          if (r.block) blkMap[r.block.id] = r.block;
        });
        setBlocks(Object.values(blkMap));
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedBlockId, selectedStatus, selectedRoomType]);

  const loadUnallocatedStudents = async () => {
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        const unalloc = res.data.data.filter((s: any) => !s.roomId);
        setUnallocatedStudents(unalloc);
        if (unalloc.length > 0) {
          setTargetStudentId(unalloc[0].studentId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateSpecificRoom = async () => {
    if (!targetStudentId || !showAllocateModal) return;
    try {
      const res = await api.post('/rooms/allocate', {
        studentId: targetStudentId,
        targetBlockId: showAllocateModal.blockId,
        preferredRoomType: showAllocateModal.roomType,
      });

      if (res.data.success) {
        setAllocationNotice(res.data.message);
        setShowAllocateModal(null);
        fetchRooms();
      } else {
        alert(res.data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Allocation failed.');
    }
  };

  const handleToggleMaintenance = async (roomId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    try {
      await api.put(`/rooms/${roomId}`, { status: newStatus });
      fetchRooms();
      if (viewRoom && viewRoom.id === roomId) {
        setViewRoom(null);
      }
    } catch (err) {
      alert('Failed to update room status.');
    }
  };

  const handleVacateStudent = async (studentId: string) => {
    if (!confirm('Vacate this bed?')) return;
    try {
      await api.post('/rooms/vacate', { studentId });
      fetchRooms();
      if (viewRoom) {
        // refresh view room
        const updated = await api.get(`/rooms/${viewRoom.id}`);
        if (updated.data.success) {
          setViewRoom(updated.data.data);
        }
      }
    } catch (err) {
      alert('Failed to vacate bed.');
    }
  };

  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete Room ${roomNumber}? Any allocated students will be vacated.`)) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data.success) {
        setAllocationNotice(res.data.message || `Room ${roomNumber} deleted successfully.`);
        if (viewRoom && viewRoom.id === roomId) {
          setViewRoom(null);
        }
        fetchRooms();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete room.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notice */}
      {allocationNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{allocationNotice}</span>
          </div>
          <button onClick={() => setAllocationNotice(null)} className="text-emerald-700 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Metric Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Rooms</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
              {summary.totalRooms}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{summary.totalBeds} total bed slots</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase">Occupied Beds</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1 font-['Plus_Jakarta_Sans']">
              {summary.occupiedBeds}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{summary.occupancyRate}% rate</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase">Available Beds</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-['Plus_Jakarta_Sans']">
              {summary.availableBeds}
            </div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">Ready for allocation</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Allocation Engine</span>
              <div className="text-xs font-bold text-slate-800 mt-1">First-Fit Selection</div>
            </div>
            <DSAComplexityBadge structure="Search Algorithm" operation="Room Scan" timeComplexity="O(R + B)" />
          </div>
        </div>
      )}

      {/* Block Tabs & Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Block Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedBlockId('')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedBlockId === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Blocks
            </button>
            {blocks.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBlockId(b.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedBlockId === b.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {b.name} ({b.genderType})
              </button>
            ))}
          </div>

          {/* Status & Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="PARTIALLY_OCCUPIED">Partially Occupied</option>
              <option value="FULL">Fully Occupied</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>

            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="NON_AC">Non-AC</option>
              <option value="AC">AC</option>
              <option value="DELUXE">Deluxe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
          No rooms match the selected block or filter parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isFull = room.availableBeds === 0;
            const isMaint = room.status === 'MAINTENANCE';

            return (
              <div
                key={room.id}
                className={`bg-white border rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isMaint
                    ? 'border-amber-200 bg-amber-50/20'
                    : isFull
                    ? 'border-slate-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {room.block?.name} • {room.floor?.name}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                        <span>Room {room.roomNumber}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {room.roomType}
                        </span>
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isMaint
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isFull
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isMaint ? 'Maintenance' : isFull ? 'Full' : `${room.availableBeds} Available`}
                    </span>
                  </div>

                  {/* Bed Slots Visual Representation */}
                  <div className="grid grid-cols-4 gap-1.5 my-3.5">
                    {room.beds?.map((bed) => (
                      <div
                        key={bed.id}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          bed.isOccupied
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <BedIcon className="w-3.5 h-3.5 mx-auto mb-1" />
                        <span className="text-[10px] font-bold block">Bed {bed.bedNumber}</span>
                        <span className="text-[9px] block truncate text-slate-500">
                          {bed.student ? bed.student.name.split(' ')[0] : 'Vacant'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setViewRoom(room)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Room
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isFull && !isMaint && (
                      <button
                        onClick={() => {
                          setShowAllocateModal(room);
                          loadUnallocatedStudents();
                        }}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px]"
                      >
                        Allocate
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleMaintenance(room.id, room.status)}
                      title={isMaint ? 'Mark as operational' : 'Mark for maintenance'}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                      title={`Delete Room ${room.roomNumber}`}
                      className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: View Room Occupants & Beds */}
      {viewRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Room {viewRoom.roomNumber} Occupant Details
                </h3>
                <p className="text-xs text-slate-400">
                  {viewRoom.block?.name} • {viewRoom.floor?.name} • {viewRoom.roomType}
                </p>
              </div>
              <button onClick={() => setViewRoom(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Bed Occupants:
              </h4>
              {viewRoom.beds?.map((bed) => (
                <div
                  key={bed.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        bed.isOccupied
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      B{bed.bedNumber}
                    </div>
                    <div>
                      {bed.student ? (
                        <>
                          <div className="font-bold text-slate-900">{bed.student.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {bed.student.studentId} • {bed.student.department} (Yr {bed.student.year})
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 font-medium">Bed is vacant</span>
                      )}
                    </div>
                  </div>

                  {bed.student && (
                    <button
                      onClick={() => handleVacateStudent(bed.student!.studentId)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-[11px] font-semibold border border-amber-200"
                    >
                      Vacate Bed
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDeleteRoom(viewRoom.id, viewRoom.roomNumber)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Room</span>
              </button>
              <button
                onClick={() => setViewRoom(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Allocate Student to this Specific Room */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                  Allocate to Room {showAllocateModal.roomNumber}
                </h3>
                <p className="text-xs text-slate-500">{showAllocateModal.availableBeds} beds currently vacant</p>
              </div>
              <button onClick={() => setShowAllocateModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {unallocatedStudents.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-500">
                  All registered students are currently allocated to beds!
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Unallocated Student
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {unallocatedStudents.map((s) => (
                      <option key={s.id} value={s.studentId}>
                        {s.name} ({s.studentId}) - {s.gender}, {s.department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAllocateModal(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                {unallocatedStudents.length > 0 && (
                  <button
                    onClick={handleAllocateSpecificRoom}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                  >
                    Confirm Bed Allocation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
