import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

type ButtonProps = HTMLMotionProps<"button">;

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center gap-2 w-full py-3 rounded-lg font-mono font-bold text-white transition-all",
        "bg-linear-to-r from-neon-pink to-neon-purple",
        "hover:shadow-[0_0_30px_rgba(255,0,110,0.5)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
