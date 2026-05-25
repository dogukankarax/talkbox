import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSocket } from "@/lib/socket";
import { Send } from "lucide-react";
import { useState } from "react";

type Props = { channelId: string };

export function MessageInput({ channelId }: Props) {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;
    const socket = getSocket();
    socket?.emit("send_message", { channelId, content: message });
    setMessage("");
  };

  return (
    <div className="border-t border-neon-purple/20 p-4 bg-bg-panel/50">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Type a message..."
        />
        <Button onClick={send} className="w-auto! px-6">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
