import httpClient from '@/lib/http-client';
import { extractSessionCookie } from '@/lib/session-cookie';
import { SessionResponse } from '@/types/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  session: SessionResponse;
  cookie: string | null;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const response = await httpClient.post<SessionResponse>('/api/v1/auth/sessions', {
      passwordCredentials: credentials,
    });

    const cookie = extractSessionCookie(response.headers['set-cookie'] ?? null);
    return { session: response.data, cookie };
  },

  async currentSession(): Promise<SessionResponse> {
    const response = await httpClient.get<SessionResponse>('/api/v1/auth/sessions/current');
    return response.data;
  },

  async logout(): Promise<void> {
    await httpClient.delete('/api/v1/auth/sessions/current');
  },
};
