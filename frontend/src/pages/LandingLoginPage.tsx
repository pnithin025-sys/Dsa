import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LandingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'WARDEN'>('WARDEN');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Register API call with automatic in-browser fallback
        const res = await api.post('/auth/register', { email, password, name, role });
        const data = res.data;
        if (!data.success) {
          setErrorMsg(data.message || 'Registration failed.');
          setLoading(false);
          return;
        }
        // Auto-login after registration
        await login(email, password);
        navigate('/dashboard');
      } else {
        const res = await login(email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setErrorMsg(res.message || 'Login failed.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Even if network or request throws, fallback login attempt
      try {
        const fallbackRes = await login(email, password);
        if (fallbackRes.success) {
          navigate('/dashboard');
          return;
        }
      } catch (e) {}
      setErrorMsg('Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegistering(false);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg font-['Plus_Jakarta_Sans'] tracking-tight">
                SmartHostel
              </span>
              <span className="ml-2 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                DSA Capstone
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Autonomous Hostel Operations & Data Structures
          </div>
        </div>
      </header>

      {/* Main Hero & Auth Split */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
        {/* Left Column: System Narrative & Highlights */}
        <div className="flex-1 max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Full-Stack DSA Capstone Project
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.15]">
            Smart Hostel Management System
          </h1>
          <p className="text-base text-slate-600 mt-4 leading-relaxed font-normal">
            Efficient hostel management powered by real, production-integrated Data Structures and
            Algorithms. No mock names — actual algorithms handling room allocation, maintenance queues,
            campus pathfinding, and fast record lookups.
          </p>

          {/* Integrated DSA Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8">
            {[
              { name: 'List ADT', sub: 'Student Chain' },
              { name: 'Stack (LIFO)', sub: 'Visitor Log' },
              { name: 'Queue (FIFO)', sub: 'Maintenance' },
              { name: 'Hash Table', sub: 'O(1) Student ID' },
              { name: 'Binary Tree', sub: 'Hostel Layout' },
              { name: 'Graph & BFS', sub: 'Campus Routing' },
              { name: 'Quick / Merge', sub: 'Student Sorting' },
              { name: 'Binary Search', sub: 'O(log n) Trace' },
            ].map((d, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-xs text-left"
              >
                <div className="text-xs font-bold text-indigo-600">{d.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{d.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Clean SaaS Login / Register Card */}
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {isRegistering ? 'Create Management Account' : 'Sign in to Dashboard'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegistering
                  ? 'Register as an administrator or warden'
                  : 'Enter your credentials to access the hostel console'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Rajesh Sharma"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="WARDEN">Hostel Warden</option>
                      <option value="ADMIN">Chief Administrator (Full Access)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hostel.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>{isRegistering ? 'Register Account' : 'Sign in to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Credentials Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Evaluation Demo Accounts (1-Click Fill)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@hostel.com', 'Admin@123')}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                    Admin Account
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Admin@123</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('warden@hostel.com', 'Warden@123')}
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <span className="block text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                    Warden Account
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">Warden@123</span>
                </button>
              </div>
            </div>

            {/* Switch Mode Toggle */}
            <div className="mt-5 text-center text-xs text-slate-500">
              {isRegistering ? (
                <span>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setErrorMsg('');
                    }}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Need a new warden profile?{' '}
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg('');
                    }}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Register here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        Smart Hostel Management System • Final Year DSA Capstone Project • Node.js, Express, TypeScript, Prisma & React
      </footer>
    </div>
  );
};
