'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { formatMessageTime, formatDateSeparator, isDifferentDay, cn } from '@/lib/utils';
import { Message } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { conversationsApi } from '@/services/api';
import { ChevronDown, AlertCircle, CheckCheck } from 'lucide-react';

interface MessageListProps {
  conversationId: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const { user } = useAuthStore();
  const {
    messages,
    messagesStatus,
    setMessages,
    prependMessages,
    setMessagesStatus,
    hasMore,
    oldestCursor,
    conversations,
  } = useChatStore();

  const conversation = conversations.find((c) => c._id === conversationId);
  const msgs = messages[conversationId] ?? [];
  const status = messagesStatus[conversationId] ?? 'idle';
  const canLoadMore = hasMore[conversationId] ?? false;
  const cursor = oldestCursor[conversationId];

  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevMsgCount = useRef(msgs.length);
  const isFirstLoad = useRef(true);

  // ─── Load initial messages ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setMessagesStatus(conversationId, 'loading');
    isFirstLoad.current = true;

    conversationsApi
      .getMessages(conversationId, 50)
      .then((res) => {
        if (cancelled) return;
        // API returns {messages, hasMore} or just an array
        const msgArray = Array.isArray(res) ? res : (res.messages ?? []);
        // Sort oldest → newest so messages render top→bottom
        const sorted = [...msgArray].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const more = typeof res === 'object' && !Array.isArray(res) ? (res.hasMore ?? false) : false;
        const nextCursor = sorted[0]?._id;
        setMessages(conversationId, sorted, more, nextCursor);
        setMessagesStatus(conversationId, 'idle');
      })
      .catch(() => {
        if (!cancelled) setMessagesStatus(conversationId, 'error');
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // ─── Auto-scroll on new messages ─────────────────────────────────────────
  useEffect(() => {
    if (msgs.length === 0) return;

    if (isFirstLoad.current) {
      // Always scroll on first load
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      isFirstLoad.current = false;
      prevMsgCount.current = msgs.length;
      return;
    }

    const addedMsgs = msgs.length - prevMsgCount.current;
    if (addedMsgs > 0) {
      if (isAtBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setNewMsgCount(0);
      } else {
        const latestMsg = msgs[msgs.length - 1];
        const latestSenderId = latestMsg
          ? (typeof latestMsg.sender === 'string' ? latestMsg.sender : latestMsg.sender?._id)
          : null;
        const currentUserId = user?._id;
        if (latestSenderId && latestSenderId !== currentUserId) {
          setNewMsgCount((c) => c + addedMsgs);
        } else if (latestSenderId === currentUserId) {
          // Own message — always scroll to bottom
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    prevMsgCount.current = msgs.length;
  }, [msgs.length, isAtBottom, user?._id]);

  // ─── Track scroll position ────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMsgCount(0);
  }, []);

  // ─── Load more (older messages) via Intersection Observer ────────────────
  useEffect(() => {
    const el = topRef.current;
    if (!el || !canLoadMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loadingMore || !canLoadMore) return;
        setLoadingMore(true);
        const scrollEl = scrollRef.current;
        const prevHeight = scrollEl?.scrollHeight ?? 0;

        try {
          const res = await conversationsApi.getMessages(conversationId, 20, cursor);
          const msgArray = Array.isArray(res) ? res : (res.messages ?? []);
          const sorted = [...msgArray].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const more = typeof res === 'object' && !Array.isArray(res) ? (res.hasMore ?? false) : false;
          const nextCursor = sorted[0]?._id;
          prependMessages(conversationId, sorted, more, nextCursor);

          // Restore scroll position
          requestAnimationFrame(() => {
            if (scrollEl) {
              scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
            }
          });
        } catch {
          // Silently fail — user can scroll again
        } finally {
          setLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [conversationId, canLoadMore, cursor, loadingMore, prependMessages]);

  // ─── Scroll to bottom button ──────────────────────────────────────────────
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgCount(0);
  };

  // ─── States ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
        <AlertCircle size={32} className="text-rose-500" />
        <p className="text-sm">Failed to load messages</p>
      </div>
    );
  }

  if (msgs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
        <div className="text-4xl">💬</div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">No messages yet</p>
        <p className="text-xs text-[var(--text-muted)]">Send the first message to get the conversation started!</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 space-y-1 scroll-smooth"
        id="message-list-scroll"
      >
        {/* Load more sentinel */}
        <div ref={topRef} className="h-1" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Spinner size="sm" />
          </div>
        )}

        {/* Messages */}
        {msgs.map((msg, idx) => {
          const senderId = typeof msg.sender === 'string' ? msg.sender : (msg.sender?._id || (msg.sender as any)?.id);
          const currentUserId = user?._id || (user as any)?.id;
          const isOwn = Boolean(currentUserId && senderId === currentUserId);
          
          const prevMsg = msgs[idx - 1];
          const prevSenderId = prevMsg ? (typeof prevMsg.sender === 'string' ? prevMsg.sender : (prevMsg.sender?._id || (prevMsg.sender as any)?.id)) : null;
          
          const nextMsg = msgs[idx + 1];
          const nextSenderId = nextMsg ? (typeof nextMsg.sender === 'string' ? nextMsg.sender : (nextMsg.sender?._id || (nextMsg.sender as any)?.id)) : null;

          const showDateSep = idx === 0 || (prevMsg && isDifferentDay(prevMsg.createdAt, msg.createdAt));
          const showAvatar = !isOwn && (idx === msgs.length - 1 || nextSenderId !== senderId);
          const isGrouped = prevSenderId === senderId && prevMsg?.createdAt ? !isDifferentDay(prevMsg.createdAt, msg.createdAt) : false;

          return (
            <div key={msg._id || `temp-${idx}`}>
              {/* Date separator */}
              {showDateSep && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  <span className="text-xs text-[var(--text-muted)] font-medium px-2">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                </div>
              )}

              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                isGrouped={isGrouped && !showDateSep}
                conversation={conversation}
              />
            </div>
          );
        })}

        <div ref={bottomRef} className="h-1" aria-hidden="true" />
      </div>

      {/* New messages button */}
      {!isAtBottom && (newMsgCount > 0 || true) && (
        <button
          id="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full',
            'bg-indigo-600 text-white text-xs font-medium shadow-lg shadow-indigo-500/30',
            'hover:bg-indigo-500 transition-all duration-150 animate-bounce-in'
          )}
        >
          {newMsgCount > 0 && (
            <span className="bg-white text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
              {newMsgCount > 9 ? '9+' : newMsgCount}
            </span>
          )}
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  isOwn,
  showAvatar,
  isGrouped,
  conversation,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  isGrouped: boolean;
  conversation?: import('@/types').Conversation;
}) {
  const isFailed = message.status === 'failed';
  const isPending = message.status === 'pending';
  
  const senderId = typeof message.sender === 'string'
    ? message.sender
    : (message.sender?._id || (message.sender as any)?.id || 'unknown');

  // Look up participant in conversation
  const participant = conversation?.participants?.find(
    (p) => p._id === senderId || (p as any).id === senderId
  ) ?? (conversation as any)?.participant;

  const rawName = typeof message.sender === 'object' ? message.sender?.name : undefined;

  // Resolve sender name: check message object name, participant name from convo, or direct chat participant
  const otherParticipant = conversation?.type === 'direct'
    ? conversation.participants?.find((p) => p._id === senderId) ?? (conversation as any)?.participant
    : null;

  const resolvedName =
    (rawName && rawName.trim() !== '' && rawName !== 'User')
      ? rawName
      : participant?.name || otherParticipant?.name || (typeof message.sender === 'object' ? message.sender?.phone : null) || 'User';

  const senderName = isOwn ? 'You' : resolvedName;

  return (
    <div
      className={cn(
        'flex items-end gap-2 animate-fade-in',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isGrouped ? 'mt-0.5' : 'mt-3'
      )}
      id={`msg-${message._id}`}
    >
      {/* Avatar (for others only) */}
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar ? (
            <Avatar name={senderName} id={senderId} size="sm" />
          ) : null}
        </div>
      )}

      {/* Bubble container */}
      <div className={cn('flex flex-col max-w-[85%] sm:max-w-[70%] gap-1', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name (for group or first message in block, non-own) */}
        {!isOwn && !isGrouped && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 ml-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
            isOwn
              ? 'message-own rounded-br-sm'
              : 'message-other rounded-bl-sm',
            isFailed && 'opacity-50'
          )}
        >
          {message.text}
        </div>

        {/* Time + status */}
        <div className={cn('flex items-center gap-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className={cn('text-[10px]', isFailed ? 'text-rose-400' : isPending ? 'text-[var(--text-muted)]' : 'text-indigo-400')}>
              {isFailed ? '✗ Failed' : isPending ? '⏳' : <CheckCheck size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
