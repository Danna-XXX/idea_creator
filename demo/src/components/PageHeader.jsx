import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back = false, action }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-3 px-5 pt-14 pb-4">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: '"Noto Serif SC", serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
