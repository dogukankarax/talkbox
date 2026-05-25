import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes, Ref } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  ref?: Ref<HTMLLabelElement>;
};

export function Label({ className, ref, ...props }: LabelProps) {
  return (
    <label
      ref={ref}
      className={cn("block text-xs font-mono text-gray-400 mb-1", className)}
      {...props}
    />
  );
}
