import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import PublicRoute from '@/routes/PublicRoute'
import PrivateRoute from '@/routes/PrivateRoute'
import { ROLES } from '@/utils/constants'

import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import RoleSelect from '@/pages/RoleSelect'
import Onboarding from '@/pages/Onboarding'

import SellerDashboard from '@/pages/seller/SellerDashboard'
import SellerSettings from '@/pages/seller/SellerSettings'

import BuyerDashboard from '@/pages/buyer/BuyerDashboard'
import NearbySellers from '@/pages/buyer/NearbySellers'
import BuyerProfile from '@/pages/buyer/BuyerProfile'
import LinkRequest from '@/pages/buyer/LinkRequest'

import AddEditMilkBook from '@/pages/AddEditMilkBook'
import MilkBookDetail from '@/pages/MilkBookDetail'
import 'leaflet/dist/leaflet.css'

function Seller({ children }) {
  return <PrivateRoute role={ROLES.SELLER}>{children}</PrivateRoute>
}

function Buyer({ children }) {
  return <PrivateRoute role={ROLES.BUYER}>{children}</PrivateRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

              {/* Auth setup */}
              <Route path="/role-select" element={<RoleSelect />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Seller */}
              <Route path="/seller" element={<Seller><SellerDashboard /></Seller>} />
              <Route path="/seller/settings" element={<Seller><SellerSettings /></Seller>} />
              <Route path="/seller/nearby" element={<Seller><NearbySellers /></Seller>} />

              {/* Buyer */}
              <Route path="/buyer" element={<Buyer><BuyerDashboard /></Buyer>} />
              <Route path="/buyer/nearby" element={<Buyer><NearbySellers /></Buyer>} />
              <Route path="/buyer/profile" element={<Buyer><BuyerProfile /></Buyer>} />
              <Route path="/buyer/link-requests" element={<Buyer><LinkRequest /></Buyer>} />

              {/* Unified MilkBooks */}
              <Route path="/milkbooks/add" element={<PrivateRoute><AddEditMilkBook /></PrivateRoute>} />
              <Route path="/milkbooks/:milkbookId" element={<PrivateRoute><MilkBookDetail /></PrivateRoute>} />
              <Route path="/milkbooks/:milkbookId/edit" element={<PrivateRoute><AddEditMilkBook /></PrivateRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
