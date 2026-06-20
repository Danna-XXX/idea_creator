import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const getUserFormulas = () => {
  try { return JSON.parse(localStorage.getItem('userFormulas') || '[]') } catch { return [] }
}

export default function Profile() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [profile, setProfile] = useState({ username: '', avatar: '' })
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [toast, setToast] = useState('')
  const userFormulaCount = getUserFormulas().length

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('userProfile') || '{}')
      setProfile({ username: saved.username || '', avatar: saved.avatar || '' })
      setNameInput(saved.username || '')
    } catch {}
  }, [])

  const saveProfile = (updates) => {
    const next = { ...profile, ...updates }
    setProfile(next)
    localStorage.setItem('userProfile', JSON.stringify(next))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => saveProfile({ avatar: ev.target.result })
    reader.readAsDataURL(file)
  }

  const handleSaveName = () => {
    if (nameInput.trim()) saveProfile({ username: nameInput.trim() })
    setEditingName(false)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const menuItems = [
    {
      icon: '📊',
      label: '数据复盘',
      desc: '查看视频数据 + AI分析建议',
      locked: true,
      action: () => navigate('/review'),
    },
    {
      icon: '🎯',
      label: '我的人设',
      desc: '查看和修改账号定位',
      locked: false,
      action: () => navigate('/positioning'),
    },
    {
      icon: '⚡',
      label: '我的公式',
      desc: `已保存 ${userFormulaCount} 个自定义公式`,
      locked: false,
      action: () => navigate('/formulas'),
    },
    {
      icon: '✍️',
      label: '灵感记录',
      desc: '随手记录的创作灵感',
      locked: false,
      action: () => navigate('/notes'),
    },
  ]

  return (
    <div className="page-container">
      <PageHeader title="我的" />

      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-4 pb-6 px-5">
        <div className="relative mb-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
            style={{ background: 'var(--bg-card-2)', border: '2px solid var(--border)' }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--amber)', border: '2px solid var(--bg-app)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className="input-field px-3 py-1.5 text-sm text-center"
              style={{ width: 160 }}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              placeholder="输入博主昵称"
            />
            <button className="btn-amber px-3 py-1.5 text-xs" onClick={handleSaveName}>保存</button>
          </div>
        ) : (
          <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5">
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {profile.username || '点击设置昵称'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}

        <div
          className="mt-2 px-3 py-0.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          免费版
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="mx-5 mb-5">
        <button
          onClick={() => navigate('/upgrade')}
          className="w-full p-4 rounded-2xl flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>升级 Pro / 高级版</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>解锁无限AI生成 · 复盘报告 · 灵感分析</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Menu items */}
      <div className="px-5 mb-5">
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>功能入口</p>
        <div className="card overflow-hidden" style={{ padding: 0 }}>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{ borderBottom: i < menuItems.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="text-lg w-7 flex-shrink-0">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  {item.locked && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--lavender)' }}>
                      🔒 付费
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="px-5 mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>灵感铺子</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI 短视频内容创作助手 · Demo v1.0</p>
            </div>
            <button
              onClick={() => showToast('感谢使用灵感铺子！')}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'var(--bg-card-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              关于我们
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-50"
          style={{ background: 'rgba(30,30,50,0.95)', color: 'var(--text-primary)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
