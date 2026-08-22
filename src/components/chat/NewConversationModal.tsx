'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Users, User as UserIcon, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocketContext } from '@/components/providers/SocketProvider';
import { usersApi, conversationsApi } from '@/services/api';
import { SearchResult } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Mode = 'search' | 'group';

interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewConversationModal({ open, onClose }: NewConversationModalProps) {
  const { user } = useAuthStore();
  const { upsertConversation, setActiveConversation, clearUnread } = useChatStore();
  const { socket } = useSocketContext();

  const [mode, setMode] = useState<Mode>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await usersApi.search(query);
        const arr = Array.isArray(res) ? res : [];
        // Filter out current user
        setResults(arr.filter((u) => u._id !== user?._id));
      } catch {
        toast.error('Search failed');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, user?._id]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setMode('search');
      setQuery('');
      setResults([]);
      setSelected([]);
      setGroupName('');
    }
  }, [open]);

  const toggleSelect = (u: SearchResult) => {
    setSelected((prev) =>
      prev.some((s) => s._id === u._id) ? prev.filter((s) => s._id !== u._id) : [...prev, u]
    );
  };

  const isSelected = (id: string) => selected.some((s) => s._id === id);

  const handleStartDirect = async (targetUser: SearchResult) => {
    setCreating(true);
    try {
      const convo = await conversationsApi.startDirect({ userId: targetUser._id });
      
      const existing = Array.isArray(convo.participants) ? convo.participants : [];
      const currentU = user ? { _id: user._id, name: user.name, phone: user.phone } : null;
      const targetP = { _id: targetUser._id, name: targetUser.name, phone: targetUser.phone };
      
      const merged = [
        targetP,
        ...(currentU ? [currentU] : []),
        ...existing.filter((p: any) => p && typeof p === 'object' && p._id !== targetUser._id && p._id !== user?._id),
      ];

      const fullConvo = {
        ...convo,
        participants: merged,
      };

      upsertConversation(fullConvo);
      setActiveConversation(fullConvo._id);
      clearUnread(fullConvo._id);

      if (socket) {
        socket.emit('join', fullConvo._id);
        socket.emit('join_room', fullConvo._id);
        socket.emit('join chat', fullConvo._id);
        socket.emit('newConversation', fullConvo);
        socket.emit('new_conversation', fullConvo);
        socket.emit('conversation:new', fullConvo);
      }

      onClose();
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (selected.length < 2) {
      toast.error('Select at least 2 members for a group');
      return;
    }
    setCreating(true);
    try {
      const convo = await conversationsApi.createGroup({
        name: groupName.trim(),
        participantIds: selected.map((s) => s._id),
      });
      upsertConversation(convo);
      setActiveConversation(convo._id);
      clearUnread(convo._id);

      if (socket) {
        socket.emit('join', convo._id);
        socket.emit('join_room', convo._id);
        socket.emit('join chat', convo._id);
        socket.emit('newConversation', convo);
        socket.emit('new_conversation', convo);
        socket.emit('conversation:new', convo);
      }

      toast.success(`Group "${groupName}" created!`);
      onClose();
    } catch {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Conversation"
      size="md"
    >
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface-card)] mb-4">
        <button
          id="mode-dm-btn"
          onClick={() => { setMode('search'); setSelected([]); }}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-all',
            mode === 'search'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          <UserIcon size={14} /> Direct Message
        </button>
        <button
          id="mode-group-btn"
          onClick={() => setMode('group')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-all',
            mode === 'group'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
        >
          <Users size={14} /> Group Chat
        </button>
      </div>

      {/* Group name input (group mode) */}
      {mode === 'group' && (
        <input
          id="group-name-input"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name…"
          className="w-full h-10 px-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 mb-3 transition-colors"
          autoFocus
        />
      )}

      {/* Selected chips (group mode) */}
      {mode === 'group' && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((s) => (
            <span
              key={s._id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300"
            >
              {s.name}
              <button
                type="button"
                onClick={() => toggleSelect(s)}
                className="hover:text-white transition-colors"
                aria-label={`Remove ${s.name}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
        <input
          id="user-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full h-10 pl-8 pr-8 rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
          autoFocus={mode === 'search'}
        />
      </div>

      {/* Results */}
      <div className="space-y-1 max-h-56 overflow-y-auto">
        {results.length === 0 && query.trim() && !searching && (
          <p className="text-center text-sm text-[var(--text-muted)] py-4">No users found</p>
        )}
        {!query.trim() && (
          <p className="text-center text-xs text-[var(--text-muted)] py-4">
            Type a name or phone number to search
          </p>
        )}
        {results.map((u) => (
          <button
            key={u._id}
            id={`user-result-${u._id}`}
            onClick={() => mode === 'search' ? handleStartDirect(u) : toggleSelect(u)}
            disabled={creating}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
              isSelected(u._id)
                ? 'bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/20'
                : 'hover:bg-[var(--surface-hover)] border border-transparent'
            )}
          >
            <Avatar name={u.name} id={u._id} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{u.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{u.phone}</p>
            </div>
            {mode === 'group' && isSelected(u._id) && (
              <Check size={16} className="text-indigo-400 shrink-0" />
            )}
            {mode === 'search' && (
              <Plus size={16} className="text-[var(--text-muted)] shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Group create button */}
      {mode === 'group' && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            id="create-group-btn"
            className="w-full"
            loading={creating}
            disabled={selected.length < 2 || !groupName.trim()}
            onClick={handleCreateGroup}
          >
            <Users size={16} />
            Create Group ({selected.length + 1} members)
          </Button>
          {selected.length < 2 && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              Select at least 2 people to create a group
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
