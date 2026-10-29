import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { addTransaction } from '../lib/api'
import { formatCurrency } from '../lib/utils'
import { ArrowLeft, Check, Info } from 'lucide-react'

const availableAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.32, change: 1.25, icon: '🍎' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.17, change: 3.21, icon: '🚗' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 2110.20, change: 4.89, icon: '⚡' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 408.32, change: 1.76, icon: '🪟' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 176.21, change: 2.32, icon: '📦' },
  { symbol: 'BTC', name: 'Bitcoin', price: 68421.32, change: 2.12, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 3412.67, change: 3.45, icon: '⟠' },
  { symbol: 'CRDB', name: 'CRDB Bank Plc', price: 0.18, change: 1.10, icon: '🏦' },
]

export default function Trade() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [tradeType, setTradeType] = useState('buy') // 'buy' | 'sell'
  const [selectedAsset, setSelectedAsset] = useState(location.state?.selectedAsset || availableAssets[0])
  const [orderType, setOrderType] = useState('Market') // 'Market' | 'Limit' | 'Stop'
  const [amount, setAmount] = useState('500')
  const [submitted, setSubmitted] = useState(false)

  const numAmount = Number(amount) || 0
  const estimatedShares = selectedAsset.price > 0 ? (numAmount / selectedAsset.price).toFixed(2) : '0.00'

  const handlePercentageClick = (pct) => {
    // Simulated buying power allocation ($2,000 wallet reserve)
    const totalPower = 2000
    setAmount(((totalPower * pct) / 100).toFixed(0))
  }

  const handleExecuteTrade = async (e) => {
    e.preventDefault()
    if (numAmount <= 0) return
    setSubmitted(true)

    if (user) {
      const isUSD = profile?.currency === 'USD'
      await addTransaction({
        user_id: user.id,
        type: tradeType === 'buy' ? 'expense' : 'income',
        amount: isUSD ? numAmount : numAmount * 2600,
        description: `${tradeType.toUpperCase()} ${estimatedShares} ${selectedAsset.symbol} @ $${selectedAsset.price.toFixed(2)}`,
        payment_method: 'Trade Portfolio',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    }

    setTimeout(() => {
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
      <div className="card neon-border" style={{ width: '100%', maxWidth: 440, padding: 24 }}>
        {/* Navigation / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Trade Desk</h2>
          <div style={{ width: 18 }} />
        </div>

        {/* Buy / Sell Tabs */}
        <div className="tabs mb-4" style={{ background: 'var(--bg-input)' }}>
          <button
            className={`tab ${tradeType === 'buy' ? 'active' : ''}`}
            onClick={() => setTradeType('buy')}
            style={tradeType === 'buy' ? { background: 'var(--gradient-primary)' } : {}}
          >
            Buy
          </button>
          <button
            className={`tab ${tradeType === 'sell' ? 'active' : ''}`}
            onClick={() => setTradeType('sell')}
            style={tradeType === 'sell' ? { background: '#EF4444' } : {}}
          >
            Sell
          </button>
        </div>

        {/* Selected Stock Indicator */}
        <div
          style={{
            background: 'var(--bg-input)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            border: '1px solid var(--border-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{selectedAsset.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{selectedAsset.symbol}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedAsset.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>${selectedAsset.price.toFixed(2)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>
                  +{selectedAsset.change}%
                </span>
              </div>
            </div>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', background: 'none', border: 'none', padding: 0 }}
            value={selectedAsset.symbol}
            onChange={(e) => {
              const found = availableAssets.find(a => a.symbol === e.target.value)
              if (found) setSelectedAsset(found)
            }}
          >
            {availableAssets.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>
        </div>

        {/* Order Type Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['Market', 'Limit', 'Stop'].map(ot => (
            <button
              key={ot}
              className="btn btn-sm"
              onClick={() => setOrderType(ot)}
              style={{
                flex: 1,
                background: orderType === ot ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
                color: orderType === ot ? 'var(--neon-purple)' : 'var(--text-muted)',
                border: orderType === ot ? '1px solid var(--border-primary)' : '1px solid var(--border-card)',
                borderRadius: 20
              }}
            >
              {ot}
            </button>
          ))}
        </div>

        <form onSubmit={handleExecuteTrade}>
          {/* Amount input */}
          <div className="form-group mb-4">
            <label className="form-label">Amount (USD / Balance Equiv.)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: 32, fontSize: 22, fontWeight: 700 }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          {/* Quick percentage shortcuts: 25%, 50%, 75%, 100% */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handlePercentageClick(pct)}
                style={{ borderRadius: 12, fontWeight: 600 }}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full mb-4"
            style={{
              background: tradeType === 'buy' ? 'var(--gradient-primary)' : '#EF4444',
              boxShadow: tradeType === 'buy' ? '0 0 20px rgba(139,92,246,0.5)' : '0 0 20px rgba(239,68,68,0.5)'
            }}
          >
            {tradeType === 'buy' ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`}
          </button>

          {/* Feedback */}
          {submitted && (
            <div style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid #10B981',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#10B981',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <Check size={16} /> Order for {estimatedShares} {selectedAsset.symbol} placed successfully!
            </div>
          )}

          {/* Estimated breakdown card */}
          <div style={{ background: 'var(--bg-input)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Shares (approx.)</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{estimatedShares}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Total Cost</span>
              <span style={{ fontWeight: 700, color: 'white' }}>${numAmount.toFixed(2)}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
