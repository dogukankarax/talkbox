import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@talkbox/shared";
import type { Server } from "socket.io";

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

let io: TypedServer | null = null;

export const setIO = (instance: TypedServer) => {
  io = instance;
};

export const getIO = (): TypedServer => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};
