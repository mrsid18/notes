import axios from 'axios';

import { env } from '@/lib/env';

const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let accessTokenRef: string | null = null;

httpClient.interceptors.request.use((config) => {
  if (accessTokenRef) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessTokenRef}`;
  } else if (config.headers && 'Authorization' in config.headers) {
    delete config.headers.Authorization;
  }

  return config;
});

export const setHttpClientAccessToken = (token: string | null) => {
  accessTokenRef = token;
};

export default httpClient;
