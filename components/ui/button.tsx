import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9",
        wide: "h-14 px-7 rounded-full",
      },
      svgSize: {
        none: "",
        xs: "[&_svg]:size-3",
        sm: "[&_svg]:size-4",
        md: "[&_svg]:size-5",
        lg: "[&_svg]:size-6",
        xl: "[&_svg]:size-8",
        "2xl": "[&_svg]:size-10",
        "3xl": "[&_svg]:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      svgSize: "none",
    },
  }
);

function Button({
  className,
  variant,
  size,
  svgSize,
  enableSvgRules = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    enableSvgRules?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  const svgRulesClass = enableSvgRules
    ? "[&_svg]:pointer-events-none [&_svg]:shrink-0"
    : "";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, svgSize }),
        svgRulesClass,
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
