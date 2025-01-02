import { cn } from "@/lib/utils"

interface LoaderProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function Loader({ variant = 'spinner', size = 'md', text }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const variants = {
    spinner: (
      <div className={cn(
        "animate-spin rounded-full border-4 border-primary/30 border-t-primary",
        sizeClasses[size]
      )} />
    ),
    dots: (
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-bounce rounded-full bg-primary",
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4',
              `animation-delay-${i * 100}`
            )}
          />
        ))}
      </div>
    ),
    pulse: (
      <div className={cn(
        "animate-pulse rounded-full bg-primary/80",
        sizeClasses[size]
      )} />
    ),
    bars: (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-wave bg-primary",
              size === 'sm' ? 'h-3 w-1' : size === 'md' ? 'h-6 w-1.5' : 'h-8 w-2',
              `animation-delay-${i * 100}`
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {variants[variant]}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}
