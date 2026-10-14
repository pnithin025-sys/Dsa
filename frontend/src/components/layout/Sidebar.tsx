import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  UserCheck,
  AlertCircle,
  Wrench,
  Network,
  Compass,
  Cpu,
  FileSpreadsheet,
  User,
  Settings,
  X,
  Code2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users, dsa: 'List ADT / Hash' },
    { name: 'Rooms & Beds', path: '/rooms', icon: DoorOpen, dsa: 'First-Fit Search' },
    { name: 'Visitors Log', path: '/visitors', icon: UserCheck, dsa: 'Stack (LIFO)' },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, dsa: 'Queue (FIFO)' },
    { name: 'Hostel Structure', path: '/hostel-structure', icon: Network, dsa: 'Binary Tree' },
    { name: 'Facilities Nav', path: '/facilities', icon: Compass, dsa: 'Graph / BFS' },
    { name: 'DSA Visualizer', path: '/dsa-visualizer', icon: Cpu, badge: 'Capstone' },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base font-['Plus_Jakarta_Sans']">
                  SmartHostel
                </span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                  DSA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Capstone System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-slate-900" />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    {item.badge}
                  </span>
                ) : item.dsa ? (
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">
                    {item.dsa}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>

        {/* DSA Status Footer */}
        <div className="p-3 m-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              DSA Engine
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            8 Custom Structures & Algorithms live in memory and synchronized.
          </div>
        </div>

        {/* User Mini Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {user?.role}
          </span>
        </div>
      </aside>
    </>
  );
};
