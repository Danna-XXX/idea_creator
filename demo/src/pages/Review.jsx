import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { analyzeVideoData, getPlatformFromUrl } from '../api/llm'
import { getCountKey } from '../api/auth'

function ScoreCircle({ score }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? 'var(--jade)' : score >= 55 ? 'var(--amber)' : 'var(--coral)'
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg-card-2)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px', transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="50" y="54" textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: color, fontFamily: 'monospace' }}>{score}</text>
      </svg>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>综合评分</p>
    </div>
  )
}

function FactorBar({ name, score }) {
  const color = score >= 75 ? 'var(--jade)' : score >= 55 ? 'var(--amber)' : 'var(--coral)'
  return (
    <div className="mb-1">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{name}</span>
        <span className="text-xs font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-card-2)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  )
}

const MANUAL_FIELDS = [
  { key: 'views', label: '播放量', placeholder: '12400', unit: '' },
  { key: 'completionRate', label: '完播率', placeholder: '68', unit: '%' },
  { key: 'likes', label: '点赞数', placeholder: '342', unit: '' },
  { key: 'comments', label: '评论数', placeholder: '58', unit: '' },
  { key: 'shares', label: '分享数', placeholder: '23', unit: '' },
  { key: 'followerGain', label: '涨粉数', placeholder: '89', unit: '' },
]

export default function Review() {
  const navigate = useNavigate()
  const [inputMode, setInputMode] = useState('manual')
  const [urlInput, setUrlInput] = useState('')
  const [manualData, setManualData] = useState({ views: '', completionRate: '', likes: '', comments: '', shares: '', followerGain: '', topCommentNote: '' })
  const [analysisCount, setAnalysisCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    const count = parseInt(localStorage.getItem(getCountKey('reviewAnalysisCount')) || '0', 10)
    setAnalysisCount(count)
  }, [])

  const isValidUrl = (s) => { try { new URL(s); return true } catch { return false } }
  const canAnalyze = inputMode === 'url' ? isValidUrl(urlInput) : Object.values(manualData).slice(0, 6).some(v => v.trim())

  const handleAnalyzeClick = () => {
    if (analysisCount >= 3) { setShowPaywall(true); return }
    setShowConfirm(true)
  }

  const handleConfirmAnalyze = async () => {
    setShowConfirm(false)
    setLoading(true)
    setError('')
    setResult(null)
    const newCount = analysisCount + 1
    localStorage.setItem(getCountKey('reviewAnalysisCount'), String(newCount))
    setAnalysisCount(newCount)
    try {
      const data = await analyzeVideoData({
        url: inputMode === 'url' ? urlInput : undefined,
        manualData: inputMode === 'manual' ? manualData : undefined,
      })
      setResult(data)
    } catch (e) {
      setError(e.message || '分析失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const remaining = Math.max(0, 3 - analysisCount)

  return (
    <div className="page-container">
      <PageHeader title="数据复盘" back />

      <div className="px-5 flex flex-col gap-4">
        {/* Free trial indicator */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: analysisCount >= 3 ? 'rgba(255,107,107,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${analysisCount >= 3 ? 'rgba(255,107,107,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
          <span className="text-xs" style={{ color: analysisCount >= 3 ? 'var(--coral)' : 'var(--jade)' }}>
            {analysisCount >= 3 ? '免费次数已用完' : '免费体验'}
          </span>
          <span className="text-xs font-medium" style={{ color: analysisCount >= 3 ? 'var(--coral)' : 'var(--jade)' }}>
            {analysisCount >= 3 ? '升级后无限使用' : `已用 ${analysisCount}/3 次`}
          </span>
        </div>

        {/* Input mode toggle */}
        <div className="flex rounded-xl p-1" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}>
          {['manual', 'url'].map((mode) => (
            <button
              key={mode}
              className="flex-1 py-2 text-sm rounded-lg transition-all"
              style={{
                background: inputMode === mode ? 'var(--bg-card)' : 'transparent',
                color: inputMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: inputMode === mode ? 600 : 400,
                border: inputMode === mode ? '1px solid var(--border)' : '1px solid transparent',
              }}
              onClick={() => setInputMode(mode)}
            >
              {mode === 'manual' ? '📊 手动填写' : '🔗 视频链接'}
            </button>
          ))}
        </div>

        {/* URL input */}
        {inputMode === 'url' && (
          <div className="fade-up">
            {urlInput && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--jade)' }} />
                <span className="text-xs" style={{ color: 'var(--jade)' }}>{getPlatformFromUrl(urlInput)}</span>
              </div>
            )}
            <input
              type="url"
              className="input-field py-3 px-4 text-sm"
              placeholder="粘贴小红书 / 抖音 / B站视频链接…"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              style={{ borderColor: isValidUrl(urlInput) ? 'rgba(16,185,129,0.4)' : undefined }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>AI 将基于链接平台规律推断分析，无需真实播放数据</p>
          </div>
        )}

        {/* Manual input */}
        {inputMode === 'manual' && (
          <div className="fade-up flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {MANUAL_FIELDS.map(({ key, label, placeholder, unit }) => (
                <div key={key}>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input-field py-2.5 px-3 text-sm w-full"
                      placeholder={placeholder}
                      value={manualData[key]}
                      onChange={e => setManualData(prev => ({ ...prev, [key]: e.target.value }))}
                      min={0}
                    />
                    {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>评论区高赞内容描述 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>（选填）</span></label>
              <textarea
                className="input-field py-2.5 px-3 text-sm resize-none"
                rows={2}
                placeholder='例："好多人问在哪买" / "大家都在求教程" / "哈哈哈太真实了"'
                value={manualData.topCommentNote}
                onChange={e => setManualData(prev => ({ ...prev, topCommentNote: e.target.value }))}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="card p-3" style={{ borderColor: 'rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)' }}>
            <p className="text-xs" style={{ color: 'var(--coral)' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Analyze button */}
        <button
          className="btn-amber w-full py-4 text-sm mt-1"
          disabled={!canAnalyze || loading}
          onClick={handleAnalyzeClick}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.25)', borderTopColor: 'transparent' }} />
              AI 分析中，请稍候…
            </span>
          ) : analysisCount >= 3 ? '🔒 查看分析（需升级）' : `✨ 开始分析（剩余 ${remaining} 次）`}
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-4">
                <div className="skeleton h-3 rounded w-24 mb-3" />
                <div className="skeleton h-2.5 rounded w-full mb-2" />
                <div className="skeleton h-2.5 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-3 fade-up">
            {/* Score + factors */}
            <div className="card p-4">
              <div className="flex items-start gap-4">
                <ScoreCircle score={result.score} />
                <div className="flex-1 pt-1">
                  {result.factors?.map(f => <FactorBar key={f.name} name={f.name} score={f.score} />)}
                </div>
              </div>
            </div>

            {/* Factor tips */}
            <div className="card p-4">
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>各维度详情</p>
              <div className="flex flex-col gap-3">
                {result.factors?.map(f => (
                  <div key={f.name} className="flex gap-3">
                    <span className="text-xs font-medium whitespace-nowrap pt-0.5" style={{ color: 'var(--amber)', minWidth: 56 }}>{f.name}</span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment insights */}
            {result.commentInsights && (
              <div className="card p-4" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.04)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--lavender)' }}>💬 评论区洞察</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{result.commentInsights.topCommentType}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--lavender)' }}>{result.commentInsights.percentage}</span>
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.commentInsights.meaning}</p>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--lavender)' }}>内容策略建议</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.commentInsights.suggestion}</p>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>🎯 AI 改进建议</p>
                <div className="flex flex-col gap-2.5">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-mono w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--amber)' }}>{i + 1}</span>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multi-video comparison — always visible, always gated */}
        <div className="card p-4 mb-6" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.03)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>📈 多视频对比分析</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>找出你的内容规律，哪类视频最能涨粉</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--lavender)' }}>Pro</span>
          </div>
          {/* Preview — blurred */}
          <div className="rounded-xl overflow-hidden mb-3" style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
            <div className="flex gap-2">
              {['视频A', '视频B'].map(label => (
                <div key={label} className="flex-1 card p-3">
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  {['播放量', '完播率', '点赞率'].map(m => (
                    <div key={m} className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m}</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--amber)' }}>--</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--lavender)', color: '#fff' }}
          >
            解锁多视频对比 · 升级 Pro
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,16,0.75)' }} onClick={() => setShowConfirm(false)}>
          <div className="mx-6 p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', width: '100%' }} onClick={e => e.stopPropagation()}>
            <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>确认消耗 1 次免费体验？</p>
            <p className="text-xs mb-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              本次分析将消耗 1 次免费次数，使用后还剩 <span style={{ color: 'var(--jade)', fontWeight: 600 }}>{remaining - 1}</span> 次
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-card-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} onClick={() => setShowConfirm(false)}>取消</button>
              <button className="flex-1 py-3 rounded-xl text-sm font-semibold btn-amber" onClick={handleConfirmAnalyze}>确认分析</button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,16,0.75)' }} onClick={() => setShowPaywall(false)}>
          <div className="mx-6 p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1.5px solid rgba(168,85,247,0.4)', width: '100%' }} onClick={e => e.stopPropagation()}>
            {analysisCount >= 3 && <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>已免费分析 3 次</p>}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}>🔒</div>
            <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>高级版专属功能</p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {analysisCount >= 3 ? '免费次数已用完，升级后无限次复盘分析' : '多视频对比分析，找出你的爆款规律'}
            </p>
            <div className="text-left space-y-2 mb-5">
              {['📊 无限次单视频深度分析', '📈 多视频横向对比，找爆款规律', '💡 AI 个性化内容策略建议', '📋 账号成长周报'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/upgrade')} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--lavender)', color: '#fff' }}>
              解锁高级版 · 99元/月
            </button>
            <button onClick={() => setShowPaywall(false)} className="text-xs mt-3 block mx-auto" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>暂不升级</button>
          </div>
        </div>
      )}
    </div>
  )
}
