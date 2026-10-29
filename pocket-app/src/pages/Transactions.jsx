import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions, deleteTransaction, getCategories, getAccounts } from '../lib/api'
import { formatCurrency, formatDate, TRANSACTION_TYPES, getCurrentMonth } from '../lib/utils'
import { Plus, Search, Filter, Trash2, ChevronDown } from 'lucide-react'
import AddTransactionModal from '../components/modals/AddTransactionModal'

export default function Transactions() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const currency = profile?.currency || 'TZS'

  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)
    const { startDate, endDate } = getMonthDateRange(filterMonth)
    const { data } = await getTransactions({
      userId: user.id,
      limit: 100,
      type: filterType === 'all' ? undefined : filterType,
      startDate,
      endDate,
      search: search || undefined
    })
    setTransactions(data || [])
    setLoading(false)
  }

  const getMonthDateRange = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number)
    return {
      startDate: `${year}-${String(month).padStart(2, '0')}-01`,
      endDate: new Date(year, month, 0).toISOString().split('T')[0]
    }
  }

  useEffect(() => { fetchTransactions() }, [user, filterType, filterMonth, search])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
    fetchTransactions()
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Group by date
  const grouped = {}
  transactions.forEach(tx => {
    const key = tx.transaction_date
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { label: 'Income', value: income, color: '#10B981' },
          { label: 'Expenses', value: expenses, color: '#EF4444' },
          { label: 'Net', value: income - expenses, color: income - expenses >= 0 ? '#10B981' : '#EF4444' }
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
            <p className="stat-label">{label}</p>
            <p className="stat-value" style={{ color }}>{formatCurrency(value, currency)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-input-icon" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="form-select" style={{ width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>

          <input
            type="month"
            className="form-input"
            style={{ width: 150 }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Search size={28} /></div>
            <p className="empty-title">No transactions found</p>
            <p className="empty-description">Try changing your filters or add a new transaction.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Transaction
            </button>
          </div>
        ) : (
          Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, txs]) => (
            <div key={date}>
              <div style={{
                padding: '12px 20px 8px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border-card)'
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  {formatDate(date, 'long')}
                </span>
              </div>
              {txs.map(tx => {
                const typeInfo = TRANSACTION_TYPES[tx.type] || {}
                const cat = tx.categories
                return (
                  <div key={tx.id} className="transaction-item" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-card)' }}>
                    <div className="transaction-icon" style={{
                      background: cat?.color ? `${cat.color}20` : 'rgba(139,92,246,0.1)',
                      fontSize: 18
                    }}>
                      {tx.type === 'income' ? '📈' : tx.type === 'expense' ? '📉' : '↔️'}
                    </div>
                    <div className="transaction-info">
                      <p className="transaction-desc">{tx.description || cat?.name || 'Transaction'}</p>
                      <div className="transaction-meta">
                        <span>{cat?.name || tx.type}</span>
                        {tx.payment_method && <><span>•</span><span>{tx.payment_method}</span></>}
                        {tx.accounts?.name && <><span>•</span><span>{tx.accounts.name}</span></>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p className="transaction-amount" style={{ color: typeInfo.color }}>
                          {typeInfo.sign}{formatCurrency(tx.amount, currency)}
                        </p>
                        <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                      </div>
                      <button
                        className="btn-icon btn btn-ghost"
                        onClick={() => handleDelete(tx.id)}
                        style={{ color: '#EF4444', opacity: 0.6 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {showAddModal && <AddTransactionModal onClose={() => { setShowAddModal(false); fetchTransactions() }} />}
    </div>
  )
}
