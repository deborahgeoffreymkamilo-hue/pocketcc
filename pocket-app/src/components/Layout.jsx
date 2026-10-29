import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import {
  LayoutDashboard, ArrowLeftRight, PieChart, Target,
  BarChart2, Wallet, Calendar, RefreshCw, CreditCard,
  Settings, LogOut, Bell, Plus, Sparkles, TrendingUp, Search, User,
  FileText, Home, MoreHorizontal, Globe
} from 'lucide-react'
import { useState } from 'react'
import AddTransactionModal from './modals/AddTransactionModal'
import NotificationsModal from './NotificationsModal'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/market', icon: TrendingUp, label: 'Market' },
  { to: '/trade', icon: ArrowLeftRight, label: 'Trade Desk' },
  { to: '/accounts', icon: Wallet, label: 'Portfolio' },
  { to: '/insights', icon: BarChart2, label: 'AI Insights' },
  { to: '/goals', icon: Target, label: 'Goals' },
]

const secondaryItems = [
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/recurring', icon: RefreshCw, label: 'Recurring' },
  { to: '/debts', icon: CreditCard, label: 'Debts' },
]

export default function Layout() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const [showAddTx, setShowAddTx] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const currency = profile?.currency || 'TZS'

  const toggleCurrency = () => {
    updateProfile({ currency: currency === 'TZS' ? 'USD' : 'TZS' })
  }

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'sw' : 'en')
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return { title: 'Dashboard', subtitle: "Here's your investment portfolio overview" }
    if (path === '/market') return { title: 'Market', subtitle: 'Live equities, cryptos & DSE assets' }
    if (path === '/trade') return { title: 'Trade Desk', subtitle: 'Execute market and limit orders' }
    if (path === '/transactions') return { title: 'Transactions', subtitle: 'All your income & expenses' }
    if (path === '/budget') return { title: 'Budget', subtitle: 'Monthly category limits' }
    if (path === '/goals') return { title: 'Savings Goals', subtitle: 'Track your targets' }
    if (path === '/insights') return { title: 'AI Insights', subtitle: 'Analytics & Helios financial intelligence' }
    if (path === '/accounts') return { title: 'Accounts & Portfolio', subtitle: 'M-Pesa, Banks & liquid reserves' }
    if (path === '/reports') return { title: 'Reports & Statements', subtitle: 'Monthly audit & cashflow statement' }
    if (path === '/calendar') return { title: 'Calendar', subtitle: 'Upcoming bills & cashflow events' }
    if (path === '/recurring') return { title: 'Recurring', subtitle: 'Scheduled payments & subscriptions' }
    if (path === '/debts') return { title: 'Debts', subtitle: 'Loans & money borrowed/lent' }
    if (path === '/settings') return { title: 'Settings', subtitle: 'Account preferences & security' }
    return { title: 'Pocket', subtitle: 'Personal Finance' }
  }

  const { title, subtitle } = getPageTitle()
  const displayName = profile?.full_name || 'Nadia Rashid'
  const email = user?.email || 'nadia.rashid@gmail.com'
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const handleGlobalSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate('/insights', { state: { initialPrompt: searchQuery } })
    setSearchQuery('')
  }
  }

  return (
    <div className="app-layout">
      {/* Sidebar for Desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">H</div>
          <div>
            <span className="sidebar-logo-text">Helios</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', letterSpacing: 0.5 }}>INVESTMENTS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Investments</span>
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

          <span className="nav-section-label">Pocket Tools</span>
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

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar matching Helios Showcase in PNG */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{title}</h1>
            <p className="topbar-subtitle">{subtitle}</p>
          </div>

          {/* Center search: "Ask Helios.ai anything..." */}
          <form onSubmit={handleGlobalSearch} style={{ flex: 1, maxWidth: 360, margin: '0 20px' }}>
            <div className="form-input-icon">
              <Sparkles size={15} className="input-icon" color="var(--neon-purple)" />
              <input
                type="text"
                className="form-input"
                placeholder="Ask Helios.ai anything..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ borderRadius: 20, paddingLeft: 38, fontSize: 13, background: 'var(--bg-input)' }}
              />
            </div>
          </form>

          {/* Right User Bar */}
          <div className="topbar-right">
            {/* Quick Currency & Language Switchers */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleCurrency}
              style={{ borderRadius: 16, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
              title="Switch Base Currency (TZS / USD)"
            >
              {currency}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleLanguage}
              style={{ borderRadius: 16, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}
              title="Badili Lugha / Switch Language"
            >
              <Globe size={12} style={{ display: 'inline', marginRight: 4 }} />
              {lang.toUpperCase()}
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddTx(true)}
              style={{ borderRadius: 20 }}
            >
              <Plus size={14} /> Add Transaction
            </button>

            <button
              className="btn-icon btn btn-secondary"
              onClick={() => setShowNotifications(true)}
              style={{ borderRadius: '50%', position: 'relative' }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                background: 'var(--neon-pink)', borderRadius: '50%'
              }} />
            </button>

            <NavLink to="/settings" className="btn-icon btn btn-secondary" style={{ borderRadius: '50%' }}>
              <Settings size={16} />
            </NavLink>

            {/* Profile Avatar Pill matching PNG */}
            <div
              onClick={() => navigate('/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <div className="avatar-fallback" style={{ width: 32, height: 32, fontSize: 12 }}>
                {initials}
              </div>
              <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="user-text">
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{displayName}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Matching exact PNG bottom row: Home, Portfolio, Trade, AI, More) */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Home size={18} className="nav-icon" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/accounts" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Wallet size={18} className="nav-icon" />
          <span>Portfolio</span>
        </NavLink>

        <NavLink to="/trade" className="bottom-nav-action" title="Trade">
          <Plus size={22} />
        </NavLink>

        <NavLink to="/insights" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Sparkles size={18} className="nav-icon" />
          <span>AI</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <MoreHorizontal size={18} className="nav-icon" />
          <span>More</span>
        </NavLink>
      </nav>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <AddTransactionModal onClose={() => setShowAddTx(false)} />
      )}

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </div>
  )
}
