'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, MessageSquare, LogOut, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { conversationsApi } from '@/services/api';
import { useSocketContext } from '@/components/providers/SocketProvider';
import ConversationItem from './ConversationItem';
import { ConversationSkeleton } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Avatar from '@/components/ui/Avatar';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NewConversationModal from './NewConversationModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ConversationList() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const {
    conversations,
    conversationsStatus,
    setConversations,
    setConversationsStatus,
    activeConversationId,
    setActiveConversation,
    clearUnread,
  } = useChatStore();
  const { isConnected } = useSocketContext();

  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    setConversationsStatus('loading');
    conversationsApi
      .list()
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setConversations(arr);
        setConversationsStatus('idle');
      })
      .catch(() => setConversationsStatus('error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (c.type === 'group') return c.name?.toLowerCase().includes(q);
    const other = c.participants?.find((p) => p._id !== user?._id) ?? (c as any).participant;
    return other?.name.toLowerCase().includes(q) || other?.phone.includes(q);
  });

  const handleSelect = (id: string) => {
    setActiveConversation(id);
    clearUnread(id);
  };

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'chat_token=; path=/; max-age=0';
    router.replace('/login');
  };

  return (
    <>
      <aside className="w-full sm:w-80 shrink-0 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-elevated)] h-full">
        {/* Header */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-indigo-500/20 shrink-0">
                <Image src="/logo.jpg" alt="AltChat Logo" fill sizes="32px" className="object-cover" />
              </div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">AltChat</h1>
            </div>
            <div className="flex items-center gap-0.5">
              {/* Connection indicator */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium',
                  isConnected
                    ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                    : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                )}
                title={isConnected ? 'Connected' : 'Disconnected'}
              >
                {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
              </div>

              <ThemeToggle size="sm" />

              {/* New conversation */}
              <button
                id="new-conversation-btn"
                onClick={() => setShowNewModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                aria-label="New conversation"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              id="conversation-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {conversationsStatus === 'loading' ? (
            Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)
          ) : conversationsStatus === 'error' ? (
            <EmptyState
              title="Failed to load"
              description="Could not load conversations"
              icon={<MessageSquare size={24} />}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? 'No results' : 'No conversations'}
              description={search ? 'Try a different name or number' : 'Start a new conversation by clicking the + button'}
              icon={<MessageSquare size={24} />}
            />
          ) : (
            filtered.map((convo) => (
              <ConversationItem
                key={convo._id}
                conversation={convo}
                isActive={convo._id === activeConversationId}
                onClick={() => handleSelect(convo._id)}
              />
            ))
          )}
        </div>

        {/* User profile footer */}
        {user && (
          <div className="px-3 py-3 border-t border-[var(--border-subtle)] flex items-center gap-3">
            <Avatar name={user.name} id={user._id} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.phone}</p>
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </aside>

      <NewConversationModal open={showNewModal} onClose={() => setShowNewModal(false)} />
    </>
  );
}
