import ChannelSettingsModal from "@/components/ChannelSettingsModal";
import { MembersSidebar } from "@/components/MembersSidebar";
import { MessageInput } from "@/components/MessageInput";
import { MessageList } from "@/components/MessageList";
import { useChannelSocket } from "@/hooks/useChannelSocket";
import { getChannelMembers, getChannels, getMessages } from "@/lib/api";
import { useUIStore } from "@/lib/uiStore";
import { useUserStore } from "@/lib/userStore";
import type { Channel, ChannelMember } from "@talkbox/shared";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Hash, Settings, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/channels/$channelId")({
  component: ChannelView,
});

function ChannelView() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { channelId } = Route.useParams();
  const currentUser = useUserStore((state) => state.user);
  const setMobileMembersOpen = useUIStore((s) => s.setMobileMembersOpen);

  useChannelSocket(channelId, currentUser?.id);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", channelId],
    queryFn: () => getMessages(channelId),
  });

  const { data: members } = useQuery<ChannelMember[]>({
    queryKey: ["members", channelId],
    queryFn: () => getChannelMembers(channelId),
  });

  const { data: channels } = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: getChannels,
  });

  const currentChannel = channels?.find((c) => c.id === channelId);
  const currentMember = members?.find((m) => m.user_id === currentUser?.id);
  const isAdmin = currentMember?.role === "admin";

  return (
    <>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-neon-purple/20 px-6 py-4 bg-bg-panel/50 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:pl-0 pl-12">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center">
                  <Hash className="w-4 h-4 text-neon-cyan" />
                  <h2 className="font-mono text-lg font-bold text-white">
                    {currentChannel?.channel_name}
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {members?.length ?? 0} members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileMembersOpen(true)}
                className="lg:hidden text-gray-400 hover:text-neon-cyan transition-colors p-2"
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-400 hover:text-neon-cyan transition-colors p-2"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              currentUserId={currentUser?.id}
            />
          </div>

          <MessageInput channelId={channelId} />
        </div>

        <MembersSidebar
          channelId={channelId}
          inviteCode={currentChannel?.invite_code}
          members={members}
          isAdmin={isAdmin}
          currentUserId={currentUser?.id}
        />
      </div>
      {currentChannel && (
        <ChannelSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          channelId={channelId}
          channelName={currentChannel.channel_name}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}
