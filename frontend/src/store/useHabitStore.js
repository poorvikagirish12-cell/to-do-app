import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  snapshots: [],
  loading: false,

  fetchHabits: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/habits/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      set({ habits: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createHabit: async (habitData) => {
    try {
      const response = await fetch(`${API_BASE}/habits/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(habitData),
      });
      if (!response.ok) throw new Error('Failed to create habit');
      const newHabit = await response.json();
      set({ habits: [newHabit, ...get().habits] });
      return newHabit;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  updateHabit: async (habitId, habitData) => {
    try {
      const response = await fetch(`${API_BASE}/habits/${habitId}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(habitData),
      });
      if (!response.ok) throw new Error('Failed to update habit');
      const updatedHabit = await response.json();
      set({ habits: get().habits.map(h => h.id === habitId ? updatedHabit : h) });
      return updatedHabit;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  deleteHabit: async (habitId) => {
    try {
      const response = await fetch(`${API_BASE}/habits/${habitId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete habit');
      set({ habits: get().habits.filter(h => h.id !== habitId) });
      // Clear associated logs locally
      set({ logs: get().logs.filter(l => l.habit !== habitId) });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchLogs: async () => {
    try {
      const response = await fetch(`${API_BASE}/habit-logs/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch habit logs');
      const data = await response.json();
      set({ logs: data });
    } catch (err) {
      console.error(err);
    }
  },

  logHabit: async (habitId, date, status) => {
    const existingLog = get().logs.find(l => l.habit === habitId && l.date === date);
    if (existingLog) {
      if (existingLog.status === status) {
        // Toggle off: if clicked status matches current status, delete it
        return get().deleteLog(existingLog.id);
      } else {
        // Change status: update from DONE to MISSED or vice versa
        try {
          const response = await fetch(`${API_BASE}/habit-logs/${existingLog.id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
          });
          if (!response.ok) throw new Error('Failed to update log');
          const updatedLog = await response.json();
          set({ logs: get().logs.map(l => l.id === existingLog.id ? updatedLog : l) });
          await get().fetchSnapshots();
          return updatedLog;
        } catch (err) {
          console.error(err);
          return null;
        }
      }
    } else {
      // Log new entry
      try {
        const response = await fetch(`${API_BASE}/habit-logs/`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ habit: habitId, date, status }),
        });
        if (!response.ok) throw new Error('Failed to create log');
        const newLog = await response.json();
        set({ logs: [newLog, ...get().logs] });
        await get().fetchSnapshots();
        return newLog;
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  },

  deleteLog: async (logId) => {
    try {
      const logToDelete = get().logs.find(l => l.id === logId);
      const response = await fetch(`${API_BASE}/habit-logs/${logId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete log');
      set({ logs: get().logs.filter(l => l.id !== logId) });
      if (logToDelete) {
        await get().fetchSnapshots();
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchSnapshots: async () => {
    try {
      const response = await fetch(`${API_BASE}/snapshots/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch snapshots');
      const data = await response.json();
      set({ snapshots: data });
    } catch (err) {
      console.error(err);
    }
  },
}));
