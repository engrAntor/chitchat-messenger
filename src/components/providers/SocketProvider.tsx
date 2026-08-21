'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { Message, Conversation } from '@/types';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function useSocketContext() {
  return useContext(SocketContext);
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const { appendMessage, upsertConversation, activeConversationId, incrementUnread } = useChatStore();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const handleMessageNew = useCallback(
    (payload: { message: Message } | Message) => {
      // API may return {message: ...} or the message directly
      const message = 'message' in payload && typeof payload.message === 'object'
        ? (payload as { message: Message }).message
        : (payload as Message);

      const convId = message.conversationId;
      appendMessage(convId, message);

      // Increment unread if not in active conversation
      if (convId !== activeConversationId) {
        incrementUnread(convId);
      }
    },
    [appendMessage, activeConversationId, incrementUnread]
  );

  const handleConversationUpdated = useCallback(
    (payload: { conversation: Conversation } | Conversation) => {
      const convo = 'conversation' in payload && typeof payload.conversation === 'object'
        ? (payload as { conversation: Conversation }).conversation
        : (payload as Conversation);
      upsertConversation(convo);
    },
    [upsertConversation]
  );

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('message:new', handleMessageNew);
    socket.on('conversation:updated', handleConversationUpdated);

    // Set initial state if already connected
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message:new', handleMessageNew);
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, [token, handleMessageNew, handleConversationUpdated]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
