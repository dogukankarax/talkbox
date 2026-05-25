import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChannelOrderStore = {
  order: string[];
  setOrder: (order: string[]) => void;
};

export const useChannelOrderStore = create<ChannelOrderStore>()(
  persist(
    (set) => ({
      order: [],
      setOrder: (order) => set({ order }),
    }),
    { name: "channel-order" },
  ),
);