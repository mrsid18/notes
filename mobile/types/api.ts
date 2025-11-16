export type MemoVisibility = 'VISIBILITY_UNSPECIFIED' | 'PRIVATE' | 'PROTECTED' | 'PUBLIC';

export type MemoState = 'STATE_UNSPECIFIED' | 'NORMAL' | 'ARCHIVED';

export interface User {
  name: string;
  username: string;
  nickname?: string;
  email?: string;
  avatarUrl?: string;
}

export interface SessionResponse {
  user: User | null;
  lastAccessedAt?: string;
}

export interface Memo {
  name: string;
  state: MemoState;
  creator?: string;
  createTime?: string;
  updateTime?: string;
  displayTime?: string;
  content: string;
  visibility: MemoVisibility;
  tags?: string[];
  pinned?: boolean;
  snippet?: string;
}

export interface ListMemosRequest {
  pageSize?: number;
  pageToken?: string;
  filter?: string;
  orderBy?: string;
  state?: MemoState;
  showDeleted?: boolean;
}

export interface ListMemosResponse {
  memos: Memo[];
  nextPageToken?: string;
}

export interface CreateMemoRequest {
  memo: Pick<Memo, 'content' | 'visibility' | 'state' | 'pinned' | 'displayTime'> & { name?: string };
  memoId?: string;
}

export interface UpdateMemoRequest {
  memo: Partial<Memo> & { name: string };
  updateMask: string[];
}

export interface DeleteMemoRequest {
  name: string;
  force?: boolean;
}
