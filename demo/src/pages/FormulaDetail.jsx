import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import formulasData from '../data/formulas.json'

const getUserFormulas = () => {
  try { return JSON.parse(localStorage.getItem('userFormulas') || '[]') } catch { return [] }
}

function fmt(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}

function FreshnessBar({ value }) {
  const color = value >= 85 ? '#10B981' : value >= 65 ? '#F59E0B' : '#FF6B6B'
  const label = value >= 85 ? '非常新鲜' : value >= 65 ? '适中' : '⚠️ 过热慎用'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>公式新鲜度</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{value}% · {label}</span>
      </div>
      <div className="freshness-bar" style={{ height: 6 }}>
        <div className="freshness-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      {value < 65 && (
        <p className="text-xs mt-1.5" style={{ color: '#FF6B6B' }}>
          此公式近期被大量使用，建议在结构基础上做差异化处理
        </p>
      )}
    </div>
  )
}

export default function FormulaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const allFormulas = [...getUserFormulas(), ...formulasData]
  const formula = allFormulas.find((f) => f.id === id)

  if (!formula) return (
    <div className="page-container">
      <PageHeader title="公式详情" back />
      <div className="px-5 pt-10 text-center">
        <p style={{ color: 'var(--text-muted)' }}>公式不存在</p>
      </div>
    </div>
  )

  const partColors = { '开头': 'var(--amber)', '中段': 'var(--coral)', '结尾': 'var(--jade)' }

  return (
    <div className="page-container">
      <PageHeader
        title={formula.title}
        back
        action={
          <button
            className="btn-amber px-4 py-2 text-xs"
            onClick={() => navigate('/script', { state: { formulaId: formula.id } })}
          >
            用此公式
          </button>
        }
      />

      <div className="px-5">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`tag ${formula.categoryTag || 'tag-gray'}`}>{formula.category}</span>
          <span className="tag tag-gray">{formula.platform}</span>
          {formula.sourceUrl && (
            <a
              href={formula.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tag tag-jade ml-auto flex items-center gap-1"
              style={{ textDecoration: 'none' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              查看原视频
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="card p-4 mb-4 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '❤️', label: '点赞', val: fmt(formula.likes) },
            { icon: '💬', label: '评论', val: fmt(formula.comments) },
            { icon: '🔖', label: '收藏', val: fmt(formula.saves) },
          ].map((s) => (
            <div key={s.label}>
              <p className="stat-num text-lg font-bold">{s.val}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.icon} {s.label}</p>
            </div>
          ))}
        </div>

        {/* Freshness */}
        <div className="card p-4 mb-4">
          <FreshnessBar value={formula.freshness} />
        </div>

        {/* Description */}
        <div className="card p-4 mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.8px' }}>公式说明</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{formula.description}</p>
        </div>

        {/* Segments */}
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.8px' }}>完整拆解</p>
        <div className="flex flex-col gap-3 mb-6">
          {formula.segments.map((seg, i) => (
            <div key={i} className="card p-4" style={{ borderLeft: `3px solid ${partColors[seg.part] || 'var(--border)'}` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${partColors[seg.part]}20`, color: partColors[seg.part] || 'var(--text-secondary)' }}>
                  {seg.part}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{seg.timeRange}</span>
                <span className="tag tag-gray ml-auto">{seg.shotType}</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>画面内容</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{seg.content}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-card-2)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>话术示例</p>
                  <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>{seg.example}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>设计意图</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--amber)' }}>{seg.intent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-amber w-full py-3.5 text-sm mb-6"
          onClick={() => navigate('/script', { state: { formulaId: formula.id } })}
        >
          使用这个公式生成脚本 →
        </button>
      </div>
    </div>
  )
}
