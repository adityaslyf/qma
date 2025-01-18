import { createContext, useContext } from 'react'
import { useAuth as useAuthHook } from '@/hooks/user-auth'

interface User {
  id: string;
  email: string;
  user_id: string;
  hasProfile?: boolean;
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
  const { userDetails, isLoaded } = useAuthHook()

  const value = {
    user: userDetails,
    loading: !isLoaded
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Export a custom hook for using the auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
} 