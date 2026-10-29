import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAccounts, getTransactions, getMonthlyStats } from '../lib/api'
import { formatCurrency, getCurrentMonth, formatDate, TRANSACTION_TYPES } from '../lib/utils'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Plus, Zap
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import AddTransactionModal from '../components/modals/AddTransactionModal'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card" style={{ padding: '12px 16px', border: '1px solid var(--border-primary)', minWidth: 160 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [stats, setStats] = useState({ income: 0, expenses: 0, saved: 0, savingsRate: 0 })
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddTx, setShowAddTx] = useState(false)
  const currency = profile?.currency || 'TZS'
  const currentMonth = getCurrentMonth()

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    const [accsRes, txRes, statsRes] = await Promise.all([
      getAccounts(user.id),
      getTransactions({ userId: user.id, limit: 10 }),
      getMonthlyStats(user.id, currentMonth)
    ])

    if (accsRes.data) setAccounts(accsRes.data)
    if (txRes.data) setRecentTx(txRes.data)
    if (statsRes.data) setStats(statsRes.data)

    // Generate trend data (last 7 days)
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        income: Math.random() * 300000,
        expenses: Math.random() * 200000
      })
    }
    setTrendData(days)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user])

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const firstName = profile?.full_name?.split(' ')?.[0] || 'there'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div className="card card-gradient card-glow" style={{ padding: '28px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 4 }}>
              Welcome back, <span style={{ color: 'var(--neon-purple)' }}>{firstName}</span> 👋
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Here's your portfolio overview</p>
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Balance</p>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
                {formatCurrency(totalBalance, currency)}
              </h2>
            </div>
          </div>
          <div style={{
            background: 'rgba(139,92,246,0.1)', borderRadius: 16,
            padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4,
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Savings Rate</span>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6' }}>
              {stats.savingsRate}%
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {[
            { label: 'Add Income', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Add Expense', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Transfer', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
            { label: 'Add Goal', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
          ].map(({ label, color, bg }) => (
            <button
              key={label}
              onClick={() => setShowAddTx(true)}
              style={{
                background: bg, border: `1px solid ${color}30`,
                borderRadius: 20, padding: '6px 14px',
                color, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <TrendingUp size={20} color="#10B981" />
          </div>
          <p className="stat-label">Monthly Income</p>
          <p className="stat-value text-green">{formatCurrency(stats.income, currency)}</p>
          <p className="stat-change text-green"><ArrowUpRight size={12} /> This month</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <TrendingDown size={20} color="#EF4444" />
          </div>
          <p className="stat-label">Monthly Expenses</p>
          <p className="stat-value text-red">{formatCurrency(stats.expenses, currency)}</p>
          <p className="stat-change text-red"><ArrowDownRight size={12} /> This month</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <PiggyBank size={20} color="#8B5CF6" />
          </div>
          <p className="stat-label">Amount Saved</p>
          <p className="stat-value text-purple">{formatCurrency(stats.saved, currency)}</p>
          <p className="stat-change text-purple"><Zap size={12} /> {stats.savingsRate}% rate</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)' }}>
            <Wallet size={20} color="#06B6D4" />
          </div>
          <p className="stat-label">Accounts</p>
          <p className="stat-value" style={{ color: '#06B6D4' }}>{accounts.length}</p>
          <p className="stat-change" style={{ color: '#06B6D4' }}>Active accounts</p>
        </div>
      </div>

      {/* Main Grid: Chart + Recent Tx */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Portfolio Performance</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1D', '1W', '1M', '6M', '1Y'].map(p => (
                <button key={p} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: p === '1W' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                  border: 'none', color: p === '1W' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}>{p}</button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#8B5CF6" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Accounts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>My Accounts</h3>
            <button style={{ fontSize: 12, color: 'var(--neon-purple)', background: 'none', border: 'none', cursor: 'pointer' }}>
              See all
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <Wallet size={32} color="var(--text-muted)" />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No accounts yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {accounts.slice(0, 4).map(acc => (
                <div key={acc.id} style={{
                  background: 'var(--bg-input)', borderRadius: 12, padding: 14,
                  border: '1px solid var(--border-card)'
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, marginBottom: 10,
                    background: `${acc.color || '#8B5CF6'}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Wallet size={16} color={acc.color || '#8B5CF6'} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{acc.name}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: acc.color || '#8B5CF6' }}>
                    {formatCurrency(acc.balance, acc.currency || currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Transactions</h3>
          <button
            onClick={() => setShowAddTx(true)}
            className="btn btn-primary btn-sm"
          ><Plus size={14} /> Add</button>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><TrendingUp size={28} /></div>
            <p className="empty-title">No transactions yet</p>
            <p className="empty-description">Start tracking your income and expenses to see them here.</p>
            <button className="btn btn-primary" onClick={() => setShowAddTx(true)}>
              <Plus size={16} /> Add First Transaction
            </button>
          </div>
        ) : (
          <div className="transaction-list">
            {recentTx.map(tx => {
              const typeInfo = TRANSACTION_TYPES[tx.type] || {}
              const cat = tx.categories
              return (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-icon" style={{
                    background: cat?.color ? `${cat.color}20` : 'rgba(139,92,246,0.1)'
                  }}>
                    <span style={{ fontSize: 16 }}>
                      {cat?.icon ? '💰' : tx.type === 'income' ? '📈' : tx.type === 'expense' ? '📉' : '↔️'}
                    </span>
                  </div>
                  <div className="transaction-info">
                    <p className="transaction-desc">{tx.description || cat?.name || 'Transaction'}</p>
                    <div className="transaction-meta">
                      <span>{cat?.name || tx.type}</span>
                      <span>•</span>
                      <span>{formatDate(tx.transaction_date, 'short')}</span>
                    </div>
                  </div>
                  <div>
                    <p className="transaction-amount" style={{ color: typeInfo.color }}>
                      {typeInfo.sign}{formatCurrency(tx.amount, currency)}
                    </p>
                    <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddTx && <AddTransactionModal onClose={() => { setShowAddTx(false); fetchData() }} />}
    </div>
  )
}
