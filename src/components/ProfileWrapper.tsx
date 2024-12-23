import { ProtectedRoute } from './protected-route'
import Profile from '../pages/Profile'

const ProfileWrapper = () => (
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
)

export default ProfileWrapper 