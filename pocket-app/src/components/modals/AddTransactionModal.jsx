import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAccounts, getCategories, addTransaction } from '../../lib/api'
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react'

export default function AddTransactionModal({ onClose, onSuccess }) {
  const { user, profile } = useAuth()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currency = profile?.currency || 'TZS'

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [accs, cats] = await Promise.all([
        getAccounts(user.id),
        getCategories(user.id, type === 'transfer' ? undefined : type)
      ])
      if (accs.data) {
        setAccounts(accs.data)
        if (accs.data.length > 0) setAccountId(accs.data[0].id)
        if (accs.data.length > 1) setToAccountId(accs.data[1].id)
      }
      if (cats.data) {
        setCategories(cats.data)
        if (cats.data.length > 0) setCategoryId(cats.data[0].id)
      }
    }
    load()
  }, [user, type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    setError('')
    setLoading(true)

    try {
      const tx = {
        user_id: user.id,
        type,
        amount: Number(amount),
        description: description.trim() || (type === 'transfer' ? 'Account Transfer' : 'Quick Transaction'),
        account_id: accountId || null,
        to_account_id: type === 'transfer' ? toAccountId : null,
        category_id: type === 'transfer' ? null : (categoryId || null),
        payment_method: paymentMethod,
        transaction_date: transactionDate
      }

      const { error: apiErr } = await addTransaction(tx)
      if (apiErr) throw apiErr
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Transaction</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="tabs mb-4">
          <button
            type="button"
            className={`tab ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
            style={type === 'expense' ? { background: '#EF4444' } : {}}
          >
            <ArrowDownRight size={14} style={{ display: 'inline', marginRight: 4 }} /> Expense
          </button>
          <button
            type="button"
            className={`tab ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
            style={type === 'income' ? { background: '#10B981' } : {}}
          >
            <ArrowUpRight size={14} style={{ display: 'inline', marginRight: 4 }} /> Income
          </button>
          <button
            type="button"
            className={`tab ${type === 'transfer' ? 'active' : ''}`}
            onClick={() => setType('transfer')}
            style={type === 'transfer' ? { background: '#06B6D4' } : {}}
          >
            <ArrowLeftRight size={14} style={{ display: 'inline', marginRight: 4 }} /> Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Amount ({currency})</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 25000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              required
              min="0.01"
              step="any"
              style={{ fontSize: 20, fontWeight: '700', letterSpacing: 0.5 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Note</label>
            <input
              type="text"
              className="form-input"
              placeholder={type === 'income' ? 'Salary, Client payment...' : 'Groceries, Fuel, Safari...'}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {type !== 'transfer' && (
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{type === 'transfer' ? 'From Account' : 'Account'}</label>
              <select
                className="form-select"
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
                {accounts.length === 0 && <option value="">Default Wallet</option>}
              </select>
            </div>

            {type === 'transfer' ? (
              <div className="form-group">
                <label className="form-label">To Account</label>
                <select
                  className="form-select"
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Tigo Pesa">Tigo Pesa</option>
                  <option value="HaloPesa">HaloPesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Visa / Mastercard</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
