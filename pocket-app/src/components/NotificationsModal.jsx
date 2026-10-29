import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api'
import { formatRelativeTime } from '../lib/utils'
import { X, Bell, AlertTriangle, CheckCircle, Info, Sparkles, CheckCheck } from 'lucide-react'

export default function NotificationsModal({ onClose }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([
    {
      id: 'demo-1',
      title: 'Budget Alert (Airtime & Data)',
      message: 'You have used 85% of your monthly Airtime & Data budget limit.',
      type: 'warning',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      is_read: false
    },
    {
      id: 'demo-2',
      title: 'Upcoming Bill: Apartment Rent',
      message: 'Rent payment of TSh 450,000 is due in 3 days.',
      type: 'reminder',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      is_read: false
    },
    {
      id: 'demo-3',
      title: 'Goal Milestone Achieved! 🎯',
      message: 'Congratulations! You reached 50% of your Emergency Fund target.',
      type: 'success',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      is_read: true
    },
    {
      id: 'demo-4',
      title: 'Helios.ai Weekly Digest',
      message: 'Your savings rate rose by +3.2% compared to last week. Keep it up!',
      type: 'info',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      is_read: true
    }
  ])

  useEffect(() => {
    if (!user) return
    getNotifications(user.id).then(({ data }) => {
      if (data && data.length > 0) setNotifications(data)
    })
  }, [user])

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    if (user) await markAllNotificationsRead(user.id)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} color="#F59E0B" />
      case 'success': return <CheckCircle size={16} color="#10B981" />
      case 'reminder': return <Bell size={16} color="#EC4899" />
      default: return <Sparkles size={16} color="#8B5CF6" />
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-purple)'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: 16 }}>Notifications</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time alerts, bills & insights</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleMarkAllRead}
              title="Mark all as read"
              style={{ fontSize: 11, padding: '4px 8px' }}
            >
              <CheckCheck size={14} style={{ marginRight: 4 }} /> Mark all read
            </button>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380, overflowY: 'auto' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              style={{
                background: n.is_read ? 'var(--bg-input)' : 'rgba(139, 92, 246, 0.08)',
                border: n.is_read ? '1px solid var(--border-card)' : '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                gap: 12,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: n.is_read ? 'var(--text-secondary)' : 'white' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {formatRelativeTime(n.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {n.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
