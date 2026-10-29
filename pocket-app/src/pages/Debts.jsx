import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getDebts, addDebt, updateDebt, deleteDebt } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { Plus, CreditCard, ArrowUpRight, ArrowDownRight, Trash2, Check, X } from 'lucide-react'

export default function Debts() {
  const { user, profile } = useAuth()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('borrowed') // 'borrowed' | 'lent' | 'loan' | 'credit_card'
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  const currency = profile?.currency || 'TZS'

  const fetchDebts = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getDebts(user.id)
    setDebts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDebts()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name || !amount) return
    await addDebt({
      user_id: user.id,
      name,
      type,
      original_amount: Number(amount),
      remaining_amount: Number(amount),
      due_date: dueDate || null,
      description,
      is_settled: false
    })
    setName('')
    setAmount('')
    setDescription('')
    setShowModal(false)
    fetchDebts()
  }

  const handleSettle = async (debt) => {
    await updateDebt(debt.id, { is_settled: true, remaining_amount: 0 })
    fetchDebts()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this debt record?')) return
    await deleteDebt(id)
    fetchDebts()
  }

  const moneyOwedByMe = debts
    .filter(d => !d.is_settled && (d.type === 'borrowed' || d.type === 'loan' || d.type === 'credit_card'))
    .reduce((s, d) => s + Number(d.remaining_amount), 0)

  const moneyOwedToMe = debts
    .filter(d => !d.is_settled && d.type === 'lent')
    .reduce((s, d) => s + Number(d.remaining_amount), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Debts Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <p className="stat-label">I Owe (Loans & Borrowed)</p>
          <p className="stat-value text-red">{formatCurrency(moneyOwedByMe, currency)}</p>
          <p className="stat-change text-red">Liabilities to settle</p>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <p className="stat-label">Owed to Me (Lent to Others)</p>
          <p className="stat-value text-green">{formatCurrency(moneyOwedToMe, currency)}</p>
          <p className="stat-change text-green">Receivables</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Debts & Loans Tracker</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track personal loans, money lent to friends, or bank obligations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Record Debt
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : debts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><CreditCard size={32} /></div>
          <p className="empty-title">Debt Free!</p>
          <p className="empty-description">No active loans or borrowed money recorded.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Record a Loan / Borrowed Amount
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {debts.map(debt => {
            const isOwed = debt.type === 'lent'
            return (
              <div
                key={debt.id}
                className="card"
                style={{
                  opacity: debt.is_settled ? 0.6 : 1,
                  border: debt.is_settled ? '1px solid var(--border-card)' : isOwed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`badge ${isOwed ? 'badge-income' : 'badge-expense'}`}>
                        {isOwed ? 'Lent to' : 'Borrowed / Loan'}
                      </span>
                      {debt.is_settled && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>Settled</span>}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{debt.name}</h3>
                    {debt.description && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{debt.description}</p>}
                  </div>
                  <button className="btn-icon btn btn-ghost" onClick={() => handleDelete(debt.id)}>
                    <Trash2 size={14} color="#EF4444" />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: isOwed ? '#10B981' : '#EF4444' }}>
                    {formatCurrency(debt.remaining_amount, currency)}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Original: {formatCurrency(debt.original_amount, currency)}
                  </span>
                </div>

                {debt.due_date && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Due date: {formatDate(debt.due_date, 'medium')}
                  </p>
                )}

                {!debt.is_settled && (
                  <button className="btn btn-secondary w-full" onClick={() => handleSettle(debt)}>
                    <Check size={14} /> Mark as Settled / Paid
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Loan / Debt</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Person / Entity Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe, CRDB Personal Loan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="borrowed">I Borrowed Money (Debt)</option>
                  <option value="loan">Bank / Institution Loan</option>
                  <option value="lent">I Lent Money to Someone (Receivable)</option>
                  <option value="credit_card">Credit Card Balance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount ({currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 200000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Purpose or terms agreed upon"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4">Save Debt Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
