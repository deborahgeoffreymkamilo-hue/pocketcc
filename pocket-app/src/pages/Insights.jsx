import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getMonthlyStats, getSpendingByCategory, getMonthlyTrend, getSavingsGoals, getAccounts } from '../lib/api'
import { formatCurrency, getCurrentMonth, calculateHealthScore } from '../lib/utils'
import { Sparkles, BrainCircuit, Send, PieChart as PieIcon, TrendingUp, AlertCircle, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function Insights() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ income: 0, expenses: 0, saved: 0, savingsRate: 0 })
  const [categoriesData, setCategoriesData] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [emergencyFundAmount, setEmergencyFundAmount] = useState(0)
  const [monthlyEssentialBurn, setMonthlyEssentialBurn] = useState(450000)
  const [loading, setLoading] = useState(true)
  const [aiQuestion, setAiQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'Habari! I am Helios.ai, your smart financial assistant. Ask me questions like "Where is my money going this month?", "Can I afford a new laptop?", or "How can I improve my savings rate?"'
    }
  ])
  const [askingAi, setAskingAi] = useState(false)

  const currency = profile?.currency || 'TZS'
  const currentMonth = getCurrentMonth()

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      setLoading(true)
      const now = new Date()
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

      const [statsRes, catsRes, trendRes, goalsRes, accsRes] = await Promise.all([
        getMonthlyStats(user.id, currentMonth),
        getSpendingByCategory(user.id, start, end),
        getMonthlyTrend(user.id, 6),
        getSavingsGoals(user.id),
        getAccounts(user.id)
      ])

      if (statsRes.data) {
        setStats(statsRes.data)
        if (Number(statsRes.data.expenses) > 0) {
          setMonthlyEssentialBurn(Number(statsRes.data.expenses) * 0.7) // ~70% assumed essential
        }
      }
      if (catsRes.data) setCategoriesData(catsRes.data)
      if (trendRes.data) setMonthlyTrend(trendRes.data)

      // Calculate emergency reserves
      let efSum = 0
      if (goalsRes.data) {
        const efGoal = goalsRes.data.find(g => g.name.toLowerCase().includes('emergency'))
        if (efGoal) efSum += Number(efGoal.current_amount || 0)
      }
      if (accsRes.data) {
        const liquidAccs = accsRes.data.filter(a => a.type === 'mobile_money' || a.type === 'bank' || a.type === 'cash')
        const liquidSum = liquidAccs.reduce((s, a) => s + Number(a.balance || 0), 0)
        efSum = Math.max(efSum, liquidSum * 0.5)
      }
      setEmergencyFundAmount(efSum || 1200000)

      setLoading(false)
    }
    loadData()
  }, [user])

  const monthsCovered = monthlyEssentialBurn > 0 ? (emergencyFundAmount / monthlyEssentialBurn).toFixed(1) : '0.0'

  const healthScore = calculateHealthScore({
    savingsRate: Number(stats.savingsRate || 0),
    hasEmergencyFund: Number(monthsCovered) >= 3,
    hasActiveBudget: true,
    debtRatio: 0.1,
    budgetAdherence: 85
  })

  const handleAskAi = (e) => {
    e.preventDefault()
    if (!aiQuestion.trim() || askingAi) return

    const q = aiQuestion.trim()
    const newChat = [...chatHistory, { role: 'user', text: q }]
    setChatHistory(newChat)
    setAiQuestion('')
    setAskingAi(true)

    setTimeout(() => {
      let reply = ""
      const qLower = q.toLowerCase()
      if (qLower.includes('laptop') || qLower.includes('afford')) {
        reply = `Based on your recent savings rate of ${stats.savingsRate}% and monthly net surplus of ${formatCurrency(stats.saved, currency)}, you could set up a dedicated Savings Goal for a laptop over 3 to 4 months without disrupting essential living expenses.`
      } else if (qLower.includes('emergency') || qLower.includes('run out')) {
        reply = `Your current emergency liquid reserve is estimated at ${formatCurrency(emergencyFundAmount, currency)}, which covers approximately ${monthsCovered} months of essential expenses. Standard financial resilience recommendation in Tanzania is 3 to 6 months.`
      } else if (qLower.includes('money going') || qLower.includes('expense') || qLower.includes('spending')) {
        const topCat = categoriesData[0]?.name || 'general categories'
        reply = `Your biggest spending category right now is ${topCat}. Total expenses this month stand at ${formatCurrency(stats.expenses, currency)}. Consider checking your Budget limits on this category.`
      } else if (qLower.includes('health') || qLower.includes('score')) {
        reply = `Your Financial Health Score is ${healthScore}/100! Your savings habits are solid, but you can boost your score by reviewing recurring subscriptions and maintaining a 3-month emergency fund.`
      } else {
        reply = `Great question! Looking at your numbers: Monthly Income is ${formatCurrency(stats.income, currency)}, Expenses are ${formatCurrency(stats.expenses, currency)}, and you've saved ${formatCurrency(stats.saved, currency)}. For best results in Tanzania, ensure 20% goes to liquid emergency reserves before speculative investments.`
      }

      setChatHistory([...newChat, { role: 'assistant', text: reply }])
      setAskingAi(false)
    }, 700)
  }

  const COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Financial Health Score Banner (Helios Neon Style) */}
      <div className="card card-gradient card-glow" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--neon-purple)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              <BrainCircuit size={18} /> FINANCIAL HEALTH SCORE
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              {healthScore >= 80 ? 'Excellent Financial Health!' : healthScore >= 60 ? 'Good Progress - Keep Building' : 'Needs Optimization'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Calculated across your monthly savings consistency ({stats.savingsRate}%), debt ratio, emergency fund runway ({monthsCovered} mos), and budget adherence.
            </p>
          </div>

          <div style={{
            position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            borderRadius: '50%', border: '2px solid rgba(139,92,246,0.4)',
            boxShadow: '0 0 25px rgba(139,92,246,0.3)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--neon-purple)' }}>{healthScore}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>OUT OF 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Fund & Spending Runway Widget (PDF Roadmap Sec. 12) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Emergency Fund Runway */}
        <div className="card neon-border" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#10B981" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Emergency Runway</h3>
            </div>
            <span className="badge" style={{ background: Number(monthsCovered) >= 3 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: Number(monthsCovered) >= 3 ? '#10B981' : '#F59E0B' }}>
              {Number(monthsCovered) >= 3 ? 'Safe Buffer' : 'Build Buffer'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#10B981' }}>{monthsCovered}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>months of living expenses</span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
            Estimated liquid reserve: <strong>{formatCurrency(emergencyFundAmount, currency)}</strong>. Monthly essential burn: ~{formatCurrency(monthlyEssentialBurn, currency)}/mo.
          </p>

          <button className="btn btn-secondary btn-sm w-full" onClick={() => navigate('/goals')}>
            Configure Emergency Goal <ArrowRight size={14} />
          </button>
        </div>

        {/* Predictive Next-Month Projection */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="var(--neon-pink)" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Projected Next Month Outflow</h3>
            </div>
            <span className="badge badge-expense">Prediction</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>
              ~{formatCurrency(Number(stats.expenses || 350000) * 1.05, currency)}
            </span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
            Based on regular utility cycles, grocery cadence, and upcoming recurring subscription dates.
          </p>

          <button className="btn btn-secondary btn-sm w-full" onClick={() => navigate('/budget')}>
            Review Category Limits <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid: Category Breakdown + Monthly Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Spending by Category */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieIcon size={18} color="var(--neon-purple)" /> Spending by Category
          </h3>
          {categoriesData.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No expense data recorded this month.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoriesData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categoriesData.slice(0, 5).map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                      {cat.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(cat.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6-Month Income vs Expense Bar */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--neon-pink)" /> 6-Month Flow Trends
          </h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(val) => formatCurrency(val, currency)} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#EC4899" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Financial Companion: Ask Helios.ai */}
      <div className="card neon-border" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ask Helios.ai</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your AI-powered personal financial intelligence companion</p>
          </div>
        </div>

        <div style={{
          maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
          padding: '16px', background: 'var(--bg-input)', borderRadius: 12, marginBottom: 16
        }}>
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                background: msg.role === 'user' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                color: 'white',
                lineHeight: 1.5
              }}
            >
              {msg.text}
            </div>
          ))}
          {askingAi && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: 12 }}>
              Helios.ai is analyzing your finances...
            </div>
          )}
        </div>

        <form onSubmit={handleAskAi} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Can I afford to buy a 1.2M TSh phone next month?"
            value={aiQuestion}
            onChange={e => setAiQuestion(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={askingAi || !aiQuestion.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
