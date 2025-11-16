import axios from 'axios';

import { env } from '@/lib/env';
import { buildCookieHeader } from '@/lib/session-cookie';

const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let sessionCookieRef: string | null = null;

httpClient.interceptors.request.use((config) => {
  const cookieHeader = buildCookieHeader(sessionCookieRef);
  if (cookieHeader) {
    config.headers = config.headers ?? {};
    config.headers.Cookie = cookieHeader;
  } else if (config.headers && 'Cookie' in config.headers) {
    delete config.headers.Cookie;
  }

  return config;
});

export const setHttpClientSessionCookie = (cookie: string | null) => {
  sessionCookieRef = cookie;
};

export default httpClient;
