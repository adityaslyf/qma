import { ProtectedRoute } from './protected-route'
import Profile from '../pages/Profile'

export default function ProfileWrapper() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  )
} 