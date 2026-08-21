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
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  search: async (q: string): Promise<SearchResult[]> => {
    const res = await api.get<SearchResult[]>('/users/search', { params: { q } });
    return res.data;
  },
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsApi = {
  list: async (): Promise<Conversation[]> => {
    const res = await api.get<Conversation[]>('/conversations');
    return res.data;
  },

  startDirect: async (data: StartConversationRequest): Promise<Conversation> => {
    const res = await api.post<Conversation>('/conversations', data);
    return res.data;
  },

  createGroup: async (data: CreateGroupRequest): Promise<Conversation> => {
    const res = await api.post<Conversation>('/conversations/group', data);
    return res.data;
  },

  getMessages: async (
    conversationId: string,
    limit = 30,
    before?: string
  ): Promise<MessagesResponse> => {
    const params: Record<string, string | number> = { limit };
    if (before) params.before = before;
    const res = await api.get<MessagesResponse>(`/conversations/${conversationId}/messages`, {
      params,
    });
    return res.data;
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
