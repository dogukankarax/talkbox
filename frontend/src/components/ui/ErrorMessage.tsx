import { cn } from "@/lib/utils";
import type { HTMLAttributes, Ref } from "react";

type ErrorMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  ref?: Ref<HTMLParagraphElement>;
  message?: string | null;
};

export function ErrorMessage({
  className,
  ref,
  message,
  ...props
}: ErrorMessageProps) {
  return (
    <p
      ref={ref}
      className={cn("text-xs text-neon-pink mt-1 h-4", className)}
      {...props}
    >
      {message || "\u00A0"}
    </p>
  );
}
