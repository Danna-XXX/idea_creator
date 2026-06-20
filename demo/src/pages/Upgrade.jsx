import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const tiers = [
  {
    name: '免费版',
    price: '0',
    unit: '永久免费',
    color: '#8080AA',
    bg: 'var(--bg-card)',
    border: 'var(--border)',
    badge: null,
    features: [
      { text: '每月 5 次 AI 脚本生成', ok: true },
      { text: '基础选题库（20 个选题）', ok: true },
      { text: '爆款公式库浏览', ok: true },
      { text: '随手记灵感记录', ok: true },
      { text: 'Excel 脚本下载', ok: false },
      { text: 'AI 脚本润色修改', ok: false },
      { text: '数据复盘分析', ok: false },
      { text: 'AI 灵感分析推荐', ok: false },
    ],
    cta: '当前方案',
    ctaDisabled: true,
  },
  {
    name: 'Pro 版',
    price: '39',
    unit: '元 / 月',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.4)',
    badge: '最受欢迎',
    features: [
      { text: '无限次 AI 脚本生成', ok: true },
      { text: '完整选题库（30+ 持续更新）', ok: true },
      { text: '完整公式库 + 搜索过滤', ok: true },
      { text: '随手记灵感记录', ok: true },
      { text: 'Excel 脚本一键下载', ok: true },
      { text: 'AI 脚本润色修改', ok: true },
      { text: '数据复盘分析', ok: false },
      { text: 'AI 灵感分析推荐', ok: false },
    ],
    cta: '立即开通 Pro',
    ctaDisabled: false,
  },
  {
    name: '高级版',
    price: '99',
    unit: '元 / 月',
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.05)',
    border: 'rgba(168,85,247,0.4)',
    badge: '全功能解锁',
    features: [
      { text: 'Pro 版全部功能', ok: true },
      { text: 'AI 灵感库分析 + 推荐选题', ok: true },
      { text: '数据复盘报告（视频归因）', ok: true },
      { text: '个性化封面文案生成', ok: true },
      { text: '情绪陪伴回应', ok: true },
      { text: '每周账号成长分析报告', ok: true },
      { text: '专属客服支持', ok: true },
      { text: '抢先体验新功能', ok: true },
    ],
    cta: '立即开通高级版',
    ctaDisabled: false,
  },
]

export default function Upgrade() {
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  const handleCta = (tier) => {
    if (tier.ctaDisabled) return
    setToast('功能开发中，敬请期待 🎉')
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="page-container">
      <PageHeader title="升级会员" back />

      <div className="px-5 pt-2 pb-2 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          解锁全部 AI 功能，让创作效率提升 10 倍
        </p>
      </div>

      <div className="px-5 flex flex-col gap-4 pb-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="rounded-2xl p-5"
            style={{ background: tier.bg, border: `1.5px solid ${tier.border}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold" style={{ color: tier.color }}>{tier.name}</h3>
                  {tier.badge && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${tier.color}20`, color: tier.color, border: `1px solid ${tier.color}40` }}
                    >
                      {tier.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>¥{tier.price}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tier.unit}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {tier.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  {f.ok ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40405A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                  <span className="text-xs" style={{ color: f.ok ? 'var(--text-secondary)' : '#40405A' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCta(tier)}
              disabled={tier.ctaDisabled}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tier.ctaDisabled ? 'var(--bg-card-2)' : tier.color,
                color: tier.ctaDisabled ? 'var(--text-muted)' : tier.name === 'Pro 版' ? '#000' : '#fff',
                cursor: tier.ctaDisabled ? 'default' : 'pointer',
              }}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

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
