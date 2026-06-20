import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

function FakeChart() {
  const points = [20, 35, 28, 55, 42, 78, 65, 90, 72, 95]
  const max = 100
  const w = 280
  const h = 80
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill="url(#chartGrad)"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Review() {
  const navigate = useNavigate()

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <PageHeader title="数据复盘" back />

      {/* Blurred preview background */}
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
        <div className="px-5 mb-4">
          <div className="card p-4">
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>近30天播放量趋势</p>
            <FakeChart />
            <div className="flex justify-between mt-2">
              {['6/1','6/8','6/15','6/22','6/29'].map(d => (
                <span key={d} className="text-xs" style={{ color: 'var(--text-muted)' }}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mb-4 grid grid-cols-2 gap-3">
          {[
            { label: '总播放量', val: '12.4万' },
            { label: '平均完播率', val: '68%' },
            { label: '最高点赞', val: '3,421' },
            { label: '涨粉数', val: '892' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-xl font-bold stat-num">{s.val}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="px-5 mb-4">
          <div className="card p-4">
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>爆款视频归因分析</p>
            {['开头钩子强度', '话题标签匹配度', '发布时间优化', '内容完播率'].map((item, i) => (
              <div key={item} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--amber)' }}>{[85, 72, 90, 68][i]}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-card-2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${[85, 72, 90, 68][i]}%`, background: 'var(--amber)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paywall overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'rgba(8,8,16,0.7)', backdropFilter: 'blur(2px)', top: 56 }}
      >
        <div
          className="mx-6 p-6 rounded-2xl text-center"
          style={{ background: 'var(--bg-card)', border: '1.5px solid rgba(168,85,247,0.4)', width: '100%' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            🔒
          </div>
          <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>高级版专属功能</p>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            解锁数据复盘，了解你的内容为什么爆、为什么不爆
          </p>

          <div className="text-left space-y-2 mb-5">
            {[
              '📈 视频播放量 / 完播率趋势图',
              '🔍 爆款因素归因分析',
              '💡 AI 个性化优化建议',
              '📋 账号成长周报',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/upgrade')}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--lavender)', color: '#fff' }}
          >
            解锁高级版 · 99元/月
          </button>
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            Pro 版含复盘功能，<button onClick={() => navigate('/upgrade')} style={{ color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>查看全部方案 →</button>
          </p>
        </div>
      </div>
    </div>
  )
}
