import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-2xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E8E8]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#E8E8E8] text-black hover:bg-white shadow-[0_0_20px_rgba(232,232,232,0.16)]",
        gunmetal:
          "bg-[#2B2D30] text-[#E8E8E8] border border-[#E8E8E8]/15 hover:border-[#E8E8E8]/35 hover:bg-[#34373b]",
        outline:
          "border border-[#E8E8E8]/20 bg-transparent text-[#E8E8E8] hover:border-[#E8E8E8]/40 hover:bg-[#2B2D30]/60",
        ghost: "text-[#C0C0C0] hover:text-[#E8E8E8] hover:bg-[#2B2D30]/70",
        destructive:
          "bg-red-950/70 text-red-200 border border-red-400/30 hover:bg-red-900/80",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
