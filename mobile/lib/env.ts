const defaultApiUrl = 'http://localhost:8081';

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_MEMOS_API_URL || defaultApiUrl,
  isDev: process.env.NODE_ENV !== 'production',
};

export type Env = typeof env;
