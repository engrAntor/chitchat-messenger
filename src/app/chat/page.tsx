'use client';

import ConversationList from '@/components/chat/ConversationList';
import ChatPanel from '@/components/chat/ChatPanel';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { activeConversationId } = useChatStore();

  return (
    <main className="h-screen flex overflow-hidden bg-[var(--surface-base)]" id="chat-app">
      {/* Sidebar — hidden on mobile when a conversation is active */}
      <div
        className={cn(
          'transition-all duration-300',
          // On mobile: show sidebar only when no active conversation
          activeConversationId ? 'hidden sm:flex' : 'flex w-full sm:w-auto'
        )}
      >
        <ConversationList />
      </div>

      {/* Chat panel — hidden on mobile when no conversation selected */}
      <div
        className={cn(
          'flex-1 flex min-w-0',
          !activeConversationId ? 'hidden sm:flex' : 'flex'
        )}
      >
        <ChatPanel />
      </div>
    </main>
  );
}
