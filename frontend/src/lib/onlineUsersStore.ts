import { create } from "zustand";

type OnlineUsersStore = {
  onlineUsers: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isOnline: (userId: string) => boolean;
};

export const useOnlineUsersStore = create<OnlineUsersStore>((set, get) => ({
  onlineUsers: new Set(),
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    })),
  removeOnlineUser: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),
  isOnline: (userId) => get().onlineUsers.has(userId),
}));
