import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getBudget, createOrUpdateBudget, setBudgetCategory, deleteBudgetCategory, getCategories, getTransactions } from '../lib/api'
import { formatCurrency, getCurrentMonth, getMonthDateRange, getProgressColor } from '../lib/utils'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'

export default function Budget() {
  const { user, profile } = useAuth()
  const [budget, setBudget] = useState(null)
  const [categories, setCategories] = useState([])
  const [spendingByCategory, setSpendingByCategory] = useState({})
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ category_id: '', limit_amount: '' })
  const currency = profile?.currency || 'TZS'

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    const [budgetRes, catsRes] = await Promise.all([
      getBudget(user.id, currentMonth),
      getCategories(user.id, 'expense')
    ])
    setBudget(budgetRes.data)
    setCategories(catsRes.data || [])

    // Get spending per category for current month
    const { startDate, endDate } = getMonthDateRange(currentMonth)
    const { data: txData } = await getTransactions({ userId: user.id, limit: 200, type: 'expense', startDate, endDate })
    const spending = {}
    txData?.forEach(tx => {
      const key = tx.category_id || 'other'
      spending[key] = (spending[key] || 0) + Number(tx.amount)
    })
    setSpendingByCategory(spending)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user, currentMonth])

  const handleAddBudgetCategory = async (e) => {
    e.preventDefault()
    let budgetId = budget?.id
    if (!budgetId) {
      const { data } = await createOrUpdateBudget(user.id, currentMonth, { name: `Budget ${currentMonth}` })
      budgetId = data?.id
    }
    await setBudgetCategory(budgetId, user.id, formData.category_id, Number(formData.limit_amount))
    setFormData({ category_id: '', limit_amount: '' })
    setShowAddForm(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    await deleteBudgetCategory(id)
    fetchData()
  }

  const budgetItems = budget?.budget_categories || []
  const totalBudget = budgetItems.reduce((s, b) => s + Number(b.limit_amount), 0)
  const totalSpent = budgetItems.reduce((s, b) => s + (spendingByCategory[b.category_id] || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="month"
          className="form-input"
          style={{ width: 160 }}
          value={currentMonth}
          onChange={e => setCurrentMonth(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Add Budget Category
        </button>
      </div>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { label: 'Total Budget', value: totalBudget, color: '#8B5CF6' },
          { label: 'Total Spent', value: totalSpent, color: '#EF4444' },
          { label: 'Remaining', value: totalBudget - totalSpent, color: totalBudget - totalSpent >= 0 ? '#10B981' : '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
            <p className="stat-label">{label}</p>
            <p className="stat-value" style={{ color }}>{formatCurrency(value, currency)}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Overall Budget</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {Math.round(totalSpent / totalBudget * 100)}% used
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(100, totalSpent / totalBudget * 100)}%`,
              background: getProgressColor(totalSpent / totalBudget * 100)
            }} />
          </div>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="card" style={{ border: '1px solid var(--border-primary)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Add Budget Category</h3>
          <form onSubmit={handleAddBudgetCategory} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Category</label>
              <select className="form-select" value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })} required>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Monthly Limit ({currency})</label>
              <input type="number" className="form-input" placeholder="50000"
                value={formData.limit_amount}
                onChange={e => setFormData({ ...formData, limit_amount: e.target.value })} required min="1" />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* Budget Categories */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : budgetItems.length === 0 ? (
        <div className="empty-state" style={{ padding: 60, background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-card)' }}>
          <div className="empty-icon" style={{ fontSize: 32 }}>📊</div>
          <p className="empty-title">No budget categories yet</p>
          <p className="empty-description">Set spending limits for different categories to track your budget.</p>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}><Plus size={16} /> Add Budget Category</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {budgetItems.map(item => {
            const spent = spendingByCategory[item.category_id] || 0
            const limit = Number(item.limit_amount)
            const pct = limit > 0 ? (spent / limit) * 100 : 0
            const remaining = limit - spent
            const isOver = pct >= 100
            const isWarning = pct >= item.alert_threshold
            const cat = item.categories

            return (
              <div key={item.id} className="card" style={{
                border: isOver ? '1px solid rgba(239,68,68,0.4)' : isWarning ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border-card)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: cat?.color ? `${cat.color}20` : 'rgba(139,92,246,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>🏷️</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{cat?.name || 'Category'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {isWarning && <AlertTriangle size={16} color={isOver ? '#EF4444' : '#F59E0B'} />}
                    <span style={{ fontSize: 14, fontWeight: 700, color: getProgressColor(pct) }}>
                      {Math.round(pct)}%
                    </span>
                    <button className="btn-icon btn btn-ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, pct)}%`,
                    background: getProgressColor(pct)
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Spent: {formatCurrency(spent, currency)}</span>
                  <span style={{ fontSize: 11, color: remaining >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    {remaining >= 0 ? `${formatCurrency(remaining, currency)} left` : `${formatCurrency(Math.abs(remaining), currency)} over`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
