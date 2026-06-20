import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const tagOptions = [
  { id: 'topic', label: '选题', color: 'tag-amber' },
  { id: 'idea', label: '想法', color: 'tag-coral' },
  { id: 'observe', label: '观察', color: 'tag-jade' },
  { id: 'feel', label: '感受', color: 'tag-lavender' },
]

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

export default function Notes() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [input, setInput] = useState('')
  const [activeTag, setActiveTag] = useState('topic')
  const [filterTag, setFilterTag] = useState('all')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('notes') || '[]')
    setNotes(saved)
  }, [])

  const save = (updated) => {
    setNotes(updated)
    localStorage.setItem('notes', JSON.stringify(updated))
  }

  const addNote = () => {
    if (!input.trim()) return
    const note = { id: Date.now(), content: input.trim(), tag: activeTag, ts: Date.now() }
    save([note, ...notes])
    setInput('')
  }

  const deleteNote = (id) => save(notes.filter((n) => n.id !== id))

  const filtered = filterTag === 'all' ? notes : notes.filter((n) => n.tag === filterTag)

  const tagInfo = (id) => tagOptions.find((t) => t.id === id)

  return (
    <div className="page-container">
      <PageHeader title="随手记" subtitle="随时捕捉灵感，AI 帮你分析" />

      {/* Input area */}
      <div className="px-5 mb-4">
        <div className="card p-4" style={{ borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.03)' }}>
          <textarea
            className="w-full bg-transparent text-sm resize-none outline-none mb-3"
            style={{ color: 'var(--text-primary)', minHeight: 72 }}
            placeholder="随手记下你的灵感、想法、观察…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote()
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {tagOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTag(t.id)}
                  className={`tag ${t.color} cursor-pointer transition-opacity`}
                  style={{ opacity: activeTag === t.id ? 1 : 0.4 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              className="btn-amber px-4 py-1.5 text-xs"
              disabled={!input.trim()}
              onClick={addNote}
            >
              记录
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button className={`chip flex-shrink-0 ${filterTag === 'all' ? 'active' : ''}`} onClick={() => setFilterTag('all')}>
          全部 {notes.length > 0 && `(${notes.length})`}
        </button>
        {tagOptions.map((t) => {
          const count = notes.filter((n) => n.tag === t.id).length
          return count > 0 ? (
            <button key={t.id} className={`chip flex-shrink-0 ${filterTag === t.id ? 'active' : ''}`} onClick={() => setFilterTag(t.id)}>
              {t.label} ({count})
            </button>
          ) : null
        })}
      </div>

      {/* Notes list */}
      <div className="px-5 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">✍️</p>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>还没有记录</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>随手记下你看到的、想到的</p>
          </div>
        )}
        {filtered.map((note) => {
          const tag = tagInfo(note.tag)
          return (
            <div key={note.id} className="card p-4 fade-up">
              <div className="flex items-start gap-2 mb-2">
                <span className={`tag ${tag?.color || 'tag-gray'} flex-shrink-0`}>{tag?.label || note.tag}</span>
                <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {timeAgo(note.ts)}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>{note.content}</p>
              <div className="flex gap-2">
                {note.tag === 'topic' && (
                  <button
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)' }}
                    onClick={() => navigate('/script', { state: { topic: note.content } })}
                  >
                    生成脚本
                  </button>
                )}
                <button
                  className="text-xs px-3 py-1.5 rounded-full ml-auto"
                  style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--coral)' }}
                  onClick={() => deleteNote(note.id)}
                >
                  删除
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Analysis premium banner */}
      {notes.length >= 3 && (
        <div className="mx-5 mt-4 mb-4">
          <div
            className="card p-4"
            style={{
              borderColor: 'rgba(168,85,247,0.3)',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(245,158,11,0.04))',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🤖</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--lavender)' }}>AI 灵感分析</p>
                  <span className="tag tag-lavender" style={{ fontSize: 10 }}>Pro</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  你已记录了 {notes.length} 条灵感。升级 Pro 后，AI 将分析你的高频关注主题，自动推荐 3 个最适合你的选题方向。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
