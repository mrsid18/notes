import httpClient from '@/lib/http-client';
import type {
  ListMemosRequest,
  ListMemosResponse,
  Memo,
  MemoState,
  MemoVisibility,
} from '@/types/api';

type CreateMemoPayload = {
  content: string;
  visibility?: MemoVisibility;
  state?: MemoState;
  pinned?: boolean;
  displayTime?: string;
  memoId?: string;
  name?: string;
};

type UpdateMemoPayload = Partial<Pick<Memo, 'content' | 'visibility' | 'state' | 'pinned' | 'displayTime'>>;

const DEFAULT_VISIBILITY: MemoVisibility = 'PRIVATE';
const DEFAULT_STATE: MemoState = 'NORMAL';

/**
 * Memo service for CRUD operations.
 *
 * API format based on proto/api/v1/memo_service.proto:
 * - CreateMemo expects the Memo resource in the request body (no envelope)
 * - UpdateMemo expects a Memo resource body plus an `updateMask` query param
 * - DeleteMemo expects the memo name in the URL path (optional `force` query)
 */
export const memoService = {
  /**
   * List all memos with optional filters
   */
  async list(params: ListMemosRequest = {}): Promise<ListMemosResponse> {
    const response = await httpClient.get<ListMemosResponse>('/api/v1/memos', {
      params,
    });
    return response.data;
  },

  /**
   * Get a single memo by name
   * @param name - Memo resource name (e.g., "memos/123")
   */
  async get(name: string): Promise<Memo> {
    const response = await httpClient.get<Memo>(`/api/v1/${name}`);
    return response.data;
  },

  /**
   * Create a new memo
   */
  async create(payload: CreateMemoPayload): Promise<Memo> {
    if (!payload.content?.trim()) {
      throw new Error('Memo content is required');
    }

    const { memoId, ...memoFields } = payload;
    const requestBody: Partial<Memo> = {
      name: memoFields.name,
      content: memoFields.content,
      visibility: memoFields.visibility ?? DEFAULT_VISIBILITY,
      state: memoFields.state ?? DEFAULT_STATE,
      pinned: memoFields.pinned,
      displayTime: memoFields.displayTime,
    };

    const response = await httpClient.post<Memo>('/api/v1/memos', requestBody, {
      params: memoId ? { memoId } : undefined,
    });
    return response.data;
  },

  /**
   * Update an existing memo
   * @param name - Memo resource name (e.g., "memos/123")
   * @param updates - Fields to update
   */
  async update(name: string, updates: UpdateMemoPayload): Promise<Memo> {
    const paths: string[] = [];
    const memo: Partial<Memo> & { name: string } = { name };

    if (updates.content !== undefined) {
      paths.push('content');
      memo.content = updates.content;
    }
    if (updates.visibility !== undefined) {
      paths.push('visibility');
      memo.visibility = updates.visibility;
    }
    if (updates.state !== undefined) {
      paths.push('state');
      memo.state = updates.state;
    }
    if (updates.pinned !== undefined) {
      paths.push('pinned');
      memo.pinned = updates.pinned;
    }
    if (updates.displayTime !== undefined) {
      paths.push('display_time');
      memo.displayTime = updates.displayTime;
    }

    if (paths.length === 0) {
      throw new Error('No updates provided');
    }

    const response = await httpClient.patch<Memo>(`/api/v1/${name}`, memo, {
      params: {
        updateMask: paths.join(','),
      },
    });
    return response.data;
  },

  /**
   * Delete a memo
   * @param name - Memo resource name (e.g., "memos/123")
   */
  async remove(name: string, options?: { force?: boolean }): Promise<void> {
    await httpClient.delete(`/api/v1/${name}`, {
      params: options?.force !== undefined ? { force: options.force } : undefined,
    });
  },
};
