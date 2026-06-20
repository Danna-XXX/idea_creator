import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

const niches = [
  { id: 'food', emoji: '🍜', label: '美食', desc: '美食探店、家常菜、烘焙甜点' },
  { id: 'health', emoji: '🌿', label: '养生健康', desc: '中医养生、健身、营养饮食' },
  { id: 'film', emoji: '🎬', label: '影视解说', desc: '电影/剧情解说、真实案件、纪录片' },
  { id: 'game', emoji: '🎮', label: '游戏', desc: '游戏实况、攻略、二次元' },
  { id: 'fashion', emoji: '👗', label: '穿搭时尚', desc: '穿搭分享、美妆护肤、配饰' },
  { id: 'travel', emoji: '✈️', label: '旅行', desc: '旅游攻略、城市探索、民宿' },
  { id: 'pet', emoji: '🐾', label: '宠物', desc: '猫狗日常、宠物护理、萌宠治愈' },
  { id: 'fitness', emoji: '💪', label: '健身运动', desc: '健身教程、跑步、运动打卡' },
  { id: 'reading', emoji: '📚', label: '读书学习', desc: '书单推荐、学习方法、知识分享' },
  { id: 'tech', emoji: '💻', label: '数码科技', desc: '数码测评、软件工具、AI应用' },
  { id: 'parenting', emoji: '👶', label: '育儿母婴', desc: '宝宝日常、育儿经验、亲子活动' },
  { id: 'career', emoji: '💼', label: '职场成长', desc: '职场干货、副业、个人成长' },
  { id: 'life', emoji: '🏡', label: '生活日常', desc: '独居日记、生活方式、家居改造' },
  { id: 'comedy', emoji: '😂', label: '搞笑娱乐', desc: '搞笑剧情、段子、日常趣事' },
  { id: 'finance', emoji: '💰', label: '理财投资', desc: '省钱技巧、理财基础、消费观' },
]

const styles = [
  { id: 'warm', emoji: '☀️', label: '温暖真实', desc: '像朋友一样真实分享，有生活气息' },
  { id: 'pro', emoji: '🎯', label: '专业干货', desc: '输出有价值的内容，建立专业形象' },
  { id: 'niche', emoji: '✨', label: '小众品味', desc: '独特视角和审美，吸引精准受众' },
]

const tagMap = {
  food: { warm: ['家常美食', '探店打卡', '治愈厨房', '美食日记'], pro: ['营养科普', '大厨技巧', '食材解析', '烹饪干货'], niche: ['冷门美食', '小众餐厅', '美食美学', '异国料理'] },
  health: { warm: ['健康打卡', '养生日记', '体质改善', '生活方式'], pro: ['中医科普', '营养建议', '健身计划', '专业养生'], niche: ['小众养生', '功能性食物', '自然疗法', '身心平衡'] },
  film: { warm: ['追剧日记', '观影感受', '情感共鸣', '故事推荐'], pro: ['深度解析', '专业影评', '叙事分析', '导演风格'], niche: ['小众电影', '冷门好剧', '影史冷知识', '艺术电影'] },
  game: { warm: ['游戏日常', '一起玩游戏', '游戏治愈', '玩家社群'], pro: ['攻略教程', '游戏测评', '操作技巧', '竞技分析'], niche: ['独立游戏', '复古游戏', '小众二次元', '游戏文化'] },
  fashion: { warm: ['日常穿搭', '真实分享', '平价好物', '穿搭日记'], pro: ['搭配技巧', '色彩理论', '风格分析', '品牌解读'], niche: ['小众设计师', '复古风格', '街头文化', '极简主义'] },
  travel: { warm: ['旅行日记', '亲历分享', '旅途故事', '城市探索'], pro: ['攻略干货', '省钱技巧', '签证指南', '最佳路线'], niche: ['冷门目的地', '深度旅行', '慢旅行', '在地文化'] },
  pet: { warm: ['萌宠日常', '铲屎官日记', '治愈时刻', '宠物陪伴'], pro: ['宠物护理', '健康知识', '训练技巧', '喂养科学'], niche: ['异宠饲养', '宠物美学', '流浪动物', '品种知识'] },
  fitness: { warm: ['健身打卡', '减肥日记', '运动日常', '身材变化'], pro: ['训练计划', '动作教程', '营养补给', '科学减脂'], niche: ['小众运动', '极限挑战', '运动美学', '冷门健身'] },
  reading: { warm: ['读书笔记', '书单推荐', '读后感', '知识碎片'], pro: ['书评分析', '学习方法', '知识体系', '思维框架'], niche: ['冷门好书', '小众文学', '读书美学', '原版书推荐'] },
  tech: { warm: ['数码开箱', '使用感受', '好用分享', '科技日常'], pro: ['专业测评', '参数对比', '技术解析', 'AI工具指南'], niche: ['小众软件', '极客工具', '开源项目', '科技艺术'] },
  parenting: { warm: ['育儿日记', '宝宝成长', '亲子时光', '温馨家庭'], pro: ['育儿方法', '发育知识', '早教科普', '教育建议'], niche: ['正念育儿', '自然教育', '国际视野', '特殊需求'] },
  career: { warm: ['职场日记', '打工人故事', '成长感悟', '真实经历'], pro: ['职场技巧', '面试攻略', '副业方法', '升职路径'], niche: ['远程工作', '斜杠青年', '小众职业', '创业日记'] },
  life: { warm: ['生活日记', '独居日常', '生活小确幸', '慢生活'], pro: ['生活方法论', '效率系统', '家居改造', '极简指南'], niche: ['小众生活方式', '在地生活', '可持续生活', '反消费主义'] },
  comedy: { warm: ['搞笑日常', '生活趣事', '脱口而出', '欢乐时光'], pro: ['喜剧分析', '段子创作', '表演技巧', '幽默方法论'], niche: ['冷幽默', '黑色幽默', '小众梗', '反差萌'] },
  finance: { warm: ['省钱分享', '理财日记', '消费感悟', '钱包管理'], pro: ['投资知识', '理财规划', '资产配置', '经济分析'], niche: ['极简消费', 'FIRE理念', '价值投资', '另类资产'] },
}

export default function Positioning() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedNiche, setSelectedNiche] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [done, setDone] = useState(false)

  const handleFinish = () => {
    const niche = niches.find((n) => n.id === selectedNiche)
    const style = styles.find((s) => s.id === selectedStyle)
    const tags = tagMap[selectedNiche]?.[selectedStyle] || ['原创内容', '真实分享', '持续更新', '垂直深耕']
    const persona = {
      niche: niche?.label,
      nicheId: selectedNiche,
      style: style?.label,
      styleId: selectedStyle,
      tags,
    }
    localStorage.setItem('persona', JSON.stringify(persona))
    setDone(true)
  }

  if (done) {
    const niche = niches.find((n) => n.id === selectedNiche)
    const style = styles.find((s) => s.id === selectedStyle)
    const tags = tagMap[selectedNiche]?.[selectedStyle] || []
    return (
      <div className="page-container">
        <PageHeader title="账号定位" back />
        <div className="px-5 pt-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl" style={{ background: 'rgba(245,158,11,0.15)' }}>
              {niche?.emoji}
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: '"Noto Serif SC", serif' }}>你的博主人设</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>已保存，选题库将优先展示匹配内容</p>
          </div>

          <div className="card p-5 mb-4" style={{ borderColor: 'var(--border-amber)', background: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="tag tag-amber text-sm">{niche?.emoji} {niche?.label}</span>
              <span className="tag tag-gray">×</span>
              <span className="tag tag-gray">{style?.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="tag tag-amber">{tag}</span>
              ))}
            </div>
          </div>

          <div className="card p-4 mb-6" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
            <p className="text-xs mb-2" style={{ color: '#10B981' }}>📌 账号起号建议</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {niche?.label}赛道 + {style?.label}风格，建议前20条内容严格保持垂直，让算法认清你的账号定位后，再考虑适度扩展。
            </p>
          </div>

          <button className="btn-amber w-full py-3.5 text-sm" onClick={() => navigate('/topics')}>
            去选题库找适合你的选题 →
          </button>
          <button className="btn-ghost w-full py-3 text-sm mt-3" onClick={() => { setDone(false); setStep(1); setSelectedNiche(null); setSelectedStyle(null) }}>
            重新设置
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader title="账号定位向导" subtitle="2步完成，生成专属博主人设" back />

      {/* Step indicator */}
      <div className="flex items-center gap-2 px-5 mb-5">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{ background: step >= s ? 'var(--amber)' : 'var(--bg-card-2)', color: step >= s ? '#0D0D18' : 'var(--text-muted)' }}>
              {s}
            </div>
            {s < 2 && <div className="h-px" style={{ background: step > s ? 'var(--amber)' : 'var(--border)', width: 40 }} />}
          </div>
        ))}
        <p className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
          {step === 1 ? '选择内容赛道' : '选择表达风格'}
        </p>
      </div>

      <div className="px-5">
        {step === 1 && (
          <div className="fade-up">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>你主要做哪个方向的内容？</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>选择最擅长或最感兴趣的赛道</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {niches.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNiche(n.id)}
                  className="card p-3 text-center transition-all"
                  style={{
                    borderColor: selectedNiche === n.id ? 'var(--border-amber)' : 'var(--border)',
                    background: selectedNiche === n.id ? 'rgba(245,158,11,0.08)' : 'var(--bg-card)',
                  }}
                >
                  <span className="text-xl block mb-1">{n.emoji}</span>
                  <p className="text-xs font-medium leading-tight" style={{ color: selectedNiche === n.id ? 'var(--amber)' : 'var(--text-primary)' }}>
                    {n.label}
                  </p>
                </button>
              ))}
            </div>
            {selectedNiche && (
              <div className="card p-3 mb-4 fade-up" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'var(--border-amber)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {niches.find((n) => n.id === selectedNiche)?.emoji} {niches.find((n) => n.id === selectedNiche)?.desc}
                </p>
              </div>
            )}
            <button className="btn-amber w-full py-3.5 text-sm" disabled={!selectedNiche} onClick={() => setStep(2)}>
              下一步
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>你的内容表达风格？</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>这决定你的内容调性和目标受众</p>
            <div className="flex flex-col gap-3">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className="card p-4 text-left transition-all"
                  style={{
                    borderColor: selectedStyle === s.id ? 'var(--border-amber)' : 'var(--border)',
                    background: selectedStyle === s.id ? 'rgba(245,158,11,0.06)' : 'var(--bg-card)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: selectedStyle === s.id ? 'var(--amber)' : 'var(--text-primary)' }}>{s.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                    </div>
                    {selectedStyle === s.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--amber)' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#0D0D18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="2 6 5 9 10 3"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button className="btn-amber w-full py-3.5 text-sm mt-5" disabled={!selectedStyle} onClick={handleFinish}>
              生成我的博主人设 ✨
            </button>
            <button className="btn-ghost w-full py-3 text-sm mt-3" onClick={() => setStep(1)}>上一步</button>
          </div>
        )}
      </div>
    </div>
  )
}
