'use client';

import { formatConversationTime, cn, getAvatarColor, getOtherParticipant } from '@/lib/utils';
import { Conversation } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { user } = useAuthStore();
  const { unreadCounts } = useChatStore();

  const isGroup = conversation.type === 'group';
  const unread = unreadCounts[conversation._id] ?? 0;

  const otherParticipant = !isGroup ? getOtherParticipant(conversation, user) : null;

  const displayName = isGroup
    ? conversation.name || 'Group Chat'
    : otherParticipant?.name || 'Chat';

  const displayId = isGroup ? conversation._id : (otherParticipant?._id || conversation._id);

  const lastMsg = conversation.lastMessage;
  const lastSenderId = lastMsg
    ? (typeof lastMsg.sender === 'string' ? lastMsg.sender : (lastMsg.sender?._id || (lastMsg.sender as any)?.id))
    : null;
  const isOwnLastMsg = Boolean(user?._id && lastSenderId === user._id);
  const lastMsgText = lastMsg
    ? isOwnLastMsg
      ? `You: ${lastMsg.text}`
      : isGroup
      ? `${(conversation.participants?.find((p) => p._id === lastSenderId)?.name || 'Someone')}: ${lastMsg.text}`
      : lastMsg.text
    : isGroup
    ? `${conversation.participants?.length ?? 0} members`
    : 'Start a conversation';

  return (
    <button
      id={`conv-item-${conversation._id}`}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative',
        isActive
          ? 'bg-indigo-50 border border-indigo-200 shadow-sm dark:bg-indigo-600/10 dark:border-indigo-500/20'
          : 'hover:bg-[var(--surface-hover)] border border-transparent'
      )}
      aria-label={`Conversation with ${displayName}`}
      aria-selected={isActive}
    >
      {/* Avatar */}
      {isGroup ? (
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-sm',
            getAvatarColor(displayId)
          )}
        >
          <Users size={18} />
        </div>
      ) : (
        <Avatar name={displayName} id={displayId} size="md" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm truncate',
              isActive
                ? 'text-indigo-700 dark:text-indigo-300 font-bold'
                : unread > 0
                ? 'text-[var(--text-primary)] font-extrabold'
                : 'text-[var(--text-primary)] font-medium'
            )}
          >
            {displayName}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-[var(--text-muted)] shrink-0">
              {formatConversationTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">{lastMsgText}</p>
          {unread > 0 && (
            <span className="shrink-0 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
