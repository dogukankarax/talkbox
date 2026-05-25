import { removeMember, updateMemberRole } from "@/lib/api";
import { useOnlineUsersStore } from "@/lib/onlineUsersStore";
import { useUIStore } from "@/lib/uiStore";
import { cn } from "@/lib/utils";
import type { ChannelMember } from "@talkbox/shared";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Shield, ShieldMinus, ShieldPlus, UserX } from "lucide-react";
import { toast } from "sonner";

type Props = {
  channelId: string;
  inviteCode?: string;
  members: ChannelMember[] | undefined;
  isAdmin: boolean;
  currentUserId?: string;
};

export function MembersSidebar({
  channelId,
  inviteCode,
  members,
  isAdmin,
  currentUserId,
}: Props) {
  const queryClient = useQueryClient();
  const onlineUsers = useOnlineUsersStore((s) => s.onlineUsers);
  const mobileMembersOpen = useUIStore((s) => s.mobileMembersOpen);
  const setMobileMembersOpen = useUIStore((s) => s.setMobileMembersOpen);
  const isOnline = (userId: string) => onlineUsers.has(userId);

  const handlePromote = async (userId: string) => {
    try {
      await updateMemberRole(channelId, userId, "admin");
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
      toast.success("Promoted to admin");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      await updateMemberRole(channelId, userId, "member");
      queryClient.invalidateQueries({ queryKey: ["members", channelId] });
      toast.success("Removed admin role");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const handleRemove = (userId: string) => {
    toast("Remove this member?", {
      action: {
        label: "Remove",
        onClick: async () => {
          try {
            await removeMember(channelId, userId);
            queryClient.invalidateQueries({ queryKey: ["members", channelId] });
            toast.success("Member removed");
          } catch (error) {
            if (error instanceof Error) toast.error(error.message);
          }
        },
      },
    });
  };

  return (
    <>
      {mobileMembersOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMembersOpen(false)}
        />
      )}
      <aside
        className={cn(
          "w-64 bg-bg-panel border-l border-neon-purple/20 flex flex-col",
          "lg:relative lg:translate-x-0 lg:flex",
          "fixed inset-y-0 right-0 z-40 transition-transform duration-300",
          mobileMembersOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0",
        )}
      >
        {inviteCode && (
          <div className="p-4 border-b border-neon-purple/20">
            <p className="font-mono text-xs text-gray-500 mb-1">INVITE CODE</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm text-neon-cyan bg-bg-deep/50 px-2 py-1 rounded">
                {inviteCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode);
                  toast.success("Invite code copied!");
                }}
                className="text-neon-pink hover:text-neon-cyan transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-mono text-xs text-gray-500 mb-3">
            MEMBERS — {members?.length ?? 0}
          </h3>
          <ul className="space-y-2">
            {members?.map((member) => (
              <li
                key={member.user_id}
                className="flex items-center gap-2 text-sm group"
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    isOnline(member.user_id)
                      ? "bg-neon-cyan shadow-[0_0_8px_#00f0ff]"
                      : "bg-gray-600",
                  )}
                />
                <span className="text-gray-300 truncate flex-1">
                  {member.username}
                </span>
                {isAdmin && member.user_id !== currentUserId && (
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity shrink-0">
                    {member.role === "member" ? (
                      <button
                        onClick={() => handlePromote(member.user_id)}
                        className="text-gray-400 hover:text-neon-cyan"
                        title="Promote to admin"
                      >
                        <ShieldPlus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDemote(member.user_id)}
                        className="text-gray-400 hover:text-neon-pink"
                        title="Remove admin"
                      >
                        <ShieldMinus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemove(member.user_id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove from channel"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {member.role === "admin" && (
                  <Shield className="w-3 h-3 text-neon-pink shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}