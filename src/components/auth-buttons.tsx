import { SignInButton, UserButton } from "@clerk/clerk-react"
import { Button } from "./ui/button"
import { useAuth } from "../hooks/user-auth"
import { Loader2 } from "lucide-react"

export function AuthButtons() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <Button variant="ghost" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {!isSignedIn ? (
        <SignInButton mode="modal">
          <Button variant="default">
            Sign In
          </Button>
        </SignInButton>
      ) : (
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10"
            }
          }}
        />
      )}
    </div>
  )
}
