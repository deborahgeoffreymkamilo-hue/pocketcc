import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  BarChart2, Wallet, Calendar, RefreshCw, CreditCard,
  Settings, HelpCircle, LogOut, Bell, Plus, Zap
} from 'lucide-react'
import { useState } from 'react'
import AddTransactionModal from './modals/AddTransactionModal'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
]

const secondaryItems = [
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/recurring', icon: RefreshCw, label: 'Recurring' },
  { to: '/debts', icon: CreditCard, label: 'Debts' },
]

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const [showAddTx, setShowAddTx] = useState(false)
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return { title: 'Dashboard', subtitle: "Here's your financial overview" }
    if (path === '/transactions') return { title: 'Transactions', subtitle: 'All your income & expenses' }
    if (path === '/budget') return { title: 'Budget', subtitle: 'Monthly spending limits' }
    if (path === '/goals') return { title: 'Savings Goals', subtitle: 'Track your targets' }
    if (path === '/insights') return { title: 'Insights', subtitle: 'Analytics & financial health' }
    if (path === '/accounts') return { title: 'Accounts', subtitle: 'Manage your accounts' }
    if (path === '/calendar') return { title: 'Calendar', subtitle: 'Financial events overview' }
    if (path === '/recurring') return { title: 'Recurring', subtitle: 'Scheduled transactions' }
    if (path === '/debts') return { title: 'Debts', subtitle: 'Loans & credit tracking' }
    if (path === '/settings') return { title: 'Settings', subtitle: 'Account & preferences' }
    return { title: 'Pocket', subtitle: 'Personal Finance' }
  }

  const { title, subtitle } = getPageTitle()
  const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ||
    user?.email?.[0]?.toUpperCase() || 'P'

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">P</div>
          <span className="sidebar-logo-text">Pocket</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}

          <span className="nav-section-label">Tools</span>
          {secondaryItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Settings size={18} className="nav-icon" />
            Settings
          </NavLink>
          <button
            className="nav-item"
            onClick={signOut}
            style={{ cursor: 'pointer', border: 'none', width: '100%', background: 'none', textAlign: 'left' }}
          >
            <LogOut size={18} className="nav-icon" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{title}</h1>
            <p className="topbar-subtitle">{subtitle}</p>
          </div>

          <div className="topbar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddTx(true)}
            >
              <Plus size={14} />
              Add Transaction
            </button>
            <button className="btn-icon btn btn-secondary" style={{ position: 'relative' }}>
              <Bell size={16} />
            </button>
            <NavLink to="/settings">
              <div className="avatar-fallback" style={{ cursor: 'pointer' }}>
                {initials}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <AddTransactionModal onClose={() => setShowAddTx(false)} />
      )}
    </div>
  )
}
