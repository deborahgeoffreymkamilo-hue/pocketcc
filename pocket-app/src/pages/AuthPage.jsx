import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Zap, Mail, Lock, User, Sparkles, Database } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp, enterDemoMode, isSupabaseConfigured } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else {
        if (!fullName.trim()) { setError('Please enter your name'); setLoading(false); return }
        const { error } = await signUp(email, password, fullName)
        if (error) setError(error.message)
        else setSuccess('Account created! Check your email to verify.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Neon glow bg */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(139,92,246,0.5)'
          }}>P</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            <span className="neon-text">Pocket</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Tanzania-first personal finance & Helios investment dashboard
          </p>
        </div>

        {/* Card */}
        <div className="card neon-border" style={{ padding: 28 }}>
          {/* Quick Demo Mode Trigger */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.1) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--neon-purple)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> INSTANT SHOWCASE
              </span>
              <span className="badge" style={{ background: isSupabaseConfigured ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: isSupabaseConfigured ? '#10B981' : '#F59E0B' }}>
                {isSupabaseConfigured ? 'Supabase Ready' : 'Demo Ready'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm w-full"
              onClick={enterDemoMode}
              style={{
                borderRadius: 20,
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 15px rgba(139,92,246,0.5)',
                fontWeight: 700
              }}
            >
              Explore Demo Mode (Nadia Rashid)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }} />
            <span>OR LOGIN WITH SUPABASE</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }} />
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            <button
              className={`tab${mode === 'signin' ? ' active' : ''}`}
              onClick={() => setMode('signin')}
            >Sign In</button>
            <button
              className={`tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => setMode('signup')}
            >Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nadia Rashid"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="nadia@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div className="form-input-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingRight: 44 }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px',
                color: '#EF4444', fontSize: 13
              }}>{error}</div>
            )}

            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 8, padding: '10px 14px',
                color: '#10B981', fontSize: 13
              }}>{success}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <Zap size={16} />
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-purple)', fontWeight: 600 }}
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
