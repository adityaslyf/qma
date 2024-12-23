import { ThemeProvider } from "./components/theme-provider"
import { Header } from "./components/header"
import Profile from "./pages/Profile"
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <Profile />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-background text-foreground border border-border',
            success: {
              className: 'bg-background text-foreground border-green-500',
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
            },
            error: {
              className: 'bg-background text-foreground border-red-500',
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
