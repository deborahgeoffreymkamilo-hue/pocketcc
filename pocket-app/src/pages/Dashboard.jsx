import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAccounts, getTransactions, getMonthlyStats } from '../lib/api'
import { formatCurrency, getCurrentMonth, formatDate, TRANSACTION_TYPES } from '../lib/utils'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Plus, Zap, Sparkles, ChevronDown, ArrowRight
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import AddTransactionModal from '../components/modals/AddTransactionModal'

const portfolioItems = [
  { symbol: 'AAPL', name: 'Apple Inc.', value: 1721.30, gain: 12.31, gainPct: 0.7, units: 10.4, icon: '🍎' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', value: 1721.30, gain: 12.31, gainPct: 0.7, units: 12.0, icon: '📦' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', value: 1721.30, gain: 12.31, gainPct: 0.7, units: 41.0, icon: '🪟' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', value: 1721.30, gain: 12.31, gainPct: 0.7, units: 15.0, icon: '⚡' },
]

const watchlistItems = [
  { symbol: 'Spotify', ticker: 'NYSE: SPOT', price: 11.77, change: 6.31, icon: '🎧' },
  { symbol: 'Amazon', ticker: 'NYSE: AMZN', price: 10280.80, change: 8.11, icon: '📦' },
  { symbol: 'MSFT', ticker: 'NYSE: MSFT', price: 8110.20, change: 4.89, icon: '🪟' },
  { symbol: 'NVDA', ticker: 'NYSE: NVDA', price: 2110.20, change: 2.12, icon: '⚡' },
]

// Glowing pink wave matching the Helios Fintech showcase in the PNG
const performanceCurve = [
  { month: 'Jan', value: 195000 },
  { month: 'Feb', value: 175000 },
  { month: 'Mar', value: 140000 },
  { month: 'Apr', value: 135000 },
  { month: 'May', value: 170000 },
  { month: 'Jun', value: 165000, highlight: true },
  { month: 'Jul', value: 130000 },
  { month: 'Aug', value: 165000 },
  { month: 'Sep', value: 140000 },
  { month: 'Oct', value: 95000 },
  { month: 'Nov', value: 135000 },
  { month: 'Dec', value: 140000 }
]

const PerformanceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid var(--neon-pink)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 0 20px rgba(236,72,153,0.3)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>1st Jun 2026</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>
          ${payload[0].value.toLocaleString()}
        </p>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: 10 }}>
          +13.2%
        </span>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [stats, setStats] = useState({ income: 0, expenses: 0, saved: 0, savingsRate: 0 })
  const [watchlistFilter, setWatchlistFilter] = useState('Most Viewed')
  const [timeframe, setTimeframe] = useState('1Y')
  const [holdingTimeframe, setHoldingTimeframe] = useState('6M')
  const [showAddTx, setShowAddTx] = useState(false)
  const [loading, setLoading] = useState(true)

  const currency = profile?.currency || 'TZS'
  const currentMonth = getCurrentMonth()

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    const [accsRes, txRes, statsRes] = await Promise.all([
      getAccounts(user.id),
      getTransactions({ userId: user.id, limit: 6 }),
      getMonthlyStats(user.id, currentMonth)
    ])

    if (accsRes.data) setAccounts(accsRes.data)
    if (txRes.data) setRecentTx(txRes.data)
    if (statsRes.data) setStats(statsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const firstName = profile?.full_name?.split(' ')?.[0] || 'Nadia'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Welcome Header (Helios design) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>
            Welcome, <span className="neon-text">{firstName}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Here's your investment portfolio overview</p>
        </div>

        {/* Top category pill filters */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Market', 'Wallet', 'Tools'].map((tab, i) => (
            <button
              key={tab}
              className="btn btn-sm"
              onClick={() => {
                if (tab === 'Market') navigate('/market')
                if (tab === 'Wallet') navigate('/accounts')
                if (tab === 'Tools') navigate('/insights')
              }}
              style={{
                borderRadius: 20,
                background: i === 0 ? 'var(--gradient-primary)' : 'var(--bg-input)',
                color: i === 0 ? 'white' : 'var(--text-secondary)',
                border: i === 0 ? 'none' : '1px solid var(--border-card)',
                padding: '8px 18px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Top Grid: Total Holding + Watchlist + My Portfolio (Matching PNG) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.5fr', gap: 20 }}>
        {/* Left Column: Total Holding & Decisions Powered by Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Total Holding */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Holding</span>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 10px', fontSize: 12, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {holdingTimeframe} <ChevronDown size={12} />
              </button>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
              ${(12304.11).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Combined Liquid Reserves: {formatCurrency(totalBalance, currency)}
            </div>
          </div>

          {/* Decisions Powered by Data (AI Nebula Card) */}
          <div
            className="card card-glow"
            style={{
              padding: 22,
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Decisions Powered by Data</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 18 }}>
              Move beyond guesswork with AI-driven investment insights tailored to your strategy.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/insights')}
              style={{
                borderRadius: 20,
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 15px rgba(139,92,246,0.6)'
              }}
            >
              <Sparkles size={14} /> Explore AI Insights
            </button>
          </div>
        </div>

        {/* Middle Column: Watchlist (Most Viewed, Gain, Lose) */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Watchlist</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Most Viewed', 'Gain', 'Lose'].map(pill => (
                <button
                  key={pill}
                  onClick={() => setWatchlistFilter(pill)}
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 14,
                    background: watchlistFilter === pill ? 'var(--gradient-primary)' : 'transparent',
                    color: watchlistFilter === pill ? 'white' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {watchlistItems.map(item => (
              <div
                key={item.symbol}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '6px 0'
                }}
                onClick={() => navigate('/market')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{item.symbol}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.ticker}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>
                    ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>
                    +{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: My Portfolio (Cards grid matching PNG) */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>My Portfolio</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/market')}
                style={{ fontSize: 11, padding: '3px 8px' }}
              >
                See all
              </button>
              <button
                className="btn-icon btn btn-ghost"
                onClick={() => navigate('/trade')}
                style={{ width: 26, height: 26 }}
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {portfolioItems.map(item => (
              <div
                key={item.symbol}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 14,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'border 0.2s'
                }}
                onClick={() => navigate('/trade')}
              >
                <div style={{ fontSize: 15, fontWeight: 800 }}>
                  ${item.value.toLocaleString('en-US', { minimumFractionDigits: 1 })}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#10B981', marginTop: 2 }}>
                  +{item.gain} ({item.gainPct}%)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, display: 'block' }}>{item.symbol}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Units {item.units}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Performance Chart (Helios Neon Magenta Curve) */}
      <div className="card neon-border" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Portfolio Performance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Historic return trajectory and milestone targets</p>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['1D', '1W', '1M', '6M', '1Y'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: timeframe === tf ? 'var(--gradient-primary)' : 'var(--bg-input)',
                  color: timeframe === tf ? 'white' : 'var(--text-muted)',
                  border: timeframe === tf ? 'none' : '1px solid var(--border-card)',
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 220, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="neonPinkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip content={<PerformanceTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                strokeWidth={3}
                fill="url(#neonPinkGrad)"
                dot={{ stroke: '#EC4899', strokeWidth: 2, r: 3, fill: '#1A1A2E' }}
                activeDot={{ stroke: '#FFFFFF', strokeWidth: 3, r: 6, fill: '#EC4899' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Breakdown + Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        {/* Assets List (from Mobile screen 1 in PNG) */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Your Assets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Stocks', value: 6521.20, change: 8.4, icon: '📈', color: '#8B5CF6' },
              { name: 'Crypto', value: 3240.75, change: 12.3, icon: '₿', color: '#EC4899' },
              { name: 'ETFs', value: 1540.32, change: 6.7, icon: '🏛️', color: '#06B6D4' },
              { name: 'Cash & Mobile Money', value: 1001.84, change: 0.0, icon: '💵', color: '#10B981' },
            ].map(asset => (
              <div key={asset.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: `${asset.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                  }}>
                    {asset.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{asset.name}</p>
                    <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>+{asset.change}%</p>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>
                  ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Activities</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTx(true)}>
              <Plus size={14} /> Add Transaction
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No logged transactions yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentTx.map(tx => (
                <div key={tx.id} className="transaction-item" style={{ padding: '8px 10px' }}>
                  <div className="transaction-info">
                    <p className="transaction-desc" style={{ fontSize: 13 }}>{tx.description}</p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(tx.transaction_date, 'short')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: tx.type === 'income' ? '#10B981' : '#EF4444'
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddTx && (
        <AddTransactionModal
          onClose={() => setShowAddTx(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
