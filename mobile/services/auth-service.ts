import httpClient from '@/lib/http-client';
import type { User } from '@/types/api';

/**
 * Auth service for JWT token-based authentication.
 *
 * Since the Memos API doesn't have a dedicated "get current user" endpoint,
 * we validate tokens by making authenticated API calls (like listing memos).
 * If the call succeeds, the token is valid.
 */
export const authService = {
  /**
   * Validates the access token by making a minimal authenticated API call.
   *
   * We use the memos list endpoint because:
   * 1. It requires authentication (will fail with 401 if token is invalid)
   * 2. We can limit it to pageSize=1 to minimize data transfer
   * 3. It's available to all authenticated users
   *
   * Returns a minimal User object. We can't get full user details without
   * a dedicated user endpoint, but we return enough to indicate authentication worked.
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Make a minimal authenticated request
      await httpClient.get('/api/v1/memos', {
        params: {
          pageSize: 1,
        },
      });

      // If we got here without error, token is valid
      // Return a minimal user object
      // (we don't have a way to get actual user details via REST API)
      return {
        name: 'users/current',
        username: 'authenticated',
      };
    } catch (error) {
      // Token is invalid or expired
      throw error;
    }
  },

  /**
   * Validates if the current token is still valid.
   * Returns true if valid, false otherwise.
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};
