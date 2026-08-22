import { api } from '@/lib/api';
import {
  AuthResponse,
  LoginRequest,
  User,
  Conversation,
  Message,
  MessagesResponse,
  SearchResult,
  StartConversationRequest,
  SendMessageRequest,
  CreateGroupRequest,
  AddParticipantsRequest,
  PromoteRequest,
  RenameGroupRequest,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<any>('/auth/login', data);
    const token = res.data?.token ?? res.data?.data?.token ?? res.data?.jwt ?? '';
    const rawUser = res.data?.user ?? res.data?.data?.user ?? (res.data?.data?._id ? res.data.data : res.data);
    const user: User = rawUser?.user ? rawUser.user : rawUser;
    return { token, user };
  },
  me: async (): Promise<User> => {
    const res = await api.get<any>('/auth/me');
    if (res.data?.user) return res.data.user;
    if (res.data?.data?.user) return res.data.data.user;
    if (res.data?.data && res.data.data._id) return res.data.data;
    return res.data;
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  search: async (q: string): Promise<SearchResult[]> => {
    const res = await api.get<any>('/users/search', { params: { q } });
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.users)) return res.data.users;
    return [];
  },
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsApi = {
  list: async (): Promise<Conversation[]> => {
    const res = await api.get<any>('/conversations');
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.conversations)) return res.data.conversations;
    return [];
  },

  startDirect: async (data: StartConversationRequest): Promise<Conversation> => {
    const res = await api.post<any>('/conversations', data);
    return res.data?.conversation ?? res.data?.data ?? res.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<Conversation> => {
    const res = await api.post<any>('/conversations/group', data);
    return res.data?.conversation ?? res.data?.data ?? res.data;
  },

  getMessages: async (
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<MessagesResponse> => {
    const params: Record<string, string | number> = { limit };
    if (before) params.before = before;
    const res = await api.get<any>(`/conversations/${conversationId}/messages`, {
      params,
    });
    if (Array.isArray(res.data)) {
      return { messages: res.data, hasMore: false };
    }
    if (res.data && Array.isArray(res.data.messages)) {
      return { messages: res.data.messages, hasMore: Boolean(res.data.hasMore), nextCursor: res.data.nextCursor };
    }
    if (res.data && Array.isArray(res.data.data)) {
      return { messages: res.data.data, hasMore: Boolean(res.data.hasMore), nextCursor: res.data.nextCursor };
    }
    return { messages: [], hasMore: false };
  },

  addParticipants: async (groupId: string, data: AddParticipantsRequest): Promise<Conversation> => {
    const res = await api.post<Conversation>(`/conversations/${groupId}/participants`, data);
    return res.data;
  },

  removeParticipant: async (groupId: string, userId: string): Promise<void> => {
    await api.delete(`/conversations/${groupId}/participants/${userId}`);
  },

  promoteAdmin: async (groupId: string, data: PromoteRequest): Promise<Conversation> => {
    const res = await api.post<Conversation>(`/conversations/${groupId}/admins`, data);
    return res.data;
  },

  rename: async (groupId: string, data: RenameGroupRequest): Promise<Conversation> => {
    const res = await api.patch<Conversation>(`/conversations/${groupId}`, data);
    return res.data;
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesApi = {
  send: async (data: SendMessageRequest): Promise<Message> => {
    const res = await api.post<Message>('/messages', data);
    return res.data;
  },
};
