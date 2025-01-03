import { Button } from "./ui/button"
import { useAuth } from "../hooks/user-auth"
import { Loader2, User } from "lucide-react"

export function AuthButtons() {
  const { isSignedIn, isLoaded, signOut, signIn } = useAuth()

  const handleSignIn = () => {
    signIn("", (result, error) => {
      if (error) {
        console.error('Authentication failed:', error)
      }
    })
  }

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
        <Button variant="default" onClick={handleSignIn}>
          Sign In
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full"
          >
            <User className="h-6 w-6" />
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      )}
    </div>
  )
}
