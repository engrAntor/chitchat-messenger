'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocketContext } from '@/components/providers/SocketProvider';
import { getSocket } from '@/lib/socket';
import { messagesApi } from '@/services/api';
import { tempId } from '@/lib/utils';
import { toast } from 'sonner';

const schema = z.object({ text: z.string().trim().min(1) });
type FormData = z.infer<typeof schema>;

interface MessageInputProps {
  conversationId: string;
}

const EMOJI_LIST = ['😊', '😂', '👍', '❤️', '🎉', '🙏', '😍', '🔥', '✨', '💯'];

export default function MessageInput({ conversationId }: MessageInputProps) {
  const { user } = useAuthStore();
  const { appendMessage, replaceOptimisticMessage, markMessageFailed, upsertConversation, conversations } =
    useChatStore();
  const { socket } = useSocketContext();
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { text: '' } });

  const textValue = watch('text');
  const canSend = textValue.trim().length > 0;

  // Close emoji picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Auto-resize textarea
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const onSubmit = async (data: FormData) => {
    const trimmedText = data.text.trim();
    if (!user || !trimmedText) return;

    const id = tempId();
    const now = new Date().toISOString();

    // Optimistic message
    const optimisticMsg = {
      _id: id,
      conversationId,
      sender: { _id: user._id, name: user.name, phone: user.phone },
      text: trimmedText,
      createdAt: now,
      status: 'pending' as const,
      optimistic: true,
    };

    appendMessage(conversationId, optimisticMsg);
    reset();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const realMsg = await messagesApi.send({ conversationId, text: optimisticMsg.text });
      const convo = conversations.find((c) => c._id === conversationId);
      
      // Server returns 'sender' as a plain string ID — expand it to full user object
      const senderObj = (typeof realMsg.sender === 'object' && realMsg.sender?._id)
        ? realMsg.sender
        : { _id: user._id, name: user.name, phone: user.phone };

      // Server returns 'id' (not '_id') and 'conversation' (not 'conversationId')
      const realId = (realMsg as any)._id || (realMsg as any).id;
      const realConvId = (realMsg as any).conversationId
        || (realMsg as any).conversation
        || conversationId;

      const formattedRealMsg = {
        ...realMsg,
        _id: realId,
        conversationId: realConvId,
        sender: senderObj,
        status: 'sent' as const,
      };

      // Replace the optimistic placeholder with the real confirmed message
      replaceOptimisticMessage(conversationId, id, formattedRealMsg);

      // Update conversation sidebar with latest message
      if (convo) {
        upsertConversation({ ...convo, lastMessage: formattedRealMsg, updatedAt: now });
      }

      // NOTE: Do NOT emit socket events here.
      // The backend broadcasts to all other participants automatically after POST /messages.
      // Any client-side re-emission causes the sender to receive their own message as "incoming".
    } catch {
      markMessageFailed(conversationId, id);
      toast.error('Message failed to send. Tap to retry.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? textValue.length;
    const newVal = textValue.slice(0, pos) + emoji + textValue.slice(pos);
    setValue('text', newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = pos + emoji.length;
    }, 0);
    setShowEmoji(false);
  };

  return (
    <div className="shrink-0 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
      <form
        id="message-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-2"
        noValidate
      >
        {/* Emoji picker */}
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            id="emoji-btn"
            onClick={() => setShowEmoji((v) => !v)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shrink-0',
              showEmoji && 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10'
            )}
            aria-label="Emoji picker"
          >
            <Smile size={18} />
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 left-0 p-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-overlay)] shadow-xl grid grid-cols-5 gap-1 animate-scale-in z-10">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => insertEmoji(e)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            {...register('text')}
            ref={(el) => {
              register('text').ref(el);
              (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            }}
            id="message-input"
            rows={1}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            onKeyDown={handleKeyDown}
            onInput={autoResize}
            disabled={isSubmitting}
            className={cn(
              'w-full resize-none rounded-xl px-4 py-2.5 text-sm leading-relaxed',
              'bg-[var(--surface-card)] border border-[var(--border-default)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
              'transition-all duration-150 max-h-36 overflow-y-auto',
              'disabled:opacity-50'
            )}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          id="send-message-btn"
          disabled={!canSend || isSubmitting}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            'transition-all duration-150',
            canSend
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
              : 'bg-[var(--surface-card)] text-[var(--text-muted)] cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send size={16} className={canSend ? '' : ''} />
        </button>
      </form>

      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center hidden sm:block">
        Press <kbd className="bg-[var(--surface-card)] px-1 rounded text-[9px]">Enter</kbd> to send
        &nbsp;·&nbsp;
        <kbd className="bg-[var(--surface-card)] px-1 rounded text-[9px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
