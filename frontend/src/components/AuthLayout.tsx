import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-bg-deep relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-neon-purple/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-pink/30 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(184, 41, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 41, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-bg-panel/80 backdrop-blur-xl border border-neon-purple/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(184,41,255,0.3)]"
      >
        {children}
      </motion.div>
    </div>
  );
}
