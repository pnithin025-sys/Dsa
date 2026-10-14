import React from 'react';
import {
  Settings,
  Database,
  Server,
  Cpu,
  Shield,
  Layers,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { DSAComplexityBadge } from '../components/common/DSAComplexityBadge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            System Architecture & Environment Settings
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Technical configuration, database engine, and DSA in-memory specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Specification */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Backend Runtime
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Framework:</span>
              <span className="font-semibold text-slate-800">Node.js + Express + TypeScript</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-slate-800">SQLite (Zero-daemon local persistence)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">ORM & Query Builder:</span>
              <span className="font-semibold text-slate-800">Prisma Client 6.19</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-semibold text-slate-800">JWT + bcrypt (10 rounds)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Frontend Stack:</span>
              <span className="font-semibold text-slate-800">React 19 + TypeScript + Vite + Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* DSA Service State */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800 font-['Plus_Jakarta_Sans']">
              Data Structure Engines
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Student Linked List:</span>
                <span className="text-[11px] text-slate-500 block">Singly linked node chain</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                O(1) / O(n)
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Maintenance Queue:</span>
                <span className="text-[11px] text-slate-500 block">FIFO queue with head/tail pointers</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                O(1)
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Visitor Stack:</span>
                <span className="text-[11px] text-slate-500 block">LIFO stack with top pointer</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                O(1)
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Student Hash Table:</span>
                <span className="text-[11px] text-slate-500 block">19 chained collision buckets</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Avg O(1)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
