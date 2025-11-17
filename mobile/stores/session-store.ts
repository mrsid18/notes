import axios from 'axios';
import { create } from 'zustand';

import { setHttpClientAccessToken } from '@/lib/http-client';
import { secureStorage } from '@/lib/secure-storage';
import { authService } from '@/services/auth-service';
import type { User } from '@/types/api';

const ACCESS_TOKEN_STORAGE_KEY = 'memos.access.token';

type SessionStatus = 'idle' | 'checking' | 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: SessionStatus;
  user: User | null;
  accessToken: string | null;
  error: string | null;
  hasBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  setAccessToken: (token: string) => Promise<void>;
  clearAccessToken: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

async function persistAccessToken(token: string | null) {
  if (token) {
    await secureStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    setHttpClientAccessToken(token);
  } else {
    await secureStorage.deleteItem(ACCESS_TOKEN_STORAGE_KEY);
    setHttpClientAccessToken(null);
  }
}

function readAxiosError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const details =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ??
      (error.response?.data as { details?: string } | undefined)?.details;
    return details || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred.';
}

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  user: null,
  accessToken: null,
  error: null,
  hasBootstrapped: false,

  bootstrap: async () => {
    if (get().hasBootstrapped) {
      return;
    }

    set({ status: 'checking', error: null });

    const storedToken = await secureStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!storedToken) {
      await persistAccessToken(null);
      set({ status: 'unauthenticated', hasBootstrapped: true });
      return;
    }

    setHttpClientAccessToken(storedToken);

    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        accessToken: storedToken,
        status: 'authenticated',
        error: null,
        hasBootstrapped: true,
      });
    } catch (error) {
      await persistAccessToken(null);
      set({
        user: null,
        accessToken: null,
        status: 'unauthenticated',
        error: readAxiosError(error),
        hasBootstrapped: true,
      });
    }
  },

  setAccessToken: async (token: string) => {
    set({ status: 'loading', error: null });
    try {
      setHttpClientAccessToken(token);
      const user = await authService.getCurrentUser();

      if (!user) {
        throw new Error('Invalid token: No user returned from server');
      }

      await persistAccessToken(token);
      set({
        user,
        accessToken: token,
        status: 'authenticated',
        error: null,
        hasBootstrapped: true,
      });
    } catch (error) {
      await persistAccessToken(null);
      set({
        status: 'unauthenticated',
        error: readAxiosError(error),
        user: null,
        accessToken: null,
      });
      throw error;
    }
  },

  clearAccessToken: async () => {
    await persistAccessToken(null);
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null
    });
  },

  validateToken: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({ user, error: null });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: readAxiosError(error) });
      return false;
    }
  },
}));
