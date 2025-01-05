import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/user-auth'
import { useOkto } from "okto-sdk-react"

interface User {
  id: string;      
  email: string;   
  user_id: string; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: oktoUser, isSignedIn, isLoaded } = useAuth()
  const [loading, setLoading] = useState(true)
  const { isLoggedIn } = useOkto()

  // Immediately set user when oktoUser changes
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (oktoUser && isLoggedIn) {
      console.log('Setting user in auth context:', oktoUser)
      setUser(oktoUser)
    } else {
      console.log('Clearing user in auth context')
      setUser(null)
    }
  }, [oktoUser, isLoggedIn])

  useEffect(() => {
    console.log('Auth state changed:', { 
      oktoUser, 
      isSignedIn, 
      isLoaded,
      isLoggedIn,
      hasUser: !!oktoUser,
      currentUser: user // Add this to debug
    })

    if (isLoaded) {
      setLoading(false)
    }
  }, [oktoUser, isSignedIn, isLoaded, isLoggedIn, user])

  const value = {
    user, // Use the local state instead of computing it in the value
    loading: loading || !isLoaded
  }

  // Add this for debugging
  useEffect(() => {
    console.log('Auth context value:', {
      ...value,
      isLoggedIn,
      oktoUserExists: !!oktoUser,
      currentUser: user // Add this to debug
    })
  }, [value, isLoggedIn, oktoUser, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider')
  }
  return context
} 