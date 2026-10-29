import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getTransactions, getRecurringTransactions } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function CalendarPage() {
  const { user, profile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState([])
  const [recurring, setRecurring] = useState([])
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())

  const currency = profile?.currency || 'TZS'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
      const [txRes, recRes] = await Promise.all([
        getTransactions({ userId: user.id, startDate: start, endDate: end, limit: 200 }),
        getRecurringTransactions(user.id)
      ])
      if (txRes.data) setTransactions(txRes.data)
      if (recRes.data) setRecurring(recRes.data)
    }
    load()
  }, [user, year, month])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  const dayTransactions = transactions.filter(t => t.transaction_date === selectedDateStr)
  const dayRecurring = recurring.filter(r => {
    const dueDay = new Date(r.next_due_date).getDate()
    return dueDay === selectedDay
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Month Navigator Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Financial Calendar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Schedule of recurring bills, salaries, and logged expenses</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-icon" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight: 700, fontSize: 16, minWidth: 140, textAlign: 'center' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="btn btn-secondary btn-icon" onClick={handleNextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Calendar Grid */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 12 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <span key={d} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: 60 }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasTx = transactions.some(t => t.transaction_date === dateStr)
              const isSelected = selectedDay === day

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    height: 60,
                    borderRadius: 10,
                    padding: 6,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--gradient-card)' : 'var(--bg-input)',
                    border: isSelected ? '1px solid var(--neon-purple)' : '1px solid var(--border-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--neon-purple)' : 'inherit' }}>
                    {day}
                  </span>
                  {hasTx && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-purple)', alignSelf: 'center' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Events for {formatDate(selectedDateStr, 'medium')}
          </h3>

          {dayRecurring.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-purple)', textTransform: 'uppercase', marginBottom: 8 }}>
                Due Recurring Bills
              </p>
              {dayRecurring.map(r => (
                <div key={r.id} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', padding: '10px 12px', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <span>{r.name}</span>
                    <span style={{ color: r.type === 'income' ? '#10B981' : '#EF4444' }}>{formatCurrency(r.amount, currency)}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due ({r.frequency})</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Recorded Transactions
            </p>
            {dayTransactions.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No transactions on this date.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayTransactions.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border-card)' }}>
                    <span>{tx.description}</span>
                    <span style={{ fontWeight: 700, color: tx.type === 'income' ? '#10B981' : '#EF4444' }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
