const SILICONFLOW_BASE = 'https://api.siliconflow.cn/v1'
const MODEL = 'deepseek-ai/DeepSeek-V3'

const SYSTEM_PROMPT = `你是一位专业的短视频内容策划师，专门服务于小红书和抖音的个人博主。
你的任务是根据创作者提供的信息，生成一份精准的分镜脚本。

请直接返回一个 JSON 对象，格式如下（不要加任何其他文字）：
{
  "title": "视频标题建议（15字以内，吸引眼球）",
  "hook": "开头3秒钩子话术（口语化，制造悬念或共鸣）",
  "segments": [
    {
      "timeRange": "0-3s",
      "shotType": "特写/中景/远景/自拍/产品展示/屏幕录制",
      "scene": "画面内容描述（具体说明拍什么、怎么拍）",
      "dialogue": "口播台词（口语化，自然，有感染力，用第一人称）",
      "caption": "屏幕字幕建议（强调关键词）",
      "bgm": "具体BGM推荐（格式：《歌名》- 艺术家，如《稻香》- 周杰伦）",
      "intent": "这一段的设计意图（为什么这样拍）"
    }
  ],
  "coverOptions": ["封面文案方案1（≤8字）", "封面文案方案2（≤8字）", "封面文案方案3（≤8字）"],
  "hashtags": ["话题标签1", "话题标签2", "话题标签3", "话题标签4", "话题标签5"],
  "postTime": "推荐发布时间段（如：工作日晚7-9点）",
  "cta": "结尾行动引导话术（引导收藏/评论/关注）"
}

重要原则：
1. 开头3秒必须是强钩子（悬念/数字/反差/共鸣其一）
2. 口播台词要口语化、自然，像朋友聊天，绝不书面语
3. 每个段落时长合理，总和等于用户指定时长
4. 结尾必须有明确行动引导
5. 分镜数量根据时长决定：15s约3段，30s约5段，60s约7段，90s约9段，180s约12段
6. 如果提供了参考公式结构，必须严格遵循该公式的段落节奏和设计意图
7. bgm字段必须推荐真实存在的歌曲，常用参考：
   轻松向：《稻香》- 周杰伦 / 《七里香》- 周杰伦 / Sunny Day
   治愈向：《消愁》- 毛不易 / 《平凡之路》- 朴树 / Clair de Lune
   节奏向：Running in the 90s - Maurizio De Jorio / 《野狼disco》- 宝石Gem
   励志向：Believer - Imagine Dragons / 《光辉岁月》- Beyond`

const REFINE_PROMPT = `你是一位专业的短视频内容策划师。用户已有一份分镜脚本，现在想根据反馈进行修改。

请根据用户的修改意见，在原脚本基础上进行调整，返回修改后的完整脚本（JSON格式，结构与原脚本相同）。

修改原则：
- 只改用户提出问题的部分，其他保持不变
- 保持段落数量和时间段不变（除非用户要求增减）
- 口播台词保持口语化
- 返回完整的 JSON 对象，结构与原脚本完全一致`

const ANALYZE_PROMPT = `你是一位专业的短视频内容分析师。用户粘贴了一段视频文案或口播稿，请帮助分析其内容结构，提炼出可复用的内容公式。

请返回一个 JSON 对象：
{
  "title": "公式名称（简短，描述这个公式的核心特征）",
  "description": "公式说明（一句话，描述这个公式的适用场景和核心逻辑）",
  "category": "内容类型（测评/知识/Vlog/种草/其他）",
  "segments": [
    {
      "part": "开头/中段/结尾",
      "timeRange": "估算时长（如0-5s）",
      "shotType": "镜头类型建议",
      "content": "这段的核心内容方向",
      "example": "从原文提取的典型话术示例",
      "intent": "这段的设计意图（为什么这样写）"
    }
  ]
}

分析要点：
1. 识别开头钩子类型（悬念/反差/共鸣/数字等）
2. 提炼中段的核心表达结构
3. 识别结尾的行动引导方式
4. 每段的"intent"要说明背后的传播逻辑`

async function callAPI(messages) {
  const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY
  if (!apiKey || !apiKey.trim()) throw new Error('NO_API_KEY')

  const res = await fetch(`${SILICONFLOW_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.85,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 请求失败 (${res.status}): ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('API 返回内容为空')

  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('无法解析 AI 返回内容')
  }
}

export async function generateScript({ topic, duration, contentType, style, formulaContent }) {
  let formulaNote = ''
  if (formulaContent) {
    formulaNote = `\n\n参考公式结构（必须严格遵循此公式的段落节奏）：\n${formulaContent}`
  }

  const userPrompt = `请为以下内容生成分镜脚本：
选题：${topic}
视频总时长：${duration}秒
内容类型：${contentType}
风格要求：${style}
注意：分镜总时长必须精确等于${duration}秒${formulaNote}`

  try {
    return await callAPI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ])
  } catch (e) {
    if (e.message === 'NO_API_KEY') return getMockScript(topic, duration)
    throw e
  }
}

export async function refineScript({ originalScript, userRequest }) {
  const userPrompt = `原脚本：
${JSON.stringify(originalScript, null, 2)}

用户修改意见：${userRequest}

请在原脚本基础上按照修改意见调整，返回完整的修改后脚本JSON。`

  return callAPI([
    { role: 'system', content: REFINE_PROMPT },
    { role: 'user', content: userPrompt },
  ])
}

export async function analyzeContent(text) {
  const userPrompt = `请分析以下视频文案/口播稿，提炼内容公式：\n\n${text}`

  return callAPI([
    { role: 'system', content: ANALYZE_PROMPT },
    { role: 'user', content: userPrompt },
  ])
}

function detectPlatform(url) {
  if (/xiaohongshu|xhslink|xhs\.cn/i.test(url)) return '小红书'
  if (/douyin|iesdouyin|dy\.com/i.test(url)) return '抖音'
  if (/bilibili|b23\.tv/i.test(url)) return 'B站'
  return '短视频平台'
}

export function getPlatformFromUrl(url) {
  return detectPlatform(url)
}

export async function analyzeUrl(url) {
  const platform = detectPlatform(url)
  const userPrompt = `用户提供了一个${platform}视频链接：${url}
请根据${platform}平台的典型内容风格和常见爆款结构，生成一个适合该平台的内容公式结构。
无需实际访问该链接，基于平台特征和常见爆款逻辑生成即可。`

  return callAPI([
    { role: 'system', content: ANALYZE_PROMPT },
    { role: 'user', content: userPrompt },
  ])
}

const ANALYZE_VIDEO_PROMPT = `你是一位专业的短视频数据分析师，服务于小红书/抖音创作者。
用户提供了视频数据，请深度分析该视频表现并给出可操作的改进建议。

请返回一个 JSON 对象（不要加任何其他文字）：
{
  "score": 75,
  "factors": [
    { "name": "开头钩子", "score": 80, "tip": "具体建议" },
    { "name": "话题匹配度", "score": 65, "tip": "具体建议" },
    { "name": "发布时机", "score": 70, "tip": "具体建议" },
    { "name": "内容完播率", "score": 68, "tip": "具体建议" }
  ],
  "commentInsights": {
    "topCommentType": "建议/求教类",
    "percentage": "约55%",
    "meaning": "观众在积极寻求更多干货",
    "suggestion": "具体的内容策略建议"
  },
  "suggestions": ["建议1", "建议2", "建议3"]
}

评分参考：完播率>70%=90分；50-70%=70分；<50%=50分。点赞率>5%=钩子85+；2-5%=70；<2%=60。综合评分加权：完播率30%、开头钩子30%、话题匹配20%、发布时机20%。
评论区类型："求链接/在哪买"=种草欲强；"好详细/求教程"=内容有价值；"哈哈哈/太真实了"=共鸣强；"我也是"=共情型。`

export async function analyzeVideoData({ url, manualData }) {
  let userPrompt = ''
  if (url) {
    const platform = detectPlatform(url)
    userPrompt = `视频链接：${url}（${platform}平台）\n请基于该平台内容规律给出分析，无法获取真实播放数据，请基于平台特征给出合理推断。`
  } else {
    const { views, completionRate, likes, comments, shares, followerGain, topCommentNote } = manualData || {}
    userPrompt = `视频真实数据：
播放量：${views || '未填'}
完播率：${completionRate || '未填'}%
点赞数：${likes || '未填'}
评论数：${comments || '未填'}
分享数：${shares || '未填'}
涨粉数：${followerGain || '未填'}
${topCommentNote ? `评论区高赞内容描述：${topCommentNote}` : ''}
请基于以上真实数据进行深度分析并给出改进建议。`
  }
  try {
    return await callAPI([
      { role: 'system', content: ANALYZE_VIDEO_PROMPT },
      { role: 'user', content: userPrompt },
    ])
  } catch (e) {
    if (e.message === 'NO_API_KEY') return getMockVideoAnalysis(manualData)
    throw e
  }
}

function getMockVideoAnalysis(manualData) {
  const cr = parseFloat(manualData?.completionRate) || 65
  const views = parseInt(manualData?.views) || 8400
  const likes = parseInt(manualData?.likes) || 320
  const likeRate = views > 0 ? (likes / views) * 100 : 3.8
  const crScore = cr > 70 ? 88 : cr > 50 ? 72 : 52
  const hookScore = likeRate > 5 ? 90 : likeRate > 2 ? 74 : 58
  const topicScore = 71
  const timingScore = 68
  return {
    score: Math.round(crScore * 0.3 + hookScore * 0.3 + topicScore * 0.2 + timingScore * 0.2),
    factors: [
      { name: '开头钩子', score: hookScore, tip: hookScore >= 80 ? '点赞率表现优秀，说明开头钩子有效，继续保持' : '建议在前3秒抛出更有悬念的问题或反差数据，提升停留率' },
      { name: '话题匹配度', score: topicScore, tip: '话题标签与内容基本匹配，可尝试加1-2个更垂直的细分话题标签提升精准流量' },
      { name: '发布时机', score: timingScore, tip: '建议尝试工作日晚7-9点或周末上午10-12点，这两个时段用户活跃度最高' },
      { name: '内容完播率', score: crScore, tip: cr >= 70 ? `完播率${cr}%表现优秀！内容节奏控制得很好，继续保持` : `完播率${cr}%有提升空间，建议在视频60%处预告"结尾有彩蛋"，减少中途流失` },
    ],
    commentInsights: {
      topCommentType: '求教/建议类',
      percentage: '约55%',
      meaning: '观众在积极索要更多干货，说明内容有价值但观众还想要更深入的内容',
      suggestion: "下条视频可以做续集，结尾问：'你还想看哪个步骤的详解？' 既引导互动也为下期预热",
    },
    suggestions: [
      `完播率${cr}%${cr >= 70 ? '已达优秀水平，保持内容节奏' : '——建议删减中段冗余内容，或在60%处加入一个新的悬念节点'}`,
      '评论区求教类评论占多数，这是强需求信号——出一个专题系列会比单视频涨粉效果好3-5倍',
      `点赞率${likeRate.toFixed(1)}%${likeRate >= 5 ? '，表现优秀' : '——结尾明确说出"觉得有用点个赞"，不要依赖用户自觉'}`,
    ],
  }
}

function getMockScript(topic, duration) {
  const seg = (s, e, shot, scene, dlg, cap, bgm, intent) => ({
    timeRange: `${s}-${e}s`,
    shotType: shot,
    scene,
    dialogue: dlg,
    caption: cap,
    bgm,
    intent,
  })

  const segments30 = [
    seg(0, 3, '自拍特写', '镜头正对面部，表情自然，背景干净', `你们有没有遇到过，明明每天都很忙，但感觉什么都没做成？`, '你有没有这种感觉？', '轻松流行BGM', '强共鸣开头，3秒内命中有此困扰的用户'),
    seg(3, 10, '中景', '坐在桌前，画面有书/电脑等道具', '我之前也是这样，直到我开始用这个方法，一切都不一样了', '直到我改变了这一点', '同上继续', '建立悬念，引出核心方法'),
    seg(10, 22, '屏幕录制+字幕', '展示方法操作步骤或相关画面', `具体来说就是：第一，找到核心节点；第二，拆成15分钟小块；第三，每天固定复盘`, '3步核心方法', '干净的纯音乐', '步骤化干货，便于理解和收藏'),
    seg(22, 27, '正面中景', '镜头正对，神态放松自然', '就这么三步，我现在每天效率提升了一倍，真的试过才知道', '真的太有用了', '渐弱', '真实感收尾，降低防御感'),
    seg(27, 30, '近景', '竖起大拇指或自然手势', '觉得有用的话收藏一下，我会持续分享这类内容', '收藏起来慢慢看👆', '无', '明确CTA，引导收藏'),
  ]

  const d = parseInt(duration) || 30
  const result = d <= 30 ? segments30 : [...segments30,
    seg(30, 40, '特写', '产品或工具的细节画面', '另外分享一个我最近发现的好东西，真的帮了我很多', '彩蛋环节', '轻快BGM', '附加内容延长完播'),
    seg(40, d, '正面', '面向镜头，表情真诚', '有什么问题评论区告诉我，每条都看，我们下期见', '评论区等你~', '渐弱', '互动引导，提升评论数据'),
  ]

  return {
    title: `${topic}（真实经历分享）`,
    hook: `你有没有遇到过，明明努力了，但还是感觉没进展？`,
    segments: result.slice(0, d <= 30 ? 5 : 7),
    coverOptions: [`${topic}必看`, '学完直接用', '别人不说的秘密'],
    hashtags: ['#小博主成长', '#内容创作', '#涨粉干货', '#短视频技巧', '#创作者'],
    postTime: '工作日晚7-10点，周末上午10-12点',
    cta: '有用的话收藏起来，关注我看更多干货~',
  }
}
