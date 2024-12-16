import { ThemeProvider } from "./components/theme-provider"
import { Header } from "./components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Mail } from "lucide-react"
import { CountdownTimer } from "./components/countdown-timer"
import { useEmailSubscription } from "@/hooks/useEmailSubscription"
import { useState } from "react"
import { SignedIn, SignedOut } from "@clerk/clerk-react"

function App() {
  const [email, setEmail] = useState("")
  const { subscribeEmail, loading, error, success } = useEmailSubscription()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      await subscribeEmail(email)
      if (success) setEmail("")
    }
  }

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="px-4 flex flex-col items-center justify-center min-h-[80vh] py-8">
          <SignedOut>
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Sign in to access the full features</CardDescription>
              </CardHeader>
            </Card>
          </SignedOut>
          <SignedIn>
            <Card className="w-full max-w-md transform transition-all hover:scale-[1.01] hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-lg animate-pulse" />
              <CardHeader className="text-center space-y-4 pb-2">
                <div className="relative">
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <CardTitle className="text-4xl sm:text-5xl leading-[3.5rem] sm:leading-[5rem] font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Coming Soon
                  </CardTitle>
                </div>
                <CardDescription className="text-base sm:text-lg">
                  We're crafting something extraordinary for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-center text-muted-foreground text-sm px-2">
                    Join our exclusive launch list and be the first to experience it
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000" />
                      <div className="relative flex flex-col sm:flex-row w-full gap-2">
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 pt-2 pb-1 mb-1 border-primary/20"
                          required
                        />
                        <Button className="relative overflow-hidden w-full sm:w-auto">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30 animate-pulse" />
                          <Mail className="mr-2 h-4 w-4" />
                          {loading ? "Subscribing..." : "Notify Me"}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1">{`Email already subscribed`}</p>
                    )}
                    {success && (
                      <p className="text-sm text-green-600 dark:text-green-400 text-center animate-in fade-in slide-in-from-top-1">
                        Thanks for subscribing!
                      </p>
                    )}
                  </form>
                  <div className="pt-4 border-t border-primary/10">
                    <CountdownTimer />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SignedIn>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
