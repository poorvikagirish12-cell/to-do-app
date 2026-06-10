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

export const useTaskStore = create((set, get) => ({
  tasks: [],
  lists: [],
  loading: false,

  fetchLists: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/lists/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch lists');
      const data = await response.json();
      set({ lists: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createList: async (name, color, icon) => {
    try {
      const response = await fetch(`${API_BASE}/lists/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, color, icon }),
      });
      if (!response.ok) throw new Error('Failed to create list');
      const newList = await response.json();
      set({ lists: [newList, ...get().lists] });
      return newList;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  deleteList: async (listId) => {
    try {
      const response = await fetch(`${API_BASE}/lists/${listId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete list');
      set({ lists: get().lists.filter(l => l.id !== listId) });
      // Also filter tasks associated with this deleted list
      set({ tasks: get().tasks.map(t => t.list === listId ? { ...t, list: null, list_details: null } : t) });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/tasks/`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      set({ tasks: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const newTask = await response.json();
      set({ tasks: [newTask, ...get().tasks] });
      return newTask;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      set({ tasks: get().tasks.map(t => t.id === taskId ? updatedTask : t) });
      return updatedTask;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete task');
      set({ tasks: get().tasks.filter(t => t.id !== taskId) });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  completeTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/complete/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to complete task');
      const updatedTask = await response.json();
      set({ tasks: get().tasks.map(t => t.id === taskId ? updatedTask : t) });
      return updatedTask;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  uncompleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/uncomplete/`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to uncomplete task');
      const updatedTask = await response.json();
      set({ tasks: get().tasks.map(t => t.id === taskId ? updatedTask : t) });
      return updatedTask;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
}));
