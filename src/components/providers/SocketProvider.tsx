'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { connectSocket, disconnectSocket } from '@/lib/socket';

// Helper: get current user ID at any point — works even before Zustand hydration
function getCurrentUserId(): string {
  // 1. Try Zustand store (fastest, always current)
  const storeUser = useAuthStore.getState().user;
  if (storeUser?._id) return storeUser._id;
  // 2. Fallback to localStorage (works on production before store hydration)
  try {
    const raw = localStorage.getItem('chat_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?._id) return parsed._id;
    }
  } catch { /* ignore */ }
  return '';
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function useSocketContext() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const { conversations, activeConversationId } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Use a ref so handlers always see the latest store values without causing effect re-runs
  const storeRef = useRef(useChatStore.getState());
  useEffect(() => {
    return useChatStore.subscribe((state) => {
      storeRef.current = state;
    });
  }, []);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Join rooms whenever socket connects or when conversations / activeConversationId change
  useEffect(() => {
    if (!socketRef.current || !isConnected) return;
    const socket = socketRef.current;

    const u = userRef.current;
    if (u?._id) {
      socket.emit('setup', u);
      socket.emit('join', u._id);
      socket.emit('join_room', u._id);
      socket.emit('addUser', u._id);
    }

    if (activeConversationId) {
      socket.emit('join', activeConversationId);
      socket.emit('join_room', activeConversationId);
      socket.emit('join chat', activeConversationId);
      socket.emit('joinChat', activeConversationId);
      socket.emit('joinConversation', activeConversationId);
    }

    conversations.forEach((c) => {
      if (c._id) {
        socket.emit('join', c._id);
        socket.emit('join_room', c._id);
        socket.emit('join chat', c._id);
        socket.emit('joinChat', c._id);
        socket.emit('joinConversation', c._id);
      }
    });
  }, [isConnected, activeConversationId, conversations]);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    const onConnect = () => {
      setIsConnected(true);
      const u = userRef.current;
      if (u?._id) {
        socket.emit('setup', u);
        socket.emit('join', u._id);
        socket.emit('join_room', u._id);
        socket.emit('addUser', u._id);
      }
      // Re-join active conversations
      const current = storeRef.current;
      if (current.activeConversationId) {
        socket.emit('join', current.activeConversationId);
        socket.emit('join_room', current.activeConversationId);
        socket.emit('join chat', current.activeConversationId);
      }
      current.conversations.forEach((c) => {
        if (c._id) {
          socket.emit('join', c._id);
          socket.emit('join_room', c._id);
          socket.emit('join chat', c._id);
        }
      });
    };

    const onDisconnect = () => setIsConnected(false);

    // ===== DEBUG: log every server event so we can identify exact event names =====
    const onAnyDebug = (eventName: string, ...args: any[]) => {
      console.log(`[SOCKET EVENT] "${eventName}"`, JSON.stringify(args[0]).slice(0, 300));
    };
    socket.onAny(onAnyDebug);
    // ===== END DEBUG =====

    // Incoming message handler — only processes messages from OTHER users
    const onMessage = (payload: any) => {
      if (!payload) return;
      const msg = payload.message ?? payload.data ?? payload;
      if (!msg || typeof msg !== 'object') return;

      const getIdStr = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        return val._id || val.id || val.conversationId || val.chatId || '';
      };

      const convId =
        getIdStr(msg.conversationId) ||
        getIdStr(msg.conversation) ||
        getIdStr(msg.chatId) ||
        getIdStr(msg.chat) ||
        getIdStr(msg.room) ||
        getIdStr(msg.roomId) ||
        getIdStr(msg.groupId);

      if (!convId) return;

      const senderId = typeof msg.sender === 'string'
        ? msg.sender
        : (msg.sender?._id || (msg.sender as any)?.id || msg.senderId || '');

      // *** KEY FIX: Ignore messages sent by the current user — already in store ***
      // Read from store.getState() + localStorage fallback to handle production SSR hydration delay
      const currentUserId = getCurrentUserId() || userRef.current?._id || '';
      if (currentUserId && senderId && String(senderId) === String(currentUserId)) return;

      const foundConvo = storeRef.current.conversations.find((c) => c._id === convId);
      const participant = foundConvo?.participants?.find(
        (p) => p._id === senderId || (p as any).id === senderId
      ) ?? (foundConvo as any)?.participant;

      const rawSenderName = typeof msg.sender === 'object' ? msg.sender?.name : undefined;
      const resolvedSenderName =
        (rawSenderName && rawSenderName !== 'User')
          ? rawSenderName
          : participant?.name || msg.senderName || msg.name || 'User';

      const sender = {
        _id: senderId,
        name: resolvedSenderName,
        phone: (typeof msg.sender === 'object' ? msg.sender?.phone : null) || participant?.phone || msg.senderPhone || msg.phone || '',
      };

      const normalized = {
        ...msg,
        // Server returns 'id' not '_id'
        _id: msg._id || msg.id || `incoming-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        conversationId: convId,
        sender,
        text: msg.text ?? msg.content ?? msg.message ?? '',
        // Server returns Unix timestamp number — convert to ISO string
        createdAt: typeof msg.createdAt === 'number'
          ? new Date(msg.createdAt).toISOString()
          : (msg.createdAt || new Date().toISOString()),
        status: 'sent',
      };

      const { appendMessage, activeConversationId, incrementUnread, conversations } = storeRef.current;

      appendMessage(convId, normalized);

      if (convId !== activeConversationId) {
        incrementUnread(convId);
      }

      // If conversation is missing from current store, fetch updated list
      if (!conversations.some((c) => c._id === convId)) {
        import('@/services/api').then(({ conversationsApi }) => {
          conversationsApi.list().then((list) => {
            storeRef.current.setConversations(list);
          }).catch(() => {});
        });
      }
    };

    // Robust handler for conversation updates
    const onConversation = (payload: any) => {
      if (!payload) return;
      const convo = payload.conversation ?? payload.data ?? payload;
      if (!convo?._id) return;
      storeRef.current.upsertConversation(convo);
      if (socketRef.current) {
        socketRef.current.emit('join', convo._id);
        socketRef.current.emit('join_room', convo._id);
        socketRef.current.emit('join chat', convo._id);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Message events — exhaustive coverage of all standard Socket.IO event naming patterns
    const msgEvents = [
      'message:new',
      'message:received',
      'message:receive',
      'message:created',
      'newMessage',
      'new_message',
      'new message',
      'getMessage',
      'get_message',
      'receiveMessage',
      'receive_message',
      'message received',
      'message_received',
      'message',
      'chat message',
      'chat:message',
      'chat_message',
      'direct_message',
      'group_message',
      'msg',
    ];
    msgEvents.forEach((ev) => socket.on(ev, onMessage));

    // Conversation events
    const convoEvents = [
      'conversation:updated',
      'conversation:new',
      'newConversation',
      'new_conversation',
      'updateConversation',
      'update_conversation',
      'conversation',
    ];
    convoEvents.forEach((ev) => socket.on(ev, onConversation));

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      msgEvents.forEach((ev) => socket.off(ev, onMessage));
      convoEvents.forEach((ev) => socket.off(ev, onConversation));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
