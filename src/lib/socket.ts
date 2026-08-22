import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://frontend-task-chatapp.onrender.com';

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  // If socket already exists for this exact token and is connecting/connected, return it
  if (socket && currentToken === token && (socket.connected || socket.active)) {
    return socket;
  }

  // Disconnect previous socket if token changed
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
}
