import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      set({ token: data.access });

      // Fetch user profile info
      await get().fetchProfile();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  register: async (username, password, email = '', timezone = 'UTC') => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, timezone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(Object.values(data).flat().join(', ') || 'Registration failed');
      }

      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, error: null });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        get().logout();
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch profile');

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      console.error(err);
    }
  },

  updateProfile: async (profileData) => {
    const { token } = get();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
}));
