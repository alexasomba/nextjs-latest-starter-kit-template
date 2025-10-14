import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = HTMLAttributes<HTMLHRElement | HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  if (orientation === "horizontal") {
    return (
      <hr
        className={cn("shrink-0 bg-border h-px w-full", className)}
        {...props}
      />
    );
  }
  // Vertical separators use a div for layout
  return (
    <div
      aria-hidden="true"
      className={cn("shrink-0 bg-border h-full w-px", className)}
      {...props}
    />
  );
}
