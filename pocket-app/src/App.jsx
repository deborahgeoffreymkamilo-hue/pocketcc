import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Trade from './pages/Trade'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Insights from './pages/Insights'
import Accounts from './pages/Accounts'
import Calendar from './pages/Calendar'
import Recurring from './pages/Recurring'
import Debts from './pages/Debts'
import Settings from './pages/Settings'
import LoadingScreen from './components/LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={
        <PublicRoute><AuthPage /></PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="market" element={<Market />} />
        <Route path="trade" element={<Trade />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budget" element={<Budget />} />
        <Route path="goals" element={<Goals />} />
        <Route path="insights" element={<Insights />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="debts" element={<Debts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
