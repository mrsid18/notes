import httpClient from '@/lib/http-client';
import {
  CreateMemoRequest,
  DeleteMemoRequest,
  ListMemosRequest,
  ListMemosResponse,
  Memo,
  UpdateMemoRequest,
} from '@/types/api';

export const memoService = {
  async list(params: ListMemosRequest = {}): Promise<ListMemosResponse> {
    const response = await httpClient.get<ListMemosResponse>('/api/v1/memos', {
      params,
    });
    return response.data;
  },

  async get(name: string): Promise<Memo> {
    const response = await httpClient.get<Memo>(`/api/v1/${name}`);
    return response.data;
  },

  async create(payload: CreateMemoRequest): Promise<Memo> {
    const response = await httpClient.post<Memo>('/api/v1/memos', payload);
    return response.data;
  },

  async update(payload: UpdateMemoRequest): Promise<Memo> {
    const response = await httpClient.patch<Memo>(`/api/v1/${payload.memo.name}`, payload);
    return response.data;
  },

  async remove(payload: DeleteMemoRequest): Promise<void> {
    await httpClient.delete(`/api/v1/${payload.name}`, {
      params: payload.force ? { force: payload.force } : undefined,
    });
  },
};
