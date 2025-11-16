import axios from 'axios';
import { create } from 'zustand';

import { setHttpClientSessionCookie } from '@/lib/http-client';
import { secureStorage } from '@/lib/secure-storage';
import { authService, type LoginCredentials } from '@/services/auth-service';
import type { SessionResponse, User } from '@/types/api';

const SESSION_COOKIE_STORAGE_KEY = 'memos.session.cookie';

type SessionStatus = 'idle' | 'checking' | 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: SessionStatus;
  user: User | null;
  sessionCookie: string | null;
  error: string | null;
  hasBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setSessionFromResponse: (payload: { session: SessionResponse; cookie: string | null }) => Promise<void>;
}

async function persistSessionCookie(cookie: string | null) {
  if (cookie) {
    await secureStorage.setItem(SESSION_COOKIE_STORAGE_KEY, cookie);
    setHttpClientSessionCookie(cookie);
  } else {
    await secureStorage.deleteItem(SESSION_COOKIE_STORAGE_KEY);
    setHttpClientSessionCookie(null);
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
  sessionCookie: null,
  error: null,
  hasBootstrapped: false,

  setSessionFromResponse: async ({ session, cookie }) => {
    await persistSessionCookie(cookie);
    set({
      user: session.user ?? null,
      sessionCookie: cookie,
      status: session.user ? 'authenticated' : 'unauthenticated',
      error: null,
      hasBootstrapped: true,
    });
  },

  bootstrap: async () => {
    if (get().hasBootstrapped) {
      return;
    }

    set({ status: 'checking', error: null });

    const storedCookie = await secureStorage.getItem(SESSION_COOKIE_STORAGE_KEY);
    if (!storedCookie) {
      await persistSessionCookie(null);
      set({ status: 'unauthenticated', hasBootstrapped: true });
      return;
    }

    setHttpClientSessionCookie(storedCookie);

    try {
      const session = await authService.currentSession();
      await get().setSessionFromResponse({ session, cookie: storedCookie });
    } catch (error) {
      await persistSessionCookie(null);
      set({
        user: null,
        sessionCookie: null,
        status: 'unauthenticated',
        error: readAxiosError(error),
        hasBootstrapped: true,
      });
    }
  },

  login: async (credentials) => {
    set({ status: 'loading', error: null });
    try {
      const result = await authService.login(credentials);
      if (!result.session.user) {
        throw new Error('No user returned from the server.');
      }
      await get().setSessionFromResponse(result);
    } catch (error) {
      await persistSessionCookie(null);
      set({ status: 'unauthenticated', error: readAxiosError(error) });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      await persistSessionCookie(null);
      set({ user: null, sessionCookie: null, status: 'unauthenticated', error: null });
    }
  },
}));
