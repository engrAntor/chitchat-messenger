'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setAuth, clearAuth, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) return;

    // Validate existing token by calling /auth/me
    const validate = async () => {
      try {
        const user = await authApi.me();
        setAuth(user, token);
        // Set cookie for middleware
        document.cookie = `chat_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      } catch {
        clearAuth();
        document.cookie = 'chat_token=; path=/; max-age=0';
        router.replace('/login');
      }
    };

    validate();

    return () => {
      // Don't disconnect on unmount — SocketProvider manages lifecycle
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, token]);

  return <>{children}</>;
}
