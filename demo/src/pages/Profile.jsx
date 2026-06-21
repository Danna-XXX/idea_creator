import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getCurrentUser, login, register, logout, maskPhone } from '../api/auth'

const getUserFormulas = () => {
  try { return JSON.parse(localStorage.getItem('userFormulas') || '[]') } catch { return [] }
}

export default function Profile() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [user, setUser] = useState(getCurrentUser())
  const [profile, setProfile] = useState({ username: '', avatar: '' })
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [toast, setToast] = useState('')
  const userFormulaCount = getUserFormulas().length

  // Login modal state
  const [showLogin, setShowLogin] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPwd, setLoginPwd] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regNickname, setRegNickname] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('userProfile') || '{}')
      const displayName = saved.username || user?.nickname || ''
      setProfile({ username: displayName, avatar: saved.avatar || '' })
      setNameInput(displayName)
    } catch {}
  }, [user])

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

  const openLogin = () => {
    setAuthTab('login')
    setLoginPhone(''); setLoginPwd('')
    setRegPhone(''); setRegNickname(''); setRegPwd(''); setRegConfirm('')
    setAuthError('')
    setShowLogin(true)
  }

  const switchTab = (tab) => { setAuthTab(tab); setAuthError('') }

  const handleLogin = () => {
    const result = login(loginPhone.trim(), loginPwd)
    if (!result.ok) { setAuthError(result.error); return }
    setUser(result.user)
    setShowLogin(false)
    showToast(`欢迎回来，${result.user.nickname}！`)
  }

  const handleRegister = () => {
    if (regPwd !== regConfirm) { setAuthError('两次密码不一致'); return }
    const result = register(regPhone.trim(), regPwd, regNickname.trim())
    if (!result.ok) { setAuthError(result.error); return }
    setUser(result.user)
    setShowLogin(false)
    showToast(`注册成功，欢迎 ${result.user.nickname}！`)
  }

  const handleLogout = () => { logout(); setUser(null); showToast('已退出登录') }

  const menuItems = [
    { icon: '📊', label: '数据复盘', desc: '视频数据 + AI分析建议', action: () => navigate('/review') },
    { icon: '🎯', label: '我的人设', desc: '查看和修改账号定位', action: () => navigate('/positioning') },
    { icon: '⚡', label: '我的公式', desc: `已保存 ${userFormulaCount} 个自定义公式`, action: () => navigate('/formulas') },
    { icon: '✍️', label: '灵感记录', desc: '随手记录的创作灵感', action: () => navigate('/notes') },
    ...(user ? [{ icon: '🚪', label: '退出登录', desc: '', action: handleLogout, danger: true }] : []),
  ]

  return (
    <div className="page-container">
      <PageHeader title="我的" />

      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-4 pb-6 px-5">
        <div className="relative mb-3">
          {user ? (
            <>
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
            </>
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-2)', border: '2px solid var(--border)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}
        </div>

        {user ? (
          <>
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
                  {profile.username || user.nickname || '点击设置昵称'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{maskPhone(user.phone)}</p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>游客</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>登录后免费次数按账号独立计算</p>
            <button onClick={openLogin} className="btn-amber px-6 py-2 text-sm">立即登录 / 注册</button>
          </>
        )}

        <div className="mt-3 px-3 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' }}>
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
                <span className="text-sm font-medium" style={{ color: item.danger ? 'var(--coral)' : 'var(--text-primary)' }}>{item.label}</span>
                {item.desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>}
              </div>
              {!item.danger && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
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

      {/* Login / Register Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(8,8,16,0.75)' }} onClick={() => setShowLogin(false)}>
          <div className="rounded-t-3xl p-6 fade-up" style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            {/* Tab */}
            <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}>
              {['login', 'register'].map(tab => (
                <button key={tab} className="flex-1 py-2 text-sm rounded-lg transition-all"
                  style={{ background: authTab === tab ? 'var(--bg-card)' : 'transparent', color: authTab === tab ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: authTab === tab ? 600 : 400, border: authTab === tab ? '1px solid var(--border)' : '1px solid transparent' }}
                  onClick={() => switchTab(tab)}>
                  {tab === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            {authTab === 'login' ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>手机号</label>
                  <input type="tel" className="input-field py-3 px-4 text-sm w-full" placeholder="请输入手机号" value={loginPhone} maxLength={11} onChange={e => { setLoginPhone(e.target.value); setAuthError('') }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
                  <input type="password" className="input-field py-3 px-4 text-sm w-full" placeholder="请输入密码" value={loginPwd} onChange={e => { setLoginPwd(e.target.value); setAuthError('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                {authError && <p className="text-xs" style={{ color: 'var(--coral)' }}>⚠️ {authError}</p>}
                <button className="btn-amber w-full py-3.5 text-sm mt-1" onClick={handleLogin}>登录</button>
                <button className="text-xs text-center pb-2" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => switchTab('register')}>没有账号？去注册 →</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>手机号</label>
                  <input type="tel" className="input-field py-3 px-4 text-sm w-full" placeholder="请输入手机号" value={regPhone} maxLength={11} onChange={e => { setRegPhone(e.target.value); setAuthError('') }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>昵称</label>
                  <input type="text" className="input-field py-3 px-4 text-sm w-full" placeholder="给自己起个昵称" value={regNickname} onChange={e => { setRegNickname(e.target.value); setAuthError('') }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>密码</label>
                  <input type="password" className="input-field py-3 px-4 text-sm w-full" placeholder="至少6位" value={regPwd} onChange={e => { setRegPwd(e.target.value); setAuthError('') }} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>确认密码</label>
                  <input type="password" className="input-field py-3 px-4 text-sm w-full" placeholder="再次输入密码" value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setAuthError('') }} onKeyDown={e => e.key === 'Enter' && handleRegister()} />
                </div>
                {authError && <p className="text-xs" style={{ color: 'var(--coral)' }}>⚠️ {authError}</p>}
                <button className="btn-amber w-full py-3.5 text-sm mt-1" onClick={handleRegister}>注册</button>
                <button className="text-xs text-center pb-2" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => switchTab('login')}>已有账号？去登录 →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
