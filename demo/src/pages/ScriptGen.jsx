import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCountKey } from '../api/auth'
import * as XLSX from 'xlsx'
import PageHeader from '../components/PageHeader'
import { generateScript, refineScript, analyzeUrl, getPlatformFromUrl } from '../api/llm'
import formulas from '../data/formulas.json'

const durations = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '3分钟', value: 180 },
  { label: '5分钟', value: 300 },
]

const contentTypes = ['测评', 'Vlog', '知识分享', '种草', 'Q&A', '日常记录']
const styles = ['真实感', '专业干货', '轻松幽默', '治愈温暖', '励志正能量']

function downloadExcel(script, topic, duration) {
  const headers = ['时间段', '镜头类型', '画面内容', '口播/旁白', '字幕提示', 'BGM氛围', '设计意图']
  const rows = script.segments.map((s) => [
    s.timeRange || '',
    s.shotType || '',
    s.scene || '',
    s.dialogue || '',
    s.caption || '',
    s.bgm || '',
    s.intent || '',
  ])

  const infoRows = [
    ['【灵感铺子 AI 分镜脚本】'],
    [`选题：${topic}`],
    [`时长：${duration}秒`],
    [`标题建议：${script.title || ''}`],
    [`开头钩子：${script.hook || ''}`],
    [`推荐发布时间：${script.postTime || ''}`],
    [],
  ]

  const wsData = [
    ...infoRows,
    headers,
    ...rows,
    [],
    ['封面文案方案', ...(script.coverOptions || [])],
    ['话题标签', ...(script.hashtags || [])],
    ['结尾 CTA', script.cta || ''],
  ]

  const ws = XLSX.utils.aoa_to_sheet(wsData)
  ws['!cols'] = [
    { wch: 10 }, { wch: 14 }, { wch: 32 },
    { wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 28 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '分镜脚本')

  const date = new Date().toISOString().slice(0, 10)
  const safeTitle = topic.slice(0, 12).replace(/[\\/:*?"<>|]/g, '')
  XLSX.writeFile(wb, `分镜脚本_${safeTitle}_${duration}s_${date}.xlsx`)
}

export default function ScriptGen() {
  const location = useLocation()
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(60)
  const [customDuration, setCustomDuration] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [contentType, setContentType] = useState('测评')
  const [style, setStyle] = useState('真实感')
  const [selectedFormula, setSelectedFormula] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeSegment, setActiveSegment] = useState(null)
  // Refinement
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState('')
  // URL import
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [urlImportInput, setUrlImportInput] = useState('')
  const [urlImporting, setUrlImporting] = useState(false)
  const [urlImportError, setUrlImportError] = useState('')
  // History
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scriptHistory') || '[]') } catch { return [] }
  })
  const [showHistory, setShowHistory] = useState(false)
  // Excel download count
  const [dlCount, setDlCount] = useState(() => parseInt(localStorage.getItem(getCountKey('excelDownloadCount')) || '0', 10))
  const [dlBlocked, setDlBlocked] = useState(false)

  useEffect(() => {
    if (location.state?.topic) setTopic(location.state.topic)
    if (location.state?.formulaId) {
      const f = formulas.find((x) => x.id === location.state.formulaId)
      if (f) {
        setSelectedFormula(f)
        setContentType(f.category === 'Vlog' ? 'Vlog' : f.category)
      }
    }
  }, [location.state])

  const finalDuration = showCustom ? (parseInt(customDuration) || 60) : duration

  const buildFormulaContent = (formula) => {
    if (!formula) return null
    return `公式名称：${formula.title}
说明：${formula.description}
段落结构：
${formula.segments.map((s, i) => `${i + 1}. [${s.part}] ${s.timeRange} - 镜头：${s.shotType}
   内容：${s.content}
   示例话术：${s.example}
   设计意图：${s.intent}`).join('\n')}`
  }

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setActiveSegment(null)
    setRefineInput('')
    try {
      const data = await generateScript({
        topic: topic.trim(),
        duration: finalDuration,
        contentType,
        style,
        formulaContent: buildFormulaContent(selectedFormula),
      })
      setResult(data)
      setHistory(prev => {
        const entry = { id: Date.now().toString(), topic: topic.trim(), duration: finalDuration, contentType, style, result: data, savedAt: new Date().toISOString() }
        const next = [entry, ...prev].slice(0, 20)
        localStorage.setItem('scriptHistory', JSON.stringify(next))
        return next
      })
    } catch (e) {
      setError(e.message || '生成失败，请检查 API Key 或重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRefine = async () => {
    if (!refineInput.trim() || !result) return
    setRefining(true)
    setRefineError('')
    try {
      const updated = await refineScript({ originalScript: result, userRequest: refineInput.trim() })
      setResult(updated)
      setRefineInput('')
      setActiveSegment(null)
    } catch (e) {
      setRefineError(e.message || '润色失败，请重试')
    } finally {
      setRefining(false)
    }
  }

  const handleRestoreHistory = (item) => {
    setTopic(item.topic)
    setDuration(item.duration)
    setContentType(item.contentType)
    setStyle(item.style)
    setResult(item.result)
    setActiveSegment(null)
    setShowHistory(false)
  }

  const handleDeleteHistory = (id) => {
    setHistory(prev => {
      const next = prev.filter(x => x.id !== id)
      localStorage.setItem('scriptHistory', JSON.stringify(next))
      return next
    })
  }

  const isValidUrl = (s) => { try { new URL(s); return true } catch { return false } }

  const handleUrlImport = async () => {
    if (!isValidUrl(urlImportInput.trim())) return
    setUrlImporting(true)
    setUrlImportError('')
    try {
      const result = await analyzeUrl(urlImportInput.trim())
      if (result.title) setTopic(result.title)
      const catMap = { '测评': '测评', '知识': '知识分享', 'Vlog': 'Vlog', '种草': '种草' }
      if (result.category && catMap[result.category]) setContentType(catMap[result.category])
      setShowUrlImport(false)
      setUrlImportInput('')
    } catch (e) {
      setUrlImportError(e.message || '解析失败，请检查 API Key 或重试')
    } finally {
      setUrlImporting(false)
    }
  }

  const partColor = (idx, total) => {
    if (idx === 0) return 'var(--amber)'
    if (idx === total - 1) return 'var(--jade)'
    return 'var(--coral)'
  }

  return (
    <div className="page-container">
      <PageHeader
        title="脚本生成器"
        subtitle="AI 生成精准分镜，可润色下载"
        action={
          <button
            onClick={() => setShowHistory(true)}
            className="relative w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}
          >
            <span className="text-base">📋</span>
            {history.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-mono"
                style={{ background: 'var(--amber)', color: '#000', fontSize: 9 }}
              >
                {history.length > 9 ? '9+' : history.length}
              </span>
            )}
          </button>
        }
      />

      <div className="px-5 flex flex-col gap-4">
        {/* Formula hint */}
        {selectedFormula && (
          <div className="card p-3 fade-up" style={{ borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--amber)' }}>⚡ 已选公式</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFormula.title}</span>
              </div>
              <button
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,107,107,0.12)', color: 'var(--coral)' }}
                onClick={() => setSelectedFormula(null)}
              >
                移除
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>AI 将严格按照此公式的段落结构生成脚本</p>
          </div>
        )}

        {/* URL import */}
        <div className="fade-up fade-up-1">
          <button
            onClick={() => setShowUrlImport(!showUrlImport)}
            className="w-full card p-3 text-left flex items-center justify-between"
            style={{ borderStyle: 'dashed', borderColor: showUrlImport ? 'rgba(16,185,129,0.4)' : 'var(--border)', background: showUrlImport ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔗</span>
              <div>
                <p className="text-sm font-medium" style={{ color: showUrlImport ? 'var(--jade)' : 'var(--text-primary)' }}>从视频链接获取灵感</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>粘贴小红书/抖音链接，AI 自动填写选题</p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showUrlImport ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showUrlImport && (
            <div className="card p-4 mt-2 fade-up" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                粘贴视频链接，AI 根据平台风格推断选题和内容类型
              </p>
              {urlImportInput && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--jade)' }} />
                  <span className="text-xs" style={{ color: 'var(--jade)' }}>{getPlatformFromUrl(urlImportInput)}</span>
                </div>
              )}
              <input
                type="url"
                className="input-field py-2.5 px-3 text-sm mb-2"
                placeholder="https://www.xiaohongshu.com/..."
                value={urlImportInput}
                onChange={(e) => setUrlImportInput(e.target.value)}
                style={{ borderColor: urlImportInput ? 'rgba(16,185,129,0.4)' : undefined }}
              />
              {urlImportError && <p className="text-xs mb-2" style={{ color: 'var(--coral)' }}>⚠️ {urlImportError}</p>}
              <button
                className="w-full py-2.5 text-sm rounded-xl font-medium"
                style={{
                  background: isValidUrl(urlImportInput) ? 'rgba(16,185,129,0.2)' : 'var(--bg-card-2)',
                  color: isValidUrl(urlImportInput) ? 'var(--jade)' : 'var(--text-muted)',
                  border: `1px solid ${isValidUrl(urlImportInput) ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                }}
                disabled={!isValidUrl(urlImportInput) || urlImporting}
                onClick={handleUrlImport}
              >
                {urlImporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(16,185,129,0.3)', borderTopColor: 'var(--jade)' }} />
                    AI 解析中…
                  </span>
                ) : '✨ 解析链接，填写选题'}
              </button>
            </div>
          )}
        </div>

        {/* Topic input */}
        <div className="fade-up fade-up-1">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>选题 / 内容主题</label>
          <textarea
            className="input-field py-3 px-4 text-sm resize-none"
            rows={2}
            placeholder="例：我是如何30天从0涨粉1000的（真实复盘）"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div className="fade-up fade-up-1">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>视频时长</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {durations.map((d) => (
              <button
                key={d.value}
                className={`chip ${!showCustom && duration === d.value ? 'active' : ''}`}
                onClick={() => { setDuration(d.value); setShowCustom(false) }}
              >
                {d.label}
              </button>
            ))}
            <button className={`chip ${showCustom ? 'active' : ''}`} onClick={() => setShowCustom(true)}>
              自定义
            </button>
          </div>
          {showCustom && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input-field py-2 px-3 text-sm w-28"
                placeholder="秒数"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                min={5} max={600}
              />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>秒</span>
            </div>
          )}
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            将生成约 {Math.round(finalDuration / 5)} 个分镜段落
          </p>
        </div>

        {/* Content type */}
        <div className="fade-up fade-up-2">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>内容类型</label>
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((t) => (
              <button key={t} className={`chip ${contentType === t ? 'active' : ''}`} onClick={() => setContentType(t)}>{t}</button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="fade-up fade-up-2">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>表达风格</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button key={s} className={`chip ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn-amber w-full py-4 text-sm mt-1 fade-up fade-up-3"
          disabled={!topic.trim() || loading}
          onClick={handleGenerate}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.25)', borderTopColor: 'transparent' }} />
              AI 生成中，请稍候…
            </span>
          ) : `✨ ${selectedFormula ? `按【${selectedFormula.title}】` : ''}生成分镜脚本`}
        </button>

        {error && (
          <div className="card p-3" style={{ borderColor: 'rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)' }}>
            <p className="text-xs" style={{ color: 'var(--coral)' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-3 rounded w-20 mb-3" />
                <div className="skeleton h-2.5 rounded w-full mb-2" />
                <div className="skeleton h-2.5 rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="fade-up">
            {/* Title & hook */}
            <div className="card p-4 mb-3" style={{ borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.04)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>标题建议</p>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{result.title}</p>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>开头3秒钩子</p>
              <p className="text-sm italic" style={{ color: 'var(--amber)' }}>"{result.hook}"</p>
            </div>

            {/* Segments */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)', letterSpacing: '0.8px' }}>
                分镜脚本 · {result.segments?.length} 段
              </p>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>点击展开详情</span>
            </div>

            <div className="flex flex-col gap-2 mb-3">
              {result.segments?.map((seg, i) => (
                <div key={i}>
                  <button
                    className="card w-full p-3 text-left"
                    style={{
                      borderColor: activeSegment === i ? partColor(i, result.segments.length) + '60' : 'var(--border)',
                      background: activeSegment === i ? `${partColor(i, result.segments.length)}08` : 'var(--bg-card)',
                    }}
                    onClick={() => setActiveSegment(activeSegment === i ? null : i)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                          style={{ background: `${partColor(i, result.segments.length)}20`, color: partColor(i, result.segments.length) }}
                        >
                          {seg.timeRange}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{seg.shotType}</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: activeSegment === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    <p className="text-xs mt-1.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                      {seg.dialogue || seg.scene}
                    </p>
                  </button>

                  {activeSegment === i && (
                    <div className="card mt-1 p-3 fade-up" style={{ borderColor: `${partColor(i, result.segments.length)}30` }}>
                      <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                        {[
                          ['画面内容', seg.scene],
                          ['口播台词', seg.dialogue],
                          ['字幕提示', seg.caption],
                          ['BGM氛围', seg.bgm],
                          ['设计意图', seg.intent],
                        ].filter(([, v]) => v).map(([label, value]) => (
                          <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="py-2 pr-3 font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)', width: 56 }}>{label}</td>
                            <td className="py-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{value}</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cover + hashtags + posttime */}
            {result.coverOptions?.length > 0 && (
              <div className="card p-4 mb-3">
                <p className="text-xs font-medium mb-2.5" style={{ color: 'var(--text-muted)' }}>📸 封面文案方案</p>
                <div className="flex flex-col gap-1.5">
                  {result.coverOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--bg-card-2)' }}>
                      <span className="text-xs font-mono" style={{ color: 'var(--amber)' }}>方案{i + 1}</span>
                      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.hashtags?.length > 0 && (
              <div className="card p-4 mb-3">
                <p className="text-xs font-medium mb-2.5" style={{ color: 'var(--text-muted)' }}># 话题标签</p>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, i) => (
                    <span key={i} className="tag tag-amber">{tag}</span>
                  ))}
                </div>
                {result.postTime && (
                  <p className="text-xs mt-2.5" style={{ color: 'var(--text-muted)' }}>
                    🕐 推荐发布时间：<span style={{ color: 'var(--jade)' }}>{result.postTime}</span>
                  </p>
                )}
              </div>
            )}

            {result.cta && (
              <div className="card p-3 mb-3" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <p className="text-xs mb-1" style={{ color: '#10B981' }}>结尾引导话术</p>
                <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{result.cta}"</p>
              </div>
            )}

            {/* ✨ Refinement dialog */}
            <div className="card p-4 mb-3" style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.04)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--lavender)' }}>✏️ 告诉 AI 怎么改</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                例如：把开头改得更有冲击力 / 口播语气更轻松 / 结尾加更强的行动引导
              </p>
              <textarea
                className="input-field py-2.5 px-3 text-sm resize-none mb-2"
                rows={2}
                placeholder="描述你想修改的方向…"
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                style={{ borderColor: refineInput ? 'rgba(168,85,247,0.4)' : undefined }}
              />
              {refineError && (
                <p className="text-xs mb-2" style={{ color: 'var(--coral)' }}>⚠️ {refineError}</p>
              )}
              <button
                className="w-full py-2.5 text-sm rounded-xl font-medium transition-all"
                style={{
                  background: refineInput.trim() ? 'rgba(168,85,247,0.2)' : 'var(--bg-card-2)',
                  color: refineInput.trim() ? 'var(--lavender)' : 'var(--text-muted)',
                  border: `1px solid ${refineInput.trim() ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
                }}
                disabled={!refineInput.trim() || refining}
                onClick={handleRefine}
              >
                {refining ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(168,85,247,0.3)', borderTopColor: 'var(--lavender)' }} />
                    AI 修改中…
                  </span>
                ) : '🔄 AI 润色修改'}
              </button>
            </div>

            {/* Download */}
            <div className="mb-6">
              <button
                className="btn-amber w-full py-3.5 text-sm flex items-center justify-center gap-2"
                onClick={() => {
                  if (dlCount >= 5) { setDlBlocked(true); return }
                  downloadExcel(result, topic, finalDuration)
                  const next = dlCount + 1
                  localStorage.setItem(getCountKey('excelDownloadCount'), String(next))
                  setDlCount(next)
                  setDlBlocked(false)
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {dlCount >= 5 ? '🔒 下载 Excel（需升级）' : `下载 Excel 分镜表格（剩余 ${5 - dlCount} 次）`}
              </button>
              {dlBlocked && (
                <div className="mt-2 px-4 py-3 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)' }}>
                  <p className="text-xs" style={{ color: 'var(--coral)' }}>已用完 5 次免费下载</p>
                  <button
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(168,85,247,0.15)', color: 'var(--lavender)', border: '1px solid rgba(168,85,247,0.3)' }}
                    onClick={() => navigate('/upgrade')}
                  >去升级 →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* History bottom sheet */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(8,8,16,0.75)' }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="rounded-t-3xl p-5 fade-up"
            style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', maxHeight: '70vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>脚本历史记录</p>
              <button
                onClick={() => setShowHistory(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >✕</button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>还没有生成过脚本</p>
            ) : (
              <div className="flex flex-col gap-2 pb-4">
                {history.map(item => (
                  <div key={item.id} className="card p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.topic}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.contentType} · {item.duration}s · {new Date(item.savedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreHistory(item)}
                      className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' }}
                    >恢复</button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
                      style={{ background: 'var(--bg-card-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
