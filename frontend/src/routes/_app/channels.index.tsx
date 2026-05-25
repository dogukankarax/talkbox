import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/_app/channels/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full flex items-center justify-center bg-bg-deep relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bg-panel border border-neon-purple/30 mb-6">
          <MessageSquare className="w-10 h-10 text-neon-cyan" />
        </div>

        <h1 className="font-mono text-4xl font-bold bg-linear-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent mb-3">
          WELCOME TO TALKBOX
        </h1>

        <p className="text-gray-400 text-sm max-w-md">
          Select a channel from the sidebar to start chatting, or create a new
          one to invite your friends.
        </p>
      </motion.div>
    </div>
  );
}
