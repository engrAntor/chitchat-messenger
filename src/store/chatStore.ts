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
      conversations: convos.map(c => {
        if (c.type === 'direct' && (c as any).participant && !c.participants) {
          c.participants = [(c as any).participant];
        }
        return c;
      }).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    }),

  setConversationsStatus: (status) => set({ conversationsStatus: status }),

  upsertConversation: (convo) => {
    if (convo.type === 'direct' && (convo as any).participant && !convo.participants) {
      convo.participants = [(convo as any).participant];
    }
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
      // Avoid duplicates by _id
      if (existing.some((m) => m._id === message._id)) return {};

      // If this incoming message matches a pending optimistic message, replace it
      const optimisticIdx = existing.findIndex(
        (m) =>
          m.optimistic &&
          m.status === 'pending' &&
          m.text === message.text
      );

      let updatedList: Message[];
      if (optimisticIdx !== -1) {
        updatedList = [...existing];
        updatedList[optimisticIdx] = { ...message, status: 'sent', optimistic: false };
      } else {
        updatedList = [...existing, message];
      }

      // Insert and keep sorted oldest → newest
      const merged = updatedList.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const newMessages = { ...state.messages, [conversationId]: merged };

      // Update the conversation's lastMessage and bubble it to top of sidebar
      const convoIndex = state.conversations.findIndex((c) => c._id === conversationId);
      if (convoIndex > -1) {
        const convo = state.conversations[convoIndex];
        const updatedConvos = [...state.conversations];
        updatedConvos[convoIndex] = {
          ...convo,
          lastMessage: message,
          updatedAt: message.createdAt || new Date().toISOString(),
        };
        updatedConvos.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        return { messages: newMessages, conversations: updatedConvos };
      }

      return { messages: newMessages };
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
