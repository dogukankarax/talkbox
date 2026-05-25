import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, Ref } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
};

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-3 bg-bg-deep/50 border border-neon-purple/20 rounded-lg",
        "text-white placeholder:text-gray-500",
        "focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,240,255,0.3)]",
        "transition-all",
        className,
      )}
      {...props}
    />
  );
}
