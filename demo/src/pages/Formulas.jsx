import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { analyzeUrl, getPlatformFromUrl } from '../api/llm'
import formulasData from '../data/formulas.json'

const categories = ['全部', '测评', '知识', 'Vlog', '种草']

function FreshnessBar({ value }) {
  const color = value >= 85 ? '#10B981' : value >= 65 ? '#F59E0B' : '#FF6B6B'
  const label = value >= 85 ? '非常新鲜' : value >= 65 ? '适中' : '⚠️ 过热'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>新鲜度</span>
        <span className="text-xs font-mono" style={{ color }}>{value}% · {label}</span>
      </div>
      <div className="freshness-bar">
        <div className="freshness-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function fmt(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

export default function Formulas() {
  const navigate = useNavigate()
  const [active, setActive] = useState('全部')
  const [search, setSearch] = useState('')
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [userFormulas, setUserFormulas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('userFormulas') || '[]') } catch { return [] }
  })

  const allFormulas = [...userFormulas.map((f) => ({ ...f, isUser: true })), ...formulasData]

  const filtered = allFormulas.filter((f) => {
    const matchCat = active === '全部' || f.category === active
    const matchSearch = !search || f.title.includes(search) || f.description?.includes(search)
    return matchCat && matchSearch
  })

  const isValidUrl = (s) => {
    try { new URL(s); return true } catch { return false }
  }

  const handleAnalyze = async () => {
    if (!urlInput.trim() || !isValidUrl(urlInput.trim())) return
    setAnalyzing(true)
    setAnalyzeError('')
    try {
      const platform = getPlatformFromUrl(urlInput.trim())
      const result = await analyzeUrl(urlInput.trim())
      const newFormula = {
        id: `user_${Date.now()}`,
        title: result.title || '自定义公式',
        category: result.category || '其他',
        categoryTag: 'tag-lavender',
        likes: 0,
        comments: 0,
        saves: 0,
        freshness: 100,
        platform,
        description: result.description || '',
        segments: result.segments || [],
        sourceUrl: urlInput.trim(),
        isUser: true,
      }
      const updated = [newFormula, ...userFormulas]
      setUserFormulas(updated)
      localStorage.setItem('userFormulas', JSON.stringify(updated))
      setShowAnalyze(false)
      setUrlInput('')
    } catch (e) {
      setAnalyzeError(e.message || '分析失败，请检查 API Key 或重试')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="page-container">
      <PageHeader title="公式库" subtitle="真实爆款拆解 + 自定义上传" />

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input-field py-2.5 pl-9 pr-4 text-sm"
            placeholder="搜索公式名称或说明..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((c) => (
          <button key={c} className={`chip flex-shrink-0 ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</button>
        ))}
      </div>

      {/* Analyze entry */}
      <div className="px-5 mb-4">
        <button
          onClick={() => setShowAnalyze(!showAnalyze)}
          className="w-full card p-3 text-left flex items-center justify-between"
          style={{ borderStyle: 'dashed', borderColor: showAnalyze ? 'rgba(168,85,247,0.4)' : 'var(--border)', background: showAnalyze ? 'rgba(168,85,247,0.04)' : 'var(--bg-card)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🔗</span>
            <div>
              <p className="text-sm font-medium" style={{ color: showAnalyze ? 'var(--lavender)' : 'var(--text-primary)' }}>粘贴视频链接，AI 提炼公式</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>输入小红书/抖音/B站链接，AI 分析平台风格生成公式</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: showAnalyze ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showAnalyze && (
          <div className="card p-4 mt-2 fade-up" style={{ borderColor: 'rgba(168,85,247,0.3)' }}>
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              粘贴视频链接（小红书 / 抖音 / B站）
            </p>
            <p className="text-xs mb-2.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
              ⚠️ 受平台限制无法读取视频内容，AI 将根据平台风格生成参考公式
            </p>

            {/* Platform detection */}
            {urlInput && (() => {
              const p = getPlatformFromUrl(urlInput)
              const colors = { '小红书': '#FF2442', '抖音': '#00D4FF', 'B站': '#FB7299', '短视频平台': 'var(--text-muted)' }
              return (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[p] }} />
                  <span className="text-xs" style={{ color: colors[p] }}>检测到：{p}</span>
                </div>
              )
            })()}

            <input
              type="url"
              className="input-field py-2.5 px-3 text-sm mb-2"
              placeholder="https://www.xiaohongshu.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{ borderColor: urlInput ? 'rgba(168,85,247,0.4)' : undefined }}
            />
            {analyzeError && <p className="text-xs mb-2" style={{ color: 'var(--coral)' }}>⚠️ {analyzeError}</p>}
            <button
              className="w-full py-2.5 text-sm rounded-xl font-medium"
              style={{
                background: isValidUrl(urlInput) ? 'rgba(168,85,247,0.2)' : 'var(--bg-card-2)',
                color: isValidUrl(urlInput) ? 'var(--lavender)' : 'var(--text-muted)',
                border: `1px solid ${isValidUrl(urlInput) ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
              }}
              disabled={!isValidUrl(urlInput) || analyzing}
              onClick={handleAnalyze}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(168,85,247,0.3)', borderTopColor: 'var(--lavender)' }} />
                  AI 分析中…
                </span>
              ) : '🔍 AI 解析并生成公式'}
            </button>
          </div>
        )}
      </div>

      {/* Formula cards */}
      <div className="px-5 flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🔍</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">没有匹配的公式</p>
          </div>
        )}
        {filtered.map((f, i) => (
          <div
            key={f.id}
            className="card p-4 fade-up"
            style={{ animationDelay: `${i * 0.05}s`, opacity: 0, borderColor: f.isUser ? 'rgba(168,85,247,0.25)' : 'var(--border)' }}
          >
            {f.isUser && (
              <span className="text-xs mb-2 inline-flex items-center gap-1" style={{ color: 'var(--lavender)' }}>
                <span>⭐</span> 我的公式
              </span>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`tag ${f.categoryTag || 'tag-gray'}`}>{f.category}</span>
                  <span className="tag tag-gray text-xs">{f.platform}</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              </div>
            </div>

            {!f.isUser && (
              <div className="flex gap-3 mb-3">
                <span className="text-xs stat-num">❤️ {fmt(f.likes)}</span>
                <span className="text-xs stat-num">💬 {fmt(f.comments)}</span>
                <span className="text-xs stat-num">🔖 {fmt(f.saves)}</span>
              </div>
            )}

            <div className="mb-3">
              <FreshnessBar value={f.freshness} />
            </div>

            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{f.description}</p>

            {f.segments?.[0] && (
              <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--bg-card-2)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>
                  📌 {f.segments[0].part} · {f.segments[0].timeRange}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.segments[0].intent}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => navigate(`/formulas/${f.id}`)} className="btn-ghost flex-1 py-2.5 text-sm">
                查看完整拆解
              </button>
              <button onClick={() => navigate('/script', { state: { formulaId: f.id } })} className="btn-amber flex-1 py-2.5 text-sm">
                用此公式
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
