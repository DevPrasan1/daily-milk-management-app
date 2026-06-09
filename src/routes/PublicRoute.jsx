import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ROLES } from '@/utils/constants'

export default function PublicRoute({ children }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <FullPageSpinner />

  if (user) {
    if (!userProfile?.role) return <Navigate to="/role-select" replace />
    if (!userProfile?.name) return <Navigate to="/onboarding" replace />
    if (userProfile.role === ROLES.SELLER) return <Navigate to="/seller" replace />
    return <Navigate to="/buyer" replace />
  }

  return children
}
