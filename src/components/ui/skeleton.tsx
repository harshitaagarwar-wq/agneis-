import type * as React from "react";
import { cn } from "@/src/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[#2B2D30]/80 border border-[#E8E8E8]/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
