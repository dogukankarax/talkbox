import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Hash, LogOut, Menu, Plus, UserPlus } from "lucide-react";

import CreateChannelModal from "@/components/CreateChannelModal";
import JoinChannelModal from "@/components/JoinChannelModal";
import { SortableChannelItem } from "@/components/SortableChannelItem";
import { getChannels, getMe, getToken, removeToken } from "@/lib/api";
import { useChannelOrderStore } from "@/lib/channelOrderStore";
import { useOnlineUsersStore } from "@/lib/onlineUsersStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useUIStore } from "@/lib/uiStore";
import { useUserStore } from "@/lib/userStore";
import { cn } from "@/lib/utils";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    const token = getToken();
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const order = useChannelOrderStore((s) => s.order);
  const setOrder = useChannelOrderStore((s) => s.setOrder);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);

  const handleLogout = () => {
    disconnectSocket();
    removeToken();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: getChannels,
  });

  const sortedChannels = channels
    ? [...channels].sort((a, b) => {
        const aIdx = order.indexOf(a.id);
        const bIdx = order.indexOf(b.id);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      })
    : [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedChannels.findIndex((c) => c.id === active.id);
    const newIndex = sortedChannels.findIndex((c) => c.id === over.id);

    const newOrder = arrayMove(sortedChannels, oldIndex, newIndex).map(
      (c) => c.id,
    );
    setOrder(newOrder);
  };

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("online_users", (userIds) => {
      useOnlineUsersStore.getState().setOnlineUsers(userIds);
    });
    socket.on("user_online", (userId) => {
      useOnlineUsersStore.getState().addOnlineUser(userId);
    });
    socket.on("user_offline", (userId) => {
      useOnlineUsersStore.getState().removeOnlineUser(userId);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <>
      <div className="h-screen flex bg-bg-deep">
        {!mobileSidebarOpen && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 bg-bg-panel border border-neon-purple/30 rounded-lg p-2 text-gray-400 hover:text-neon-cyan"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            "w-64 bg-bg-panel border-r border-neon-purple/20 flex flex-col",
            "lg:relative lg:translate-x-0",
            "fixed inset-y-0 left-0 z-40 transition-transform duration-300",
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="p-4 border-b border-neon-purple/20">
            <h2 className="font-mono text-2xl font-bold bg-linear-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
              TALKBOX
            </h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <Spinner className="py-8" />
            ) : channels?.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Hash className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No channels yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  Create or join one below
                </p>
              </div>
            ) : (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedChannels.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedChannels.map((channel) => (
                    <SortableChannelItem key={channel.id} channel={channel} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </nav>

          <div className="p-2 space-y-2 border-t border-neon-purple/20">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              NEW CHANNEL
            </Button>
            <Button
              onClick={() => setIsJoinOpen(true)}
              className="py-2 text-sm bg-linear-to-r! from-neon-cyan! to-neon-purple!"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              JOIN CHANNEL
            </Button>
          </div>

          <div className="p-3 border-t border-neon-purple/20 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-neon-pink to-neon-purple flex items-center justify-center font-mono text-xs font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-neon-pink transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <CreateChannelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinChannelModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />
    </>
  );
}
