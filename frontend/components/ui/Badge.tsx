import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold font-inter text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
