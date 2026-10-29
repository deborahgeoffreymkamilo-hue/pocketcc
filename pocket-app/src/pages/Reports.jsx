import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getMonthlyStats, getSpendingByCategory, getTransactions } from '../lib/api'
import { formatCurrency, getCurrentMonth, getMonthDateRange, formatDate } from '../lib/utils'
import { FileText, Download, Printer, ArrowUpRight, ArrowDownRight, PieChart as PieIcon, CheckCircle2 } from 'lucide-react'

export default function Reports() {
  const { user, profile } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [stats, setStats] = useState({ income: 0, expenses: 0, saved: 0, savingsRate: 0 })
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const currency = profile?.currency || 'TZS'

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const { startDate, endDate } = getMonthDateRange(selectedMonth)
      const [statsRes, catsRes, txRes] = await Promise.all([
        getMonthlyStats(user.id, selectedMonth),
        getSpendingByCategory(user.id, startDate, endDate),
        getTransactions({ userId: user.id, startDate, endDate, limit: 100 })
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (catsRes.data) setCategories(catsRes.data)
      if (txRes.data) setTransactions(txRes.data)
      setLoading(false)
    }
    load()
  }, [user, selectedMonth])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (transactions.length === 0) return
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Description', 'Category', 'Account']
    const rows = transactions.map(tx => [
      tx.transaction_date,
      tx.type,
      tx.amount,
      currency,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${tx.categories?.name || ''}"`,
      `"${tx.accounts?.name || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `financial_report_${selectedMonth}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header controls (hidden when printing) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Monthly Financial Statement</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Audit-ready statement of inflows, outflows, and capital retention</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="month"
            className="form-input"
            style={{ width: 160 }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        className="card"
        style={{
          padding: 36,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}
      >
        {/* Statement Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-card)', paddingBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="sidebar-logo-icon" style={{ width: 32, height: 32, fontSize: 16 }}>P</div>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>POCKET</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Account Holder: <strong>{profile?.full_name || 'Nadia Rashid'}</strong></p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Jurisdiction: {profile?.country || 'Tanzania'} • Base Currency: {currency}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-transfer" style={{ fontSize: 12, padding: '4px 10px' }}>STATEMENT PERIOD</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 6 }}>
              {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* High-Level Executive Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 12, border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Inflows</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981', marginTop: 4 }}>
              +{formatCurrency(stats.income, currency)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 12, border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Outflows</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444', marginTop: 4 }}>
              -{formatCurrency(stats.expenses, currency)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 12, border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Capital Saved</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--neon-purple)', marginTop: 4 }}>
              {formatCurrency(stats.saved, currency)}
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 12, border: '1px solid var(--border-card)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Savings Retention</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: stats.savingsRate >= 20 ? '#10B981' : '#F59E0B', marginTop: 4 }}>
              {stats.savingsRate}%
            </div>
          </div>
        </div>

        {/* Top Expense Categories Breakdown */}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieIcon size={16} color="var(--neon-purple)" /> Outflows by Category
          </h4>

          {categories.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No category expense records found for this period.</p>
          ) : (
            <div style={{ border: '1px solid var(--border-card)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-card)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Total Amount</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Share of Outflow</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const share = stats.expenses > 0 ? ((cat.amount / stats.expenses) * 100).toFixed(1) : 0
                    return (
                      <tr key={cat.name} style={{ borderBottom: '1px solid var(--border-card)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{cat.name}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>
                          {formatCurrency(cat.amount, currency)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {share}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Ledger Table */}
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            Audit Log ({transactions.length} Transactions)
          </h4>

          {transactions.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No individual transactions logged in this cycle.</p>
          ) : (
            <div style={{ border: '1px solid var(--border-card)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-card)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Description</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>Category / Account</th>
                    <th style={{ padding: '8px 12px', color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 25).map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-card)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{formatDate(tx.transaction_date, 'short')}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{tx.description}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                        {tx.categories?.name || tx.type} • {tx.accounts?.name || 'Wallet'}
                      </td>
                      <td style={{
                        padding: '8px 12px', textAlign: 'right', fontWeight: 700,
                        color: tx.type === 'income' ? '#10B981' : tx.type === 'expense' ? '#EF4444' : '#06B6D4'
                      }}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '↔'}{formatCurrency(tx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statement Footer */}
        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Pocket Personal Finance Manager • Confidential & Certified for Personal Use</span>
          <span>Security Verified by Supabase RLS</span>
        </div>
      </div>
    </div>
  )
}
