import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getSavingsGoals, addSavingsGoal, addGoalContribution, deleteSavingsGoal } from '../lib/api'
import { formatCurrency, formatDate, calculateMonthlyContribution, daysUntil } from '../lib/utils'
import { Plus, Target, CheckCircle2, TrendingUp, Calendar, Trash2, X } from 'lucide-react'

export default function Goals() {
  const { user, profile } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [contributeGoal, setContributeGoal] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [color, setColor] = useState('#8B5CF6')

  const currency = profile?.currency || 'TZS'

  const fetchGoals = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getSavingsGoals(user.id)
    setGoals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchGoals()
  }, [user])

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!name || !targetAmount) return
    await addSavingsGoal({
      user_id: user.id,
      name,
      description,
      target_amount: Number(targetAmount),
      current_amount: 0,
      target_date: targetDate || null,
      color,
      status: 'active'
    })
    setName('')
    setDescription('')
    setTargetAmount('')
    setTargetDate('')
    setShowAddModal(false)
    fetchGoals()
  }

  const handleContribute = async (e) => {
    e.preventDefault()
    if (!contributeGoal || !contributionAmount) return
    await addGoalContribution({
      goal_id: contributeGoal.id,
      user_id: user.id,
      amount: Number(contributionAmount),
      note: 'Manual contribution'
    })
    setContributeGoal(null)
    setContributionAmount('')
    fetchGoals()
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return
    await deleteSavingsGoal(id)
    fetchGoals()
  }

  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount || 0), 0)
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current_amount || 0), 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <p className="stat-label">Total Saved</p>
          <p className="stat-value text-purple">{formatCurrency(totalSaved, currency)}</p>
          <p className="stat-change text-purple">{overallProgress.toFixed(1)}% of all goals achieved</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Target</p>
          <p className="stat-value">{formatCurrency(totalTarget, currency)}</p>
          <p className="stat-change text-muted">{goals.length} active goals</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Remaining to Target</p>
          <p className="stat-value text-pink">{formatCurrency(Math.max(0, totalTarget - totalSaved), currency)}</p>
          <p className="stat-change text-pink">Keep going!</p>
        </div>
      </div>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Active Goals & Targets</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Plan for Emergency Funds, Tuition, Laptops, or Capital</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : goals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><Target size={32} /></div>
          <p className="empty-title">No Savings Goals Set</p>
          <p className="empty-description">Create goals like "Emergency Fund", "New Laptop", or "School Fees" to start saving systematically.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Your First Goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {goals.map(goal => {
            const target = Number(goal.target_amount)
            const current = Number(goal.current_amount || 0)
            const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0)
            const remaining = Math.max(0, target - current)
            const monthlyRec = calculateMonthlyContribution(target, current, goal.target_date)
            const daysLeft = daysUntil(goal.target_date)

            return (
              <div key={goal.id} className="card" style={{ borderTop: `4px solid ${goal.color || '#8B5CF6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{goal.name}</h3>
                    {goal.description && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{goal.description}</p>}
                  </div>
                  <button className="btn-icon btn btn-ghost" onClick={() => handleDelete(goal.id)}>
                    <Trash2 size={15} color="#EF4444" />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: goal.color || '#8B5CF6' }}>
                    {formatCurrency(current, currency)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    of {formatCurrency(target, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="progress-bar mb-4" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color || 'var(--gradient-primary)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span>{pct.toFixed(1)}% achieved</span>
                  <span>{formatCurrency(remaining, currency)} remaining</span>
                </div>

                {goal.target_date && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> Target: {formatDate(goal.target_date, 'medium')} ({daysLeft > 0 ? `${daysLeft} days left` : 'Due'})
                    </div>
                    {monthlyRec !== null && daysLeft > 0 && (
                      <div style={{ marginTop: 4, color: 'var(--neon-purple)', fontWeight: 600 }}>
                        💡 Save ~{formatCurrency(monthlyRec, currency)}/month to reach on time
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-secondary w-full"
                  onClick={() => setContributeGoal(goal)}
                >
                  <TrendingUp size={15} /> Add Contribution
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Savings Goal</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Emergency Fund, New Laptop, Safari"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount ({currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 1500000"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Note / Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="3-6 months essential expenses safety net"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'].map(c => (
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
              <button type="submit" className="btn btn-primary mt-4">Save Goal</button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeGoal && (
        <div className="modal-overlay" onClick={() => setContributeGoal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Deposit to {contributeGoal.name}</h3>
              <button className="modal-close" onClick={() => setContributeGoal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleContribute} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Deposit Amount ({currency})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50000"
                  value={contributionAmount}
                  onChange={e => setContributionAmount(e.target.value)}
                  required
                  min="1"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary">Deposit to Goal</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
