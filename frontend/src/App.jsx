import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useTaskStore } from './store/useTaskStore';
import { useHabitStore } from './store/useHabitStore';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import { LayoutDashboard, CalendarRange, BarChart3, User, LogOut } from 'lucide-react';

export default function App() {
  const { token, user, login, register, logout, fetchProfile } = useAuthStore();
  const { fetchLists, fetchTasks } = useTaskStore();
  const { fetchHabits, fetchLogs, fetchSnapshots } = useHabitStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [authError, setAuthError] = useState('');

  // Fetch initial profile when component mounts
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  // Fetch user data when authenticated
  useEffect(() => {
    if (token) {
      fetchLists();
      fetchTasks();
      fetchHabits();
      fetchLogs();
      fetchSnapshots();
    }
  }, [token]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const success = await login(username, password);
      if (!success) {
        setAuthError('Invalid username or password. Please try again.');
      }
    } else {
      const success = await register(username, password, email, timezone);
      if (success) {
        // Automatically switch and log in
        const loggedIn = await login(username, password);
        if (!loggedIn) {
          setAuthError('Account created but login failed. Please login manually.');
          setAuthMode('login');
        }
      } else {
        setAuthError(useAuthStore.getState().error || 'Registration failed');
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#06070c]">
        {/* Decorative Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-neonBlue/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7000ff]/10 blur-3xl pointer-events-none"></div>

        <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 border border-white/10 shadow-glass">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neonBlue to-[#8a2be2] bg-clip-text text-transparent">
              Dimensional Todo
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              A premium 3D task and habit manager
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timezone</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neonBlue/50 transition-colors"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="US/Eastern">US/Eastern</option>
                  <option value="US/Pacific">US/Pacific</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
            )}

            {authError && (
              <div className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2.5 px-3 rounded-lg border border-red-500/20">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neonBlue to-[#4facfe] text-[#06070c] hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_0_rgba(0,242,254,0.3)]"
            >
              {authMode === 'login' ? 'Access App' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              className="text-gray-400 hover:text-white text-xs font-medium transition-colors"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
            >
              {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#06070c] text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel border-r border-t-0 border-l-0 border-b-0 border-white/5 flex flex-col justify-between p-6 md:sticky md:top-0 md:h-screen z-20">
        <div>
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-2xl font-black bg-gradient-to-r from-neonBlue to-neonPurple bg-clip-text text-transparent tracking-tight">
              Dimensional
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
              3D Personal Workspace
            </p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-neonBlue/10 to-transparent border-l-2 border-neonBlue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('habits')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'habits'
                  ? 'bg-gradient-to-r from-neonBlue/10 to-transparent border-l-2 border-neonBlue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <CalendarRange size={18} />
              <span>Habits</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'performance'
                  ? 'bg-gradient-to-r from-neonBlue/10 to-transparent border-l-2 border-neonBlue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <BarChart3 size={18} />
              <span>Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-neonBlue/10 to-transparent border-l-2 border-neonBlue text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <User size={18} />
              <span>Profile Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-white truncate">{user?.username}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || 'No Email'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'habits' && <Habits />}
        {activeTab === 'performance' && <Performance />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}
