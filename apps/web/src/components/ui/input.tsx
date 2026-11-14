import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-[#E8E8E8]/15 bg-[#121315] px-4 py-2 text-sm text-[#E8E8E8] placeholder:text-[#8A8D91] transition-colors focus-visible:outline-none focus-visible:border-[#E8E8E8]/40 focus-visible:ring-2 focus-visible:ring-[#E8E8E8]/25 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
