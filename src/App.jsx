// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage    from './pages/AuthPage'
import BillingPage from './pages/BillingPage'
import MainLayout  from './components/MainLayout'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return (
    <div style={{ background:'#0B1F3A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.4)', fontFamily:'monospace', fontSize:13 }}>
      Loading QMS Pro…
    </div>
  )
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth"    element={<AuthPage />} />
          <Route path="/billing" element={<RequireAuth><BillingPage /></RequireAuth>} />
          <Route path="/*"       element={<RequireAuth><MainLayout /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
