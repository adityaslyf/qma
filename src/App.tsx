import { ThemeProvider } from "./components/theme-provider"
import { Header } from "./components/header"
import Profile from "./pages/Profile"

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Profile />
      </div>
    </ThemeProvider>
  )
}

export default App
