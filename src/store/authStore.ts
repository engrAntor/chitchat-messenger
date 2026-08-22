import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setAuth: (rawUser, token) => {
        const user = rawUser
          ? {
              ...rawUser,
              _id: rawUser._id || (rawUser as any).id,
            }
          : null;
        // Also keep in localStorage for Axios interceptor (server-side read)
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_token', token);
          localStorage.setItem('chat_user', JSON.stringify(user));
        }
        set({ user, token });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('chat_token');
          localStorage.removeItem('chat_user');
        }
        set({ user: null, token: null });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'chat_auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
