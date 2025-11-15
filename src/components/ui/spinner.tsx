import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg"
  variant?: "default" | "primary" | "muted"
}

const spinnerVariants = {
  size: {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
  },
  variant: {
    default: "text-foreground",
    primary: "text-primary",
    muted: "text-muted-foreground",
  }
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
        <Loader2 
          className={cn(
            "animate-spin",
            spinnerVariants.size[size],
            spinnerVariants.variant[variant]
          )}
        />
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }