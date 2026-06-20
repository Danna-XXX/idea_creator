import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const quickActions = [
  {
    to: '/topics',
    emoji: '💡',
    title: '选题库',
    desc: '爆款选题推荐',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    to: '/formulas',
    emoji: '⚡',
    title: '公式库',
    desc: '拆解爆款逻辑',
    color: '#FF6B6B',
    bg: 'rgba(255,107,107,0.08)',
  },
  {
    to: '/script',
    emoji: '📋',
    title: '脚本生成',
    desc: 'AI 一键生成分镜',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    to: '/notes',
    emoji: '✍️',
    title: '随手记',
    desc: '随时记录灵感',
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.08)',
  },
]

const todayTips = [
  '开头3秒是完播率的关键，先想好钩子再拍内容',
  '选题不要追热点，找自己真实经历里的痛点更容易出圈',
  '标题里加上具体数字，点击率平均提升40%',
  '发布时间比你想象的重要：工作日晚上7-10点是流量高峰',
  '每条视频结尾只做一个引导，收藏/关注/评论选一个',
]

export default function Home() {
  const navigate = useNavigate()
  const [persona, setPersona] = useState(null)
  const [tip] = useState(() => todayTips[Math.floor(Math.random() * todayTips.length)])
  const [noteCount, setNoteCount] = useState(0)
  const [userAvatar, setUserAvatar] = useState('')

  useEffect(() => {
    const p = localStorage.getItem('persona')
    if (p) setPersona(JSON.parse(p))
    const notes = JSON.parse(localStorage.getItem('notes') || '[]')
    setNoteCount(notes.length)
    try {
      const prof = JSON.parse(localStorage.getItem('userProfile') || '{}')
      if (prof.avatar) setUserAvatar(prof.avatar)
    } catch {}
  }, [])

  return (
    <div className="page-container">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-1">
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="10" viewBox="0 0 20 14" fill="var(--text-muted)">
            <rect x="0" y="9" width="3" height="5" rx="0.5"/>
            <rect x="4.5" y="6" width="3" height="8" rx="0.5"/>
            <rect x="9" y="3" width="3" height="11" rx="0.5"/>
            <rect x="13.5" y="0" width="3" height="14" rx="0.5"/>
          </svg>
          <svg width="14" height="10" viewBox="0 0 24 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <rect x="1" y="1" width="18" height="10" rx="2"/>
            <path d="M21 4v4a2 2 0 0 0 0-4z"/>
            <rect x="3" y="3" width="12" height="6" rx="1" fill="var(--text-muted)"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>早上好 👋</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Noto Serif SC", serif', color: 'var(--amber)' }}>
            灵感铺子
          </h1>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}
        >
          {userAvatar ? (
            <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </button>
      </div>

      {/* Persona card or CTA */}
      <div className="mx-5 mb-4 fade-up fade-up-1">
        {persona ? (
          <div className="card p-4" style={{ borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>我的博主人设</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{persona.style} · {persona.direction}</p>
              </div>
              <button
                onClick={() => navigate('/positioning')}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' }}
              >
                修改
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.tags.map((tag) => (
                <span key={tag} className="tag tag-amber text-xs">{tag}</span>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/positioning')}
            className="card w-full p-4 text-left"
            style={{ borderStyle: 'dashed', borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.03)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(245,158,11,0.12)' }}>
                🎯
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--amber)' }}>完成账号定位，获取专属选题</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>3步快速生成你的博主人设 →</p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="mx-5 mb-5 grid grid-cols-3 gap-2 fade-up fade-up-2">
        {[
          { label: '已生成脚本', value: '0', unit: '个' },
          { label: '已记录灵感', value: noteCount.toString(), unit: '条' },
          { label: '已用公式', value: '0', unit: '次' },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className="stat-num text-xl font-bold">{s.value}<span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>{s.unit}</span></p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-5 mb-4">
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>QUICK ACTIONS</p>
        <div className="grid grid-cols-2 gap-3 fade-up fade-up-2">
          {quickActions.map((a) => (
            <button
              key={a.to}
              onClick={() => navigate(a.to)}
              className="card p-4 text-left"
              style={{ '--hover-border': a.color }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: a.bg }}
              >
                {a.emoji}
              </div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's tip */}
      <div className="mx-5 mb-4 fade-up fade-up-3">
        <div className="card p-4" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="flex items-start gap-3">
            <span className="text-base flex-shrink-0 mt-0.5">💬</span>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#10B981' }}>今日创作提示</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent formula suggestion */}
      <div className="mx-5 mb-2 fade-up fade-up-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>为你推荐</p>
          <button onClick={() => navigate('/formulas')} className="text-xs" style={{ color: 'var(--amber)' }}>查看全部</button>
        </div>
        <button
          onClick={() => navigate('/formulas')}
          className="card w-full p-4 text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="tag tag-coral text-xs">测评</span>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--jade)' }}>🔥 新鲜 78%</span>
            </div>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>痛点反转公式</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>开头直击痛点，中段用产品逆转，结尾软性收尾 · ❤️ 23.4万</p>
        </button>
      </div>
    </div>
  )
}
