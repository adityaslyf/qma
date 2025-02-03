import { ThemeToggle } from "./theme-toggle"
import { AuthButtons } from "./auth-buttons"

export function Header() {
  return (
    <header>
      <div>
        <div>QMA</div>
        <div>
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  )
} 