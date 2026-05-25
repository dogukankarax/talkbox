import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@talkbox/shared";
import { io, type Socket } from "socket.io-client";
import { getToken } from "./api";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function connectSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getToken() },
  });

  return socket;
}

export function getSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null {
  if (!socket) {
    if (getToken()) {
      return connectSocket();
    }
    return null;
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
