import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: '首页',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#F59E0B' : 'none'} stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/topics',
    label: '选题',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    to: '/formulas',
    label: '公式',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    to: '/script',
    label: '脚本',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    to: '/notes',
    label: '灵感',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    to: '/profile',
    label: '我的',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#F59E0B' : '#8080AA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex flex-col items-center gap-1 py-1 px-1.5 min-w-[44px]"
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: isActive ? '#F59E0B' : '#8080AA' }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
