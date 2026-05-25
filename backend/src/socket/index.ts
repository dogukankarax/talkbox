import { db } from "@/db/index.js";
import { channelMembersTable, messagesTable } from "@/db/schema.js";
import { env } from "@/lib/env.js";
import { logger } from "@/lib/logger.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@talkbox/shared";
import { and, eq } from "drizzle-orm";
import jwt, { type JwtPayload, type VerifyErrors } from "jsonwebtoken";
import type { Server } from "socket.io";

const jwtSecret = env.JWT_SECRET;

const onlineUsers = new Map<string, Set<string>>();

export const setupSocket = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >,
) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    jwt.verify(
      token,
      jwtSecret,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) {
          return next(new Error("Invalid token"));
        }
        socket.data.user = decoded as SocketData["user"];
        next();
      },
    );
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user) return;

    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set());
    }

    onlineUsers.get(user.id)!.add(socket.id);

    socket.emit("online_users", Array.from(onlineUsers.keys()));

    if (onlineUsers.get(user.id)!.size === 1) {
      socket.broadcast.emit("user_online", user.id);
    }

    socket.on("join_channel", (channelId: string) => {
      socket.join(channelId);
      logger.debug(`Socket ${socket.id} joined channel ${channelId}`);
    });

    socket.on("leave_channel", (channelId: string) => {
      socket.leave(channelId);
      logger.debug(`Socket ${socket.id} left channel ${channelId}`);
    });

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(user.id);
      if (!userSockets) return;

      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(user.id);
        io.emit("user_offline", user.id);
      }
      logger.debug({ socketId: socket.id }, "User disconnected");
    });

    socket.on("send_message", async (data) => {
      logger.debug(data, "send_message received");
      const user = socket.data.user;
      if (!user) return;

      const { channelId, content } = data;

      const member = await db
        .select()
        .from(channelMembersTable)
        .where(
          and(
            eq(channelMembersTable.user_id, user.id),
            eq(channelMembersTable.channel_id, channelId),
          ),
        );

      if (!member.length) return;

      const inserted = await db
        .insert(messagesTable)
        .values({ channel_id: channelId, sender_id: user.id, content })
        .returning();

      const newMessage = inserted[0];
      if (!newMessage) return;

      const messageWithUser = {
        ...newMessage,
        created_at: newMessage.created_at.toISOString(),
        username: user.username,
      };

      io.to(channelId).emit("new_message", messageWithUser);
    });
  });
};
