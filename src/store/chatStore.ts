import { create } from 'zustand';
import { Conversation, Message } from '@/types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  conversationsStatus: 'idle' | 'loading' | 'error';

  // Messages per conversation
  messages: Record<string, Message[]>;
  messagesStatus: Record<string, 'idle' | 'loading' | 'error'>;
  hasMore: Record<string, boolean>;
  oldestCursor: Record<string, string | undefined>;

  // Unread counts
  unreadCounts: Record<string, number>;

  // Actions
  setConversations: (convos: Conversation[]) => void;
  setConversationsStatus: (status: 'idle' | 'loading' | 'error') => void;
  upsertConversation: (convo: Conversation) => void;
  setActiveConversation: (id: string | null) => void;

  setMessages: (conversationId: string, messages: Message[], hasMore: boolean, cursor?: string) => void;
  prependMessages: (conversationId: string, messages: Message[], hasMore: boolean, cursor?: string) => void;
  appendMessage: (conversationId: string, message: Message) => void;
  replaceOptimisticMessage: (conversationId: string, tempId: string, realMessage: Message) => void;
  markMessageFailed: (conversationId: string, tempId: string) => void;
  setMessagesStatus: (conversationId: string, status: 'idle' | 'loading' | 'error') => void;

  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  conversationsStatus: 'idle',

  messages: {},
  messagesStatus: {},
  hasMore: {},
  oldestCursor: {},

  unreadCounts: {},

  setConversations: (convos) =>
    set({
      conversations: convos.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    }),

  setConversationsStatus: (status) => set({ conversationsStatus: status }),

  upsertConversation: (convo) => {
    const existing = get().conversations;
    const idx = existing.findIndex((c) => c._id === convo._id);
    if (idx === -1) {
      set({ conversations: [convo, ...existing] });
    } else {
      const updated = [...existing];
      updated[idx] = convo;
      set({
        conversations: updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      });
    }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages, hasMore, cursor) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
      hasMore: { ...state.hasMore, [conversationId]: hasMore },
      oldestCursor: { ...state.oldestCursor, [conversationId]: cursor },
    })),

  prependMessages: (conversationId, newMessages, hasMore, cursor) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      return {
        messages: { ...state.messages, [conversationId]: [...newMessages, ...existing] },
        hasMore: { ...state.hasMore, [conversationId]: hasMore },
        oldestCursor: { ...state.oldestCursor, [conversationId]: cursor },
      };
    }),

  appendMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      // Avoid duplicates
      if (existing.some((m) => m._id === message._id)) return {};
      return {
        messages: { ...state.messages, [conversationId]: [...existing, message] },
      };
    }),

  replaceOptimisticMessage: (conversationId, tempId, realMessage) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: existing.map((m) => (m._id === tempId ? realMessage : m)),
        },
      };
    }),

  markMessageFailed: (conversationId, tempId) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: existing.map((m) =>
            m._id === tempId ? { ...m, status: 'failed' } : m
          ),
        },
      };
    }),

  setMessagesStatus: (conversationId, status) =>
    set((state) => ({
      messagesStatus: { ...state.messagesStatus, [conversationId]: status },
    })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),
}));
