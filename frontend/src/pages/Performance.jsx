import React, { useEffect } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle2, AlertTriangle, Activity, Award } from 'lucide-react';

export default function Performance() {
  const { snapshots, fetchSnapshots } = useHabitStore();

  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Calculate high-level aggregate metrics
  const totalDays = snapshots.length;
  const avgCompletionRate = totalDays > 0 
    ? Math.round(snapshots.reduce((acc, s) => acc + s.completion_rate, 0) / totalDays) 
    : 0;

  const totalTasksCompleted = snapshots.reduce((acc, s) => acc + s.tasks_completed, 0);
  const totalTasksFailed = snapshots.reduce((acc, s) => acc + s.tasks_failed, 0);
  const totalHabitsCompleted = snapshots.reduce((acc, s) => acc + s.habits_completed, 0);

  // Formatting snapshot data for chart
  const chartData = snapshots.map(s => ({
    ...s,
    // Shorten YYYY-MM-DD to MM-DD
    shortDate: s.date ? s.date.slice(5) : '',
    rate: s.completion_rate,
  }));

  // Glassmorphic Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-glass text-xs space-y-2">
          <p className="font-bold text-gray-300">{data.date}</p>
          <div className="space-y-1 text-gray-400">
            <p className="flex justify-between items-center space-x-4">
              <span>Completion Rate:</span>
              <span className="font-mono text-neonBlue font-semibold">{data.rate}%</span>
            </p>
            <p className="flex justify-between items-center space-x-4">
              <span>Tasks Done / Missed:</span>
              <span className="font-mono text-white">{data.tasks_completed} / {data.tasks_failed}</span>
            </p>
            <p className="flex justify-between items-center space-x-4">
              <span>Habits Done / Missed:</span>
              <span className="font-mono text-white">{data.habits_completed} / {data.habits_failed}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Performance Analytics</h2>
        <p className="text-gray-400 text-sm mt-1">Review your historical task completion rates and habit logs.</p>
      </div>

      {/* Aggregate Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-neonBlue/10 text-neonBlue">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Avg Completion</p>
            <h4 className="text-2xl font-black text-white font-mono mt-0.5">{avgCompletionRate}%</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Tasks Completed</p>
            <h4 className="text-2xl font-black text-white font-mono mt-0.5">{totalTasksCompleted}</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-yellow-500/10 text-yellow-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Tasks Overdue</p>
            <h4 className="text-2xl font-black text-white font-mono mt-0.5">{totalTasksFailed}</h4>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Habits Kept</p>
            <h4 className="text-2xl font-black text-white font-mono mt-0.5">{totalHabitsCompleted}</h4>
          </div>
        </div>
      </div>

      {/* Main Performance Graph */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Activity size={16} className="text-neonBlue" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Progression Curve</h3>
          </div>
          <span className="text-[10px] bg-neonBlue/10 text-neonBlue px-2.5 py-1 rounded-full font-bold">
            Last {totalDays} active day{totalDays !== 1 ? 's' : ''}
          </span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4facfe" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
                <XAxis 
                  dataKey="shortDate" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#00f2fe" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col justify-center items-center text-center text-gray-500 space-y-2 border border-white/5 border-dashed rounded-2xl">
            <Activity size={48} className="text-gray-600 animate-pulse" />
            <div>
              <p className="font-bold text-gray-400">No logs found</p>
              <p className="text-xs max-w-sm mt-1 leading-relaxed">
                Log a habit check-in or complete a scheduled todo task to see your interactive analytics chart here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
