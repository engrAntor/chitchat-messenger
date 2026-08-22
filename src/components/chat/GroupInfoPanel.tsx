'use client';

import { useState } from 'react';
import { X, Users, Crown, UserMinus, UserPlus, Edit2, Check, ChevronRight } from 'lucide-react';
import { Conversation } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { conversationsApi } from '@/services/api';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import NewConversationModal from './NewConversationModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GroupInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

export default function GroupInfoPanel({ conversation, onClose }: GroupInfoPanelProps) {
  const { user } = useAuthStore();
  const { upsertConversation } = useChatStore();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(conversation.name ?? '');
  const [loading, setLoading] = useState<string | null>(null);

  const isAdmin = conversation.admins?.includes(user?._id ?? '') ?? false;

  const handleRename = async () => {
    if (!newName.trim() || newName === conversation.name) {
      setEditingName(false);
      return;
    }
    setLoading('rename');
    try {
      const updated = await conversationsApi.rename(conversation._id, { name: newName.trim() });
      upsertConversation(updated);
      toast.success('Group renamed');
      setEditingName(false);
    } catch {
      toast.error('Failed to rename group');
    } finally {
      setLoading(null);
    }
  };

  const handlePromote = async (userId: string) => {
    setLoading(`promote-${userId}`);
    try {
      const updated = await conversationsApi.promoteAdmin(conversation._id, { userId });
      upsertConversation(updated);
      toast.success('Member promoted to admin');
    } catch {
      toast.error('Failed to promote member');
    } finally {
      setLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setLoading(`remove-${userId}`);
    try {
      await conversationsApi.removeParticipant(conversation._id, userId);
      const updated = {
        ...conversation,
        participants: conversation.participants?.filter((p) => p._id !== userId) ?? [],
      };
      upsertConversation(updated);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setLoading(null);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setLoading('leave');
    try {
      await conversationsApi.removeParticipant(conversation._id, user._id);
      toast.success('You left the group');
      onClose();
    } catch {
      toast.error('Failed to leave group');
    } finally {
      setLoading(null);
    }
  };

  return (
    <aside className="absolute inset-y-0 right-0 z-20 w-full sm:w-72 sm:relative sm:z-auto shrink-0 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-elevated)] animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Group Info</h2>
        <button
          id="group-info-close-btn"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Close group info"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-5">
        {/* Group avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl">
            <Users size={28} className="text-white" />
          </div>

          {editingName && isAdmin ? (
            <div className="flex items-center gap-2 w-full">
              <input
                id="group-name-edit-input"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="flex-1 h-8 px-2 rounded-lg bg-[var(--surface-card)] border border-indigo-500 text-sm text-[var(--text-primary)] focus:outline-none"
              />
              <button
                id="group-name-save-btn"
                onClick={handleRename}
                disabled={loading === 'rename'}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)]">
                {conversation.name ?? 'Group Chat'}
              </span>
              {isAdmin && (
                <button
                  id="group-name-edit-btn"
                  onClick={() => setEditingName(true)}
                  className="text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
                  aria-label="Rename group"
                >
                  <Edit2 size={13} />
                </button>
              )}
            </div>
          )}

          <span className="text-xs text-[var(--text-muted)]">
            {conversation.participants?.length ?? 0} members
          </span>
        </div>

        {/* Members list */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
            Members
          </h3>
          <div className="space-y-1">
            {conversation.participants?.map((p) => {
              const isParticipantAdmin = conversation.admins?.includes(p._id);
              const isSelf = p._id === user?._id;

              return (
                <div
                  key={p._id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-hover)] group"
                >
                  <Avatar name={p.name} id={p._id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {p.name}{isSelf ? ' (you)' : ''}
                      </span>
                      {isParticipantAdmin && (
                        <span title="Admin"><Crown size={11} className="text-amber-400 shrink-0" /></span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{p.phone}</p>
                  </div>

                  {/* Admin actions (only for non-self, if current user is admin) */}
                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isParticipantAdmin && (
                        <button
                          id={`promote-${p._id}-btn`}
                          onClick={() => handlePromote(p._id)}
                          disabled={loading === `promote-${p._id}`}
                          className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Promote to admin"
                          aria-label={`Promote ${p.name} to admin`}
                        >
                          <Crown size={11} />
                        </button>
                      )}
                      <button
                        id={`remove-${p._id}-btn`}
                        onClick={() => handleRemove(p._id)}
                        disabled={!!loading}
                        className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                        title="Remove member"
                        aria-label={`Remove ${p.name}`}
                      >
                        <UserMinus size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave group */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
        <Button
          id="leave-group-btn"
          variant="danger"
          size="sm"
          className="w-full"
          loading={loading === 'leave'}
          onClick={handleLeave}
        >
          Leave Group
        </Button>
      </div>
    </aside>
  );
}
