import type { ChannelMember, Message } from "./types.js";

export interface ServerToClientEvents {
  online_users: (userIds: string[]) => void;
  user_online: (userId: string) => void;
  user_offline: (userId: string) => void;
  new_message: (message: Message) => void;
  channel_updated: (channel: { id: string; channel_name: string }) => void;
  channel_deleted: (data: { channelId: string }) => void;
  member_joined: (data: {
    channelId: string;
    userId: string;
    username: string;
  }) => void;
  member_left: (data: { channelId: string; userId: string }) => void;
  member_removed: (data: { channelId: string; userId: string }) => void;
  member_role_updated: (data: {
    channelId: string;
    userId: string;
    role: ChannelMember["role"];
  }) => void;
}

export interface ClientToServerEvents {
  join_channel: (channelId: string) => void;
  leave_channel: (channelId: string) => void;
  send_message: (data: { channelId: string; content: string }) => void;
}

export interface SocketData {
  user: { id: string; email: string; username: string };
}
