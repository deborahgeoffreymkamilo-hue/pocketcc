import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAccounts, addAccount, deleteAccount } from '../lib/api'
import { formatCurrency, ACCOUNT_TYPES } from '../lib/utils'
import { Plus, Wallet, Smartphone, Building2, CreditCard, Bitcoin, Trash2, X } from 'lucide-react'

export default function Accounts() {
  const { user, profile } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('mobile_money')
  const [provider, setProvider] = useState('M-Pesa')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#8B5CF6')

  const currency = profile?.currency || 'TZS'

  const fetchAccounts = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getAccounts(user.id)
    setAccounts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAccounts()
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name) return
    await addAccount({
      user_id: user.id,
      name,
      type,
      provider,
      balance: Number(balance || 0),
      color,
      currency
    })
    setName('')
    setBalance('')
    setShowAddModal(false)
    fetchAccounts()
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this account?')) return
    await deleteAccount(id)
    fetchAccounts()
  }

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.balance || 0), 0)

  const getAccountIcon = (t) => {
    switch (t) {
      case 'mobile_money': return <Smartphone size={20} />
      case 'bank': return <Building2 size={20} />
      case 'card': return <CreditCard size={20} />
      case 'crypto': return <Bitcoin size={20} />
      default: return <Wallet size={20} />
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Total Balance Card */}
      <div className="card card-gradient card-glow" style={{ padding: 24 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cumulative Balance across all accounts</p>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>{formatCurrency(totalBalance, currency)}</h2>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          {['mobile_money', 'bank', 'cash', 'crypto'].map(t => {
            const sum = accounts.filter(a => a.type === t).reduce((s, a) => s + Number(a.balance || 0), 0)
            if (sum === 0 && accounts.every(a => a.type !== t)) return null
            return (
              <div key={t} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 20, fontSize: 12 }}>
                <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{t.replace('_', ' ')}: </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(sum, currency)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Accounts & Wallets</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, Bank, and Cash</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Link / Add Account
        </button>
      </div>

      {/* Accounts List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : accounts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><Wallet size={32} /></div>
          <p className="empty-title">No Accounts Added</p>
          <p className="empty-description">Add your mobile money wallets or bank accounts to track where your money lives.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add M-Pesa / Bank
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {accounts.map(acc => (
            <div key={acc.id} className="card" style={{ borderLeft: `4px solid ${acc.color || '#8B5CF6'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: `${acc.color || '#8B5CF6'}20`,
                    color: acc.color || '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700 }}>{acc.name}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{acc.provider || acc.type}</p>
                  </div>
                </div>
                <button className="btn-icon btn btn-ghost" onClick={() => handleDelete(acc.id)}>
                  <Trash2 size={14} color="#EF4444" />
                </button>
              </div>

              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Balance</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: acc.color || '#8B5CF6' }}>
                  {formatCurrency(acc.balance, acc.currency || currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Financial Account</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. My M-Pesa, CRDB Salary, Petty Cash"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Bank</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <select className="form-select" value={provider} onChange={e => setProvider(e.target.value)}>
                    <option value="M-Pesa">M-Pesa (Vodacom)</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Tigo Pesa">Tigo Pesa</option>
                    <option value="HaloPesa">HaloPesa</option>
                    <option value="CRDB Bank">CRDB Bank</option>
                    <option value="NMB Bank">NMB Bank</option>
                    <option value="Stanbic">Stanbic Bank</option>
                    <option value="Cash">Physical Cash</option>
                    <option value="Binance">Binance / Crypto</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Opening Balance ({currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Accent Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                    <div
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer',
                        border: color === c ? '2px solid white' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-4">Save Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
