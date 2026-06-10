import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { useTaskStore } from '../store/useTaskStore';
import { Check, X, Calendar, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function Habits() {
  const { habits, logs, createHabit, deleteHabit, logHabit } = useHabitStore();
  const { lists } = useTaskStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listId, setListId] = useState('');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]); // All days by default
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate last 7 days of dates for logging
  const getLast7Days = () => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        pythonWeekday: d.getDay() === 0 ? 6 : d.getDay() - 1, // Convert JS Day (0=Sun) to Python (0=Mon, 6=Sun)
      });
    }
    return arr;
  };

  const daysList = getLast7Days();

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      title,
      description,
      frequency: selectedDays,
      start_date: startDate,
      list: listId ? parseInt(listId) : null,
    };

    const newHabit = await createHabit(payload);
    if (newHabit) {
      setTitle('');
      setDescription('');
      setListId('');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setShowAddForm(false);
    }
  };

  const toggleDaySelection = (dayIdx) => {
    if (selectedDays.includes(dayIdx)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIdx));
    } else {
      setSelectedDays([...selectedDays, dayIdx]);
    }
  };

  const getLogStatus = (habitId, dateStr) => {
    const log = logs.find(l => l.habit === habitId && l.date === dateStr);
    return log ? log.status : null;
  };

  const handleToggleLog = async (habitId, dateStr, currentStatus) => {
    // If not logged: set to DONE
    // If DONE: set to MISSED
    // If MISSED: toggle off (will delete the log)
    let nextStatus = 'DONE';
    if (currentStatus === 'DONE') {
      nextStatus = 'MISSED';
    } else if (currentStatus === 'MISSED') {
      nextStatus = 'MISSED'; // Trigger toggle off
    }
    await logHabit(habitId, dateStr, nextStatus);
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Habits Tracker</h2>
          <p className="text-gray-400 text-sm mt-1">Define long-term routines and log your daily performance.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-neonBlue text-[#06070c] font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_4px_15px_0_rgba(0,242,254,0.25)]"
        >
          <Plus size={16} />
          <span>New Routine</span>
        </button>
      </div>

      {/* Inline Form Modal */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 max-w-xl animate-fadeIn">
          <h3 className="text-lg font-bold mb-4">Create New Habit</h3>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Habit Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors"
                placeholder="e.g. Read Books, Go Gym"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neonBlue/50 transition-colors h-20"
                placeholder="Why is this routine important?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Workspace List</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neonBlue/50 transition-colors"
                  value={listId}
                  onChange={e => setListId(e.target.value)}
                >
                  <option value="">None (Personal)</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Schedule Weekly Frequency</label>
              <div className="flex justify-between max-w-sm">
                {weekdays.map((day, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDaySelection(idx)}
                      className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-neonBlue text-[#06070c] shadow-[0_0_10px_0_rgba(0,242,254,0.3)]' 
                          : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neonBlue to-[#4facfe] text-[#06070c] font-bold text-xs hover:brightness-105 active:scale-95 transition-all"
              >
                Create Habit
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits Tracker Grid */}
      <div className="space-y-4">
        {habits.length > 0 ? (
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 select-none">
                    <th className="py-4 px-6 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Habit Routine</th>
                    <th className="py-4 px-4 text-center text-[10px] font-extrabold text-gray-500 uppercase tracking-widest w-48">Target Schedule</th>
                    <th className="py-4 px-4 text-center text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Weekly Logs</th>
                    <th className="py-4 px-6 text-center text-[10px] font-extrabold text-gray-500 uppercase tracking-widest w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {habits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-white/1 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {habit.list_details && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: habit.list_details.color }} 
                            />
                          )}
                          <div>
                            <h4 className="font-bold text-white text-sm">{habit.title}</h4>
                            {habit.description && (
                              <p className="text-xs text-gray-400 truncate max-w-xs">{habit.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex justify-center space-x-1">
                          {weekdays.map((day, idx) => {
                            const isScheduled = habit.frequency.includes(idx);
                            return (
                              <span
                                key={idx}
                                className={`text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center select-none ${
                                  isScheduled 
                                    ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20' 
                                    : 'bg-white/2 text-gray-600'
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex justify-center items-center space-x-3">
                          {daysList.map((day) => {
                            const status = getLogStatus(habit.id, day.dateStr);
                            const isScheduled = habit.frequency.includes(day.pythonWeekday);
                            
                            let bgClass = 'bg-white/5 border border-white/5 text-transparent';
                            if (status === 'DONE') {
                              bgClass = 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_0_rgba(34,197,94,0.15)]';
                            } else if (status === 'MISSED') {
                              bgClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
                            } else if (!isScheduled) {
                              bgClass = 'bg-transparent border border-dashed border-white/5 text-transparent opacity-30 cursor-not-allowed';
                            }

                            return (
                              <button
                                key={day.dateStr}
                                disabled={!isScheduled}
                                onClick={() => handleToggleLog(habit.id, day.dateStr, status)}
                                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all active:scale-90 ${bgClass}`}
                              >
                                <span className="text-[7px] uppercase tracking-wider font-extrabold opacity-60 select-none">
                                  {day.dayName}
                                </span>
                                <span className="text-xs font-bold font-mono">
                                  {status === 'DONE' ? <Check size={10} className="stroke-[3px]" /> : status === 'MISSED' ? <X size={10} className="stroke-[3px]" /> : day.dayNum}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete Habit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel py-16 px-6 text-center text-gray-500 space-y-3 rounded-3xl border border-white/5">
            <Calendar size={48} className="mx-auto text-gray-600" />
            <div>
              <p className="font-bold text-gray-400">No routines defined</p>
              <p className="text-xs max-w-md mx-auto mt-1 leading-relaxed">
                Start forming positive habits by clicking the "New Routine" button to define your weekly schedule and track daily progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
