export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-screen" style={{ background: 'var(--bg-primary)', height: '100vh' }}>
      <div className="animate-pulse-glow" style={{
        width: 60, height: 60,
        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 800, color: 'white'
      }}>P</div>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
    </div>
  )
}
