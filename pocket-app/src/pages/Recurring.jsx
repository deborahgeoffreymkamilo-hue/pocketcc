import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getRecurringTransactions, addRecurring, deleteRecurring } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { Plus, RefreshCw, Trash2, Calendar, Clock, X } from 'lucide-react'

export default function Recurring() {
  const { user, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0])

  const currency = profile?.currency || 'TZS'

  const fetchRecurring = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getRecurringTransactions(user.id)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRecurring()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name || !amount) return
    await addRecurring({
      user_id: user.id,
      name,
      type,
      amount: Number(amount),
      frequency,
      next_due_date: nextDueDate,
      is_active: true
    })
    setName('')
    setAmount('')
    setShowModal(false)
    fetchRecurring()
  }

  const handleDelete = async (id) => {
    if (!confirm('Cancel this recurring payment?')) return
    await deleteRecurring(id)
    fetchRecurring()
  }

  const totalMonthlyCommitment = items
    .filter(i => i.type === 'expense' && i.is_active)
    .reduce((acc, i) => {
      let multiplier = 1
      if (i.frequency === 'daily') multiplier = 30
      if (i.frequency === 'weekly') multiplier = 4
      if (i.frequency === 'yearly') multiplier = 1 / 12
      return acc + (Number(i.amount) * multiplier)
    }, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Commitment Banner */}
      <div className="card card-gradient card-glow" style={{ padding: 24 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Estimated Monthly Fixed Subscriptions & Bills</p>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: '#EF4444' }}>
          {formatCurrency(totalMonthlyCommitment, currency)}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
          Rent, Airtime/WiFi, Netflix, Spotify, gym memberships, and loan commitments.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recurring Bills & Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Automatically anticipate your fixed overheads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Subscription
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><RefreshCw size={32} /></div>
          <p className="empty-title">No Recurring Bills Logged</p>
          <p className="empty-description">Keep track of rent, internet, and subscriptions before due dates surprise you.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Your First Subscription
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>{item.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, color: 'var(--text-muted)', fontSize: 12 }}>
                  <span style={{ textTransform: 'capitalize' }}>{item.frequency}</span>
                  <span>•</span>
                  <span>Next: {formatDate(item.next_due_date, 'short')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: item.type === 'income' ? '#10B981' : '#EF4444' }}>
                  {formatCurrency(item.amount, currency)}
                </span>
                <button className="btn-icon btn btn-ghost" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Recurring Payment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Subscription / Bill Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WiFi Internet, Apartment Rent, Netflix"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="expense">Expense</option>
                    <option value="income">Income (e.g. Salary)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select className="form-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount ({currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={nextDueDate}
                  onChange={e => setNextDueDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4">Save Subscription</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
