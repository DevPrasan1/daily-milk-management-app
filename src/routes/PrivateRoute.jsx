import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ROLES } from '@/utils/constants'

export default function PrivateRoute({ children, role }) {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!userProfile?.role) return <Navigate to="/role-select" replace />
  if (!userProfile?.name) return <Navigate to="/onboarding" replace />
  if (role && userProfile.role !== role) {
    return <Navigate to={userProfile.role === ROLES.SELLER ? '/seller' : '/buyer'} replace />
  }

  return children
}
