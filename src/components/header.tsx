import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky flex justify-center top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-bold">QMA</div>
        <ThemeToggle />
      </div>
    </header>
  )
} 