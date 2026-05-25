import { useUIStore } from "@/lib/uiStore";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Channel } from "@talkbox/shared";
import { Link } from "@tanstack/react-router";
import { GripVertical, Hash } from "lucide-react";

type Props = {
  channel: Channel;
};

export function SortableChannelItem({ channel }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center gap-1", isDragging && "opacity-50 z-50")}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-500 hover:text-neon-cyan cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <Link
        to="/channels/$channelId"
        params={{ channelId: channel.id }}
        onClick={() => useUIStore.getState().setMobileSidebarOpen(false)}
        className="flex gap-2 items-center py-2 px-3 rounded-lg text-gray-300 hover:bg-neon-purple/10 hover:text-white transition-colors flex-1"
        activeProps={{
          className:
            "!bg-neon-purple/20 !text-white shadow-[0_0_15px_rgba(184,41,255,0.3)]",
        }}
      >
        <Hash className="w-4 h-4 text-neon-cyan" />
        {channel.channel_name}
      </Link>
    </div>
  );
}
