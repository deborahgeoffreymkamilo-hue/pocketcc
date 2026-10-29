import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions, seedDemoFinancialData } from '../lib/api'
import { CURRENCIES } from '../lib/utils'
import { User, Shield, Download, LogOut, Check, Database, Sparkles } from 'lucide-react'

export default function Settings() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [currency, setCurrency] = useState(profile?.currency || 'TZS')
  const [country, setCountry] = useState(profile?.country || 'Tanzania')
  const [budgetStyle, setBudgetStyle] = useState(profile?.budget_style || 'balanced')
  const [saved, setSaved] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedSuccess, setSeedSuccess] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({
      full_name: fullName,
      currency,
      country,
      budget_style: budgetStyle
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSeedData = async () => {
    if (!user) return
    setSeeding(true)
    try {
      await seedDemoFinancialData(user.id, currency)
      setSeedSuccess(true)
      setTimeout(() => setSeedSuccess(false), 3000)
    } finally {
      setSeeding(false)
    }
  }

  const handleExportCSV = async () => {
    if (!user) return
    setExporting(true)
    try {
      const { data } = await getTransactions({ userId: user.id, limit: 1000 })
      if (!data || data.length === 0) {
        alert('No transaction records found to export.')
        setExporting(false)
        return
      }

      const headers = ['Date', 'Type', 'Amount', 'Currency', 'Description', 'Category', 'Account', 'Payment Method']
      const rows = data.map(tx => [
        tx.transaction_date,
        tx.type,
        tx.amount,
        currency,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${tx.categories?.name || ''}"`,
        `"${tx.accounts?.name || ''}"`,
        `"${tx.payment_method || ''}"`
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `pocket_finance_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 700 }}>
      {/* Profile Form */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} color="var(--neon-purple)" /> Profile & Identity
        </h3>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nadia Rashid"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Managed by Supabase Auth)</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value={country}
                onChange={e => setCountry(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            {saved ? <><Check size={16} /> Preferences Saved</> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Demo Data Seeder */}
      <div className="card neon-border">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={18} color="var(--neon-purple)" /> Quick Demo Data Generator
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Instantly populate your account with sample Tanzanian wallets (M-Pesa, CRDB, Cash), sample transactions, and savings goals matching the showcase UI.
        </p>

        <button className="btn btn-secondary" onClick={handleSeedData} disabled={seeding}>
          <Sparkles size={16} color="var(--neon-purple)" /> {seeding ? 'Generating Data...' : seedSuccess ? 'Showcase Data Populated!' : 'Load Sample Financial Data'}
        </button>
      </div>

      {/* Data Export & Reports */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={18} color="var(--neon-pink)" /> Export Reports & Backup
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Download your complete financial records as CSV (compatible with Excel, Google Sheets, or tax accountants).
        </p>

        <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exporting}>
          <Download size={16} /> {exporting ? 'Generating CSV...' : 'Export Financial Records (CSV)'}
        </button>
      </div>

      {/* Security & Authentication */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} color="var(--neon-blue)" /> Security Standards
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Pocket strictly abides by personal finance privacy principles:
        </p>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>Bank passwords, ATM PINs, and M-Pesa PINs are <strong>never stored</strong> or requested.</li>
          <li>Supabase Row-Level-Security (RLS) guarantees your financial data is isolated strictly to your account.</li>
          <li>End-to-end HTTPS encrypted sessions.</li>
        </ul>
      </div>

      {/* Sign Out Card */}
      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#EF4444' }}>Sign Out</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Securely terminate your current session on this device.</p>
          </div>
          <button className="btn btn-danger" onClick={signOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
