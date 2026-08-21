// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  phone: string;
  name: string;
}

// ─── Conversations ───────────────────────────────────────────────────────────

export type ConversationType = 'direct' | 'group';

export interface Participant {
  _id: string;
  name: string;
  phone: string;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  participants: Participant[];
  admins?: string[]; // user IDs
  name?: string; // group name
  lastMessage?: Message;
  updatedAt: string;
  createdAt: string;
  unreadCount?: number; // client-side tracking
}

// ─── Messages ────────────────────────────────────────────────────────────────

export type MessageStatus = 'pending' | 'sent' | 'failed';

export interface Message {
  _id: string;
  conversationId: string;
  sender: Participant;
  text: string;
  createdAt: string;
  status?: MessageStatus; // client-side for optimistic updates
  optimistic?: boolean;   // client-side flag
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

// ─── API Request Bodies ───────────────────────────────────────────────────────

export interface StartConversationRequest {
  userId: string;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export interface CreateGroupRequest {
  name: string;
  participantIds: string[];
}

export interface AddParticipantsRequest {
  userIds: string[];
}

export interface PromoteRequest {
  userId: string;
}

export interface RenameGroupRequest {
  name: string;
}

// ─── Socket Events ────────────────────────────────────────────────────────────

export interface SocketMessageNew {
  message: Message;
}

export interface SocketConversationUpdated {
  conversation: Conversation;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type UIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SearchResult {
  _id: string;
  name: string;
  phone: string;
}
