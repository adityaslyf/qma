import { Button } from "./ui/button"
import { useAuth } from "../hooks/user-auth"
import { Loader2, User } from "lucide-react"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function AuthButtons() {
  const { isSignedIn, isLoaded, signOut, signIn, fetchUserDetails, user } = useAuth()

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  const handleSignIn = () => {
    signIn("", (_, error) => {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full"
              >
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Email</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-xs text-muted-foreground">{user?.user_id}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
