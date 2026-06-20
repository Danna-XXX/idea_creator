import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import topicsData from '../data/topics.json'

const categories = ['全部', '成长记录', '测评', '干货', '生活', 'Vlog', '效率工具', '美食', '养生', '影视', '游戏', '穿搭', '旅行', '宠物', '健身', '职场']

const nicheToCategory = {
  food: '美食', health: '养生', film: '影视', game: '游戏',
  fashion: '穿搭', travel: '旅行', pet: '宠物', fitness: '健身',
  reading: '干货', tech: '效率工具', parenting: '生活', career: '职场',
  life: '生活', comedy: '生活', finance: '干货',
}

function PotentialStars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= n ? '#F59E0B' : 'none'}
          stroke={i <= n ? '#F59E0B' : '#40405A'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function Topics() {
  const navigate = useNavigate()
  const [persona, setPersona] = useState(null)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const p = localStorage.getItem('persona')
    if (p) {
      const parsed = JSON.parse(p)
      setPersona(parsed)
      // Auto-set category to match niche
      if (parsed.nicheId && nicheToCategory[parsed.nicheId]) {
        setActiveCategory(nicheToCategory[parsed.nicheId])
      }
    }
  }, [])

  const filtered = topicsData.filter((t) => {
    const matchCat = activeCategory === '全部' || t.category === activeCategory
    const matchSearch = !search || t.title.includes(search) || (t.tags || []).some((tag) => tag.includes(search))
    return matchCat && matchSearch
  })

  // Boost topics that match persona niche
  const sorted = persona?.nicheId
    ? [...filtered].sort((a, b) => {
        const aMatch = (a.nicheIds || []).includes(persona.nicheId) ? 1 : 0
        const bMatch = (b.nicheIds || []).includes(persona.nicheId) ? 1 : 0
        return bMatch - aMatch || b.potential - a.potential
      })
    : filtered

  const personaCategory = persona?.nicheId ? nicheToCategory[persona.nicheId] : null

  return (
    <div className="page-container">
      <PageHeader title="选题库" subtitle={`${topicsData.length} 个精选选题`} />

      {/* Persona hint */}
      {persona && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid var(--border-amber)' }}>
          <span className="text-sm">🎯</span>
          <p className="text-xs" style={{ color: 'var(--amber)' }}>
            已按你的人设「{persona.niche} · {persona.style}」优先排序
          </p>
        </div>
      )}

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input-field py-2.5 pl-9 pr-4 text-sm"
            placeholder="搜索选题或标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip flex-shrink-0 ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c === personaCategory ? `★ ${c}` : c}
          </button>
        ))}
      </div>

      {/* Topic list */}
      <div className="px-5 flex flex-col gap-3">
        {sorted.map((t, i) => {
          const isPersonaMatch = persona?.nicheId && (t.nicheIds || []).includes(persona.nicheId)
          return (
            <div
              key={t.id}
              className="card p-4 fade-up"
              style={{
                animationDelay: `${i * 0.04}s`,
                opacity: 0,
                borderColor: isPersonaMatch ? 'rgba(245,158,11,0.25)' : 'var(--border)',
              }}
            >
              {isPersonaMatch && (
                <span className="text-xs mb-2 inline-block" style={{ color: 'var(--amber)' }}>⭐ 匹配你的赛道</span>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>
                  {t.title}
                </p>
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <PotentialStars n={t.potential} />
                  {t.trend === 'up' && <span className="text-xs" style={{ color: '#10B981' }}>↑ 上升</span>}
                  {t.trend === 'stable' && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→ 稳定</span>}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5 flex-wrap">
                  <span className="tag tag-gray">{t.category}</span>
                  <span className={`tag ${t.difficulty === '低' ? 'tag-jade' : t.difficulty === '中' ? 'tag-amber' : 'tag-coral'}`}>
                    {t.difficulty}难度
                  </span>
                </div>
                <button
                  onClick={() => navigate('/script', { state: { topic: t.title } })}
                  className="text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' }}
                >
                  生成脚本
                </button>
              </div>

              {t.why && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  💡 {t.why}
                </p>
              )}
            </div>
          )
        })}
        {sorted.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🔍</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">没找到匹配的选题</p>
          </div>
        )}
      </div>
    </div>
  )
}
