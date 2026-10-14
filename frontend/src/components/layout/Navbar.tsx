import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import api from '../../services/api';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState<string>('');

  const routeTitles: { [key: string]: { title: string; subtitle: string } } = {
    '/dashboard': { title: 'Dashboard Overview', subtitle: 'Real-time hostel metrics, room occupancy & DSA activity' },
    '/students': { title: 'Student Management', subtitle: 'List ADT linked list records, hash lookups & sorting' },
    '/rooms': { title: 'Rooms & Allocation', subtitle: 'First-fit room search, bed availability & allocation algorithm' },
    '/visitors': { title: 'Visitor Log', subtitle: 'Visitor check-in/out backed by LIFO stack history' },
    '/complaints': { title: 'Complaints & Grievances', subtitle: 'Category tracking, priority resolution & tickets' },
    '/maintenance': { title: 'Maintenance Queue', subtitle: 'FIFO queue with order-of-arrival Process Next dequeue' },
    '/hostel-structure': { title: 'Hostel Tree Hierarchy', subtitle: 'Hostel → Block → Floor → Room multi-way & binary traversals' },
    '/facilities': { title: 'Facilities Navigation', subtitle: 'Graph adjacency routing with BFS hops & Dijkstra meters' },
    '/dsa-visualizer': { title: 'DSA Visualizer Engine', subtitle: 'Interactive visualizer for all 8 Data Structures & Algorithms' },
    '/reports': { title: 'System Reports', subtitle: 'Consolidated logs, CSV export & audit print formats' },
    '/profile': { title: 'User Profile', subtitle: 'Account settings, permissions & password updates' },
    '/settings': { title: 'System Settings', subtitle: 'Application configuration & database status' },
  };

  const currentInfo = routeTitles[location.pathname] || {
    title: 'Smart Hostel Management',
    subtitle: 'Data Structures and Algorithms Capstone',
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // ignore silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(quickSearchQuery.trim())}`);
      setQuickSearchQuery('');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-400 font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Search */}
        <form onSubmit={handleQuickSearch} className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickSearchQuery}
            onChange={(e) => setQuickSearchQuery(e.target.value)}
            placeholder="Search student or room (Enter)..."
            className="w-56 lg:w-64 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-xs">Live Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-indigo-600 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications at this time.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconMap = {
                      ALERT: <ShieldAlert className="w-4 h-4 text-rose-500" />,
                      WARNING: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                      SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                      INFO: <Info className="w-4 h-4 text-blue-500" />,
                    };

                    return (
                      <div
                        key={n.id}
                        className={`p-3 text-xs flex gap-3 transition-colors ${
                          n.isRead ? 'bg-white' : 'bg-indigo-50/40'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{iconMap[n.type] || iconMap.INFO}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs">
              {user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log out"
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
