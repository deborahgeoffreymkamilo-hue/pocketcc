import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/utils'
import { Search, TrendingUp, TrendingDown, Star, Plus, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const marketAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 195.32, change: 2.41, type: 'stock', icon: '🍎' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.17, change: 3.21, type: 'stock', icon: '🚗' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 2110.20, change: 4.89, type: 'stock', icon: '⚡' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 408.32, change: 1.76, type: 'stock', icon: '🪟' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 176.21, change: 2.32, type: 'stock', icon: '📦' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 162.18, change: 1.42, type: 'stock', icon: '🔍' },
  { symbol: 'BTC', name: 'Bitcoin', price: 68421.32, change: 2.12, type: 'crypto', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 3412.67, change: 3.45, type: 'crypto', icon: '⟠' },
  { symbol: 'SPOT', name: 'Spotify', price: 11.77, change: 6.31, type: 'stock', icon: '🎧' },
  { symbol: 'CRDB', name: 'CRDB Bank Plc (DSE)', price: 460.00, change: 1.10, type: 'local', icon: '🏦' },
  { symbol: 'NMB', name: 'NMB Bank Plc (DSE)', price: 4900.00, change: 0.82, type: 'local', icon: '🏛️' },
  { symbol: 'VODA', name: 'Vodacom Tanzania (DSE)', price: 770.00, change: -0.40, type: 'local', icon: '📱' },
]

export default function Market() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Favorites')
  const [search, setSearch] = useState('')
  const [watchlist, setWatchlist] = useState(['AAPL', 'NVDA', 'BTC', 'SPOT'])

  const toggleWatchlist = (symbol) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter(s => s !== symbol))
    } else {
      setWatchlist([...watchlist, symbol])
    }
  }

  const filteredAssets = marketAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === 'Favorites') return watchlist.includes(asset.symbol)
    if (activeTab === 'Top Gainers') return asset.change > 2.0
    if (activeTab === 'Top Losers') return asset.change < 1.0
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div className="card card-gradient card-glow" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Global & DSE Markets</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              Live indicators for international equities, crypto reserves, and Dar es Salaam Stock Exchange assets.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/trade')}>
            <TrendingUp size={16} /> Open Trade Desk
          </button>
        </div>
      </div>

      {/* Search & Pills */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-input-icon" style={{ flex: 1, minWidth: 240 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search stocks, ETFs, crypto, DSE..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['Favorites', 'All', 'Top Gainers', 'Top Losers'].map(tab => (
              <button
                key={tab}
                className="btn btn-sm"
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--gradient-primary)' : 'var(--bg-input)',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  border: activeTab === tab ? 'none' : '1px solid var(--border-card)',
                  borderRadius: 20,
                  padding: '6px 14px'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Table / List matching the PNG Market screen */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredAssets.map(asset => {
            const isFav = watchlist.includes(asset.symbol)
            const isPositive = asset.change >= 0

            return (
              <div
                key={asset.symbol}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-card)',
                  transition: 'background 0.15s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/trade', { state: { selectedAsset: asset } })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.symbol) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Star
                      size={18}
                      color={isFav ? '#F59E0B' : 'var(--text-muted)'}
                      fill={isFav ? '#F59E0B' : 'none'}
                    />
                  </button>

                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'var(--bg-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>
                    {asset.icon}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{asset.symbol}</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', textTransform: 'uppercase' }}>
                        {asset.type}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{asset.name}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>
                    ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isPositive ? '#10B981' : '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 2
                  }}>
                    {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
