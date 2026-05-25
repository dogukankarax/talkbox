import { getSocket } from "@/lib/socket";
import type { Message } from "@talkbox/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function useChannelSocket(channelId: string, currentUserId?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const joinChannel = () => {
      socket.emit("join_channel", channelId);
    };

    if (socket.connected) {
      joinChannel();
    } else {
      socket.once("connect", joinChannel);
    }

    const handleNewMessage = (message: Message) => {
      queryClient.setQueryData<Message[]>(["messages", channelId], (old) => {
        return old ? [...old, message] : [message];
      });
    };

    const handleChannelUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    };

    const handleChannelDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      navigate({ to: "/channels" });
    };

    const handleMemberJoined = () => {
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
    };

    const handleMemberLeft = () => {
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
    };

    const handleMemberRemoved = (data: { userId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
      if (data.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["channels"] });
        navigate({ to: "/channels" });
      }
    };

    const handleRoleUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("channel_updated", handleChannelUpdated);
    socket.on("channel_deleted", handleChannelDeleted);
    socket.on("member_joined", handleMemberJoined);
    socket.on("member_left", handleMemberLeft);
    socket.on("member_removed", handleMemberRemoved);
    socket.on("member_role_updated", handleRoleUpdated);

    return () => {
      socket.emit("leave_channel", channelId);
      socket.off("new_message", handleNewMessage);
      socket.off("channel_updated", handleChannelUpdated);
      socket.off("channel_deleted", handleChannelDeleted);
      socket.off("member_joined", handleMemberJoined);
      socket.off("member_left", handleMemberLeft);
      socket.off("member_removed", handleMemberRemoved);
      socket.off("member_role_updated", handleRoleUpdated);
      socket.off("connect", joinChannel);
    };
  }, [channelId, currentUserId, queryClient, navigate]);
}