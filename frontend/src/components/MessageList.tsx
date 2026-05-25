import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { Message } from "@talkbox/shared";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

type Props = {
  messages: Message[] | undefined;
  isLoading: boolean;
  currentUserId?: string;
};

export function MessageList({ messages, isLoading, currentUserId }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) return <Spinner className="py-12" />;

  if (messages?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-bg-panel border border-neon-purple/30 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-neon-cyan" />
        </div>
        <p className="text-gray-400 font-mono text-sm">No messages yet</p>
        <p className="text-gray-500 text-xs mt-1">
          Be the first to start the conversation
        </p>
      </div>
    );
  }

  return (
    <>
      {messages?.map((msg, index) => {
        const isOwn = msg.sender_id === currentUserId;
        const prevMsg = messages[index - 1];

        const isConsecutive =
          prevMsg?.sender_id === msg.sender_id &&
          new Date(msg.created_at).getTime() -
            new Date(prevMsg.created_at).getTime() <
            5 * 60 * 1000;

        return (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-2",
              isOwn ? "justify-end" : "justify-start",
              isConsecutive ? "mt-0.5" : "mt-3",
            )}
          >
            {!isOwn &&
              (isConsecutive ? (
                <div className="w-8 shrink-0" />
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-br from-neon-cyan to-neon-purple flex items-center justify-center font-mono text-xs font-bold text-white">
                  {msg.username[0]?.toUpperCase()}
                </div>
              ))}

            <div
              className={cn(
                "max-w-[70%] rounded-lg p-3",
                isOwn
                  ? "bg-linear-to-br from-neon-pink/20 to-neon-purple/20 border border-neon-pink/30"
                  : "bg-bg-panel/50 border border-neon-purple/10",
              )}
            >
              {!isConsecutive && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={cn(
                      "font-mono text-sm font-bold",
                      isOwn ? "text-neon-pink" : "text-neon-cyan",
                    )}
                  >
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <p className="text-gray-200">{msg.content}</p>
            </div>

            {isOwn &&
              (isConsecutive ? (
                <div className="w-8 shrink-0" />
              ) : (
                <div className="w-8 h-8 shrink-0 rounded-full bg-linear-to-br from-neon-pink to-neon-purple flex items-center justify-center font-mono text-xs font-bold text-white">
                  {msg.username[0]?.toUpperCase()}
                </div>
              ))}
          </motion.div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
}