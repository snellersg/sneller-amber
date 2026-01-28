import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "secondary" | "destructive"
}

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-border bg-transparent text-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return React.createElement(
      "div",
      {
        ref,
        className: cn(
          "inline-flex items-center rounded-sm px-2 py-1 text-xs font-semibold transition-colors",
          badgeVariants[variant],
          className
        ),
        ...props
      }
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
