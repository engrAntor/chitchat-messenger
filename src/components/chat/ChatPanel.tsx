'use client';

import { useState } from 'react';
import { Phone, Users, Info, ArrowLeft } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GroupInfoPanel from './GroupInfoPanel';
import EmptyState from '@/components/ui/EmptyState';
import { getAvatarColor } from '@/lib/utils';

export default function ChatPanel() {
  const { user } = useAuthStore();
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const conversation = conversations.find((c) => c._id === activeConversationId);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--surface-base)]">
        <EmptyState
          icon={<span className="text-3xl">💬</span>}
          title="Select a conversation"
          description="Choose from your conversations on the left, or start a new one."
        />
      </div>
    );
  }

  const isGroup = conversation.type === 'group';
  const otherParticipant = !isGroup
    ? conversation.participants?.find((p) => p._id !== user?._id) ?? conversation.participants?.[0] ?? (conversation as any).participant
    : null;

  const displayName = isGroup
    ? conversation.name ?? 'Group Chat'
    : otherParticipant?.name ?? 'Unknown';

  const displayId = isGroup ? conversation._id : (otherParticipant?._id ?? conversation._id);

  const subtitle = isGroup
    ? `${conversation.participants?.length ?? 0} members`
    : otherParticipant?.phone ?? '';

  return (
    <div className="flex-1 flex min-w-0 overflow-hidden">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface-base)]">
        {/* Chat header */}
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          {/* Mobile back button */}
          <button
            id="chat-back-btn"
            onClick={() => setActiveConversation(null)}
            className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Avatar */}
          {isGroup ? (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white ${getAvatarColor(displayId)}`}
            >
              <Users size={18} />
            </div>
          ) : (
            <Avatar name={displayName} id={displayId} size="md" />
          )}

          {/* Name + subtitle */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-[var(--text-primary)] truncate">{displayName}</h2>
            <p className="text-xs text-[var(--text-muted)] truncate flex items-center gap-1">
              {isGroup ? (
                <>
                  <Users size={10} /> {subtitle}
                </>
              ) : (
                <>
                  <Phone size={10} /> {subtitle}
                </>
              )}
            </p>
          </div>

          {/* Group info toggle */}
          {isGroup && (
            <button
              id="group-info-btn"
              onClick={() => setShowGroupInfo((v) => !v)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                showGroupInfo
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
              aria-label="Group info"
              aria-pressed={showGroupInfo}
            >
              <Info size={18} />
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList conversationId={conversation._id} />
          <MessageInput conversationId={conversation._id} />
        </div>
      </div>

      {/* Group info panel */}
      {isGroup && showGroupInfo && (
        <GroupInfoPanel
          conversation={conversation}
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
}
