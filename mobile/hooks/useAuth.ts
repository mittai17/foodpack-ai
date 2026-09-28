/**
 * useAuth — Mock authentication for demo/hackathon mode.
 * No real API calls; user is always "authenticated" as a demo user.
 * The real auth flow (login/register screens) is removed from routing.
 */
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  user: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<boolean>;
  register: (email?: string, password?: string, name?: string) => Promise<boolean>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

const MOCK_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'demo@foodpackai.com',
  name: 'Demo User',
  role: 'USER',
};

export const useAuthStore = create<AuthState>(() => ({
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  login: async () => true,
  register: async () => true,
  logout: () => {},
  loadProfile: async () => {},
}));
