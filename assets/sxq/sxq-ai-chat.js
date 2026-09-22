/*!
 * 尚贤圈 · 智能客服浮窗（三站共用）
 * 三站右下角统一入口；AI 回答由 Supabase 边缘函数 sxq-ai-chat 代理（密钥不落前端）。
 *
 * 依赖：本地 assets/sxq/sxq-ai-chat.css 与本文件、以及 Lottie 运行时（可选，用于机器人动画）
 * 配置：在引入本脚本前设置 window.SXQ_AI = { endpoint, anonKey, email, title, faq:[...] }
 */
(function () {
  'use strict'

  var CFG = Object.assign({
    endpoint: 'https://gfxkpljewqchdbrepqia.supabase.co/functions/v1/sxq-ai-chat',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmeGtwbGpld3FjaGRicmVwcWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MjA2NDIsImV4cCI6MjEwMzE5NjY0Mn0.VWr_iNA25QTviaFiwYMvTV43ZK3I7kEKXSYO5jHZrBY',
    email: 'sxcommunity@outlook.com',
    title: '尚贤圈 · 智能客服',
    brand: '尚贤圈',
    chips: null,
    faq: [
      '怎么发帖？',
      '匿名发帖安全吗？',
      '贤士卡会员有什么用？',
      '怎么下载 App？',
      '规则中心在哪里？'
    ]
  }, window.SXQ_AI || {})

  // ══════════════════════════════════════════════════════════
  //  预设问答库
  //  ── 铁律：推荐提问与命中预设的输入，一律本地作答，绝不请求 AI 接口。
  //  ── 只有用户自己输入、且未命中任何预设时，才调用边缘函数（计费）。
  //  内容依据 docs/HANDOFF-V3-FULL.md 与《会员服务协议》等真实口径，不编造。
  // ══════════════════════════════════════════════════════════
  var PRESETS = [
    { id: 'publish', q: '怎么发帖 / 发动态？', k: ['发帖', '发动态', '怎么发布', '发布动态', '怎么发一条', '如何发帖'],
      a: '在「广场」页点右上角「发布动态」，或用底部导航中间的 ＋ 号即可发帖：可发纯文字，也可配图（最多 9 张）。\nApp 端路径：首页 → 右下角 ＋ → 选择版块。\n内容不得包含违法信息，发布前请确认。' },

    { id: 'anon', q: '匿名发帖安全吗？额度是多少？', k: ['匿名', '匿名帖', '匿名安全', '会被认出来'],
      a: '匿名有额度：普通账号每日 2 条匿名帖、5 条匿名评论；贤士卡会员为 10 条 / 20 条，可用「增量包」永久叠加。\n匿名对同学隐藏身份，但后台保留识别码，仅在处理违法内容时启用——所以可以放心倾诉，但请勿违法。' },

    { id: 'vip', q: '贤士卡会员有什么用？多少钱？', k: ['贤士卡', '会员有什么', '会员多少', '开通会员', '会员权益'],
      a: '贤士卡是尚贤圈会员：月卡 ¥6、季卡 ¥13、年卡 ¥46.8。\n权益：身份标识（贤士 / 贤达 / 贤尊 头衔可随时切换）、每日额度提升至 10 条匿名帖 / 20 条匿名评论 / 200 个表情 / 9 张图片，以及每月 8 号会员日额度翻倍。\n会员与管理员权限、月度选举完全隔离——花钱换不到任何管理权。' },

    { id: 'tips', q: '「加鸡腿」是什么？有哪些档位？', k: ['鸡腿', '打赏', '赞助档位', '加鸡腿'],
      a: '鸡腿是对创作者的自愿打赏，纯赠与、不对应任何权益，档位 ¥1 / ¥3 / ¥15 / ¥30 / ¥50 / ¥100 / ¥200。\n皇级 ¥50 进入当月鸣谢陈列；星级 ¥100 进入永久名单；钻级 ¥200 永久名单并附专属铭牌（头像框）。\n鸡腿金额三成以上（普遍五到八成）投入平台开发与维护。' },

    { id: 'arrival', q: '付款了多久到账？没到账怎么办？', k: ['到账', '没到账', '付款没反应', '多久生效', '爱发电到账'],
      a: '付款后系统每分钟自动拉取爱发电订单并匹配，一般 1 分钟内到账，最迟不超过 24 小时。\n关键前提：下单时「留言」必须填写你的贤圈ID（App「设置 → 关于」可查）；填错或不填就无法自动匹配，需要人工核对。\n超过 24 小时仍未到账，请把订单号与留言内容发到 sxcommunity@outlook.com。' },

    { id: 'xqid', q: '贤圈ID 在哪里看？', k: ['贤圈id', '我的id', 'id在哪', '哪里看id'],
      a: '贤圈ID 是 10 位小写字母数字组合，在 App「设置 → 关于」可查看。\n付款留言、到账匹配、绑定贤圈中心都需要它。它不等于密码，但也不要在公开场合随意分享。' },

    { id: 'refund', q: '会员可以退款吗？', k: ['退款', '退钱', '不想要了能退', '能退吗'],
      a: '数字内容（会员、增量包、鸡腿）一经到账即产生权益或完成赠与，依据《付费与退款政策》不予退款，下单前请仔细阅读确认。\n未成年人应在监护人同意并陪同下购买，监护人有权要求中止后续消费。' },

    { id: 'memberday', q: '会员日是什么？', k: ['会员日', '每月8号', '8号翻倍'],
      a: '每月 8 号是会员日，贤士卡会员当天的匿名帖、匿名评论、表情、图片基础额度全部翻倍。\n无需额外操作，当天自动生效。' },

    { id: 'perk', q: '增量包是什么？怎么叠加？', k: ['增量包', '额度包', '表情扩容', '图片+3', '叠加额度'],
      a: '增量包是永久叠加的额度包：\n· 匿名帖 +5（¥1）\n· 匿名评论 +10（¥1）\n· 表情扩容 +50（¥2）\n· 发帖图片 +3（¥3）\n买多少叠多少，永久有效。' },

    { id: 'rules', q: '规则中心在哪里？有多少篇？', k: ['规则中心', '用户协议', '隐私政策', '社区公约', '规则在哪'],
      a: '规则中心在 App 内「我的 → 规则中心」，共 22 篇文档：用户协议、隐私政策、社区公约、会员服务协议、付费与退款政策、免责声明等。\n阅读器支持悬浮目录、进度显示、四档字号，文中书名号短语可一键跳转互链。' },

    { id: 'download', q: '怎么下载安装 App？', k: ['下载', '安装包', 'apk', '怎么安装', '未知来源'],
      a: '安卓安装包在 Gitee Releases 发布：gitee.com/kernthal-studio/sxcommunity/releases\n下载后用浏览器打开安装；若提示「未知来源」，请在系统设置里允许安装。\niOS 不提供原生 App，用 Safari 打开官网并「添加到主屏幕」即可当 App 使用。' },

    { id: 'links', q: '官网和各端网址是什么？', k: ['官网', '网址', '地址', '网站是多少', '网页版链接'],
      a: '官网：kernthal.github.io/shangxianquan-official/\n贤圈中心（网页版社区）：sxcommunity.github.io/xq-center/\nApp 网页版（PWA）：sxcommunity.github.io/sxq-pwa/' },

    { id: 'xqcenter', q: '贤圈中心是什么？要单独注册吗？', k: ['贤圈中心', '网页版', 'xq-center', '电脑上能用吗'],
      a: '贤圈中心是尚贤圈的网页版校园社区：广场动态、提问社区、二手集市、失物招领、鸣谢墙、知识库与徽章墙。\n网址 sxcommunity.github.io/xq-center/ ，与 App 共用同一套账号，登录后贤圈ID 自动关联，不需要单独注册。' },

    { id: 'report', q: '看到违规内容怎么举报？', k: ['举报', '违规内容', '有人发违法', '怎么投诉'],
      a: '在内容旁点「举报」入口提交即可，管理员会处理。\n社区底线三件套：违法类敏感词拦截、举报入口、管理员删除权。\n也可以直接发邮件到 sxcommunity@outlook.com。' },

    { id: 'dm', q: '私信为什么发不出去？', k: ['私信发不出', '发不了私信', '私信失败', '不能发私信'],
      a: '私信规则：互相关注才能畅聊；对未关注的人每天只能发 1 条，用于防骚扰。\n如果发送失败，请确认对方是否关注了你，或今天是否已经发过一条。' },

    { id: 'recall', q: '消息怎么撤回？', k: ['撤回', '发错了', '删除消息'],
      a: '私信发出后 2 分钟内，长按那条消息即可撤回。' },

    { id: 'account', q: '怎么注册？忘记密码怎么办？', k: ['注册', '忘记密码', '登录不了', '收不到验证码', '重置密码'],
      a: '尚贤圈使用邮箱注册，也支持邮箱验证码免密码登录。\n忘记密码：在登录页点「忘记密码」，重置链接会发到邮箱；收不到请先检查垃圾邮件文件夹。' },

    { id: 'ban', q: '账号被封禁 / 禁言了怎么办？', k: ['封号', '被封', '禁言', '账号被封', '解封'],
      a: '封禁或禁言通常是因为触发了社区公约。\n可以在 App「我的 → 问题诊断上报」复制诊断信息，连同贤圈ID 一起发到 sxcommunity@outlook.com 申诉，管理员会复核。' },

    { id: 'bounty', q: '悬赏问答怎么用？', k: ['悬赏', '悬赏问答', ' bounty', '答谢回答者'],
      a: '提问时可选择鸡腿档位标记悬赏（¥1–¥200）。\n被采纳的回答会通知你去手动把鸡腿赠送给回答者——平台不碰钱、不代付、不担保。\n悬赏问题在问答流里会靠前展示。' },

    { id: 'market', q: '集市二手交易安全吗？', k: ['集市', '二手', '卖东西', '买东西安全', '交易安全'],
      a: '集市只提供信息发布，平台不介入交易、不担保、不代收款项。\n建议当面交易、当面验货，不要提前转账；未成年人交易须经监护人同意。\n物品卖出后请标记「已售出」，之后不再接受询价。' },

    { id: 'lost', q: '失物招领怎么用？', k: ['失物', '招领', '丢东西', '捡到', '寻物'],
      a: '失物招领分「我丢了东西」与「我捡到东西」两类，发布时联系方式必填，方便同学一键复制联系你。\n问题解决后可以标记为已解决。' },

    { id: 'badge', q: '徽章怎么获得？', k: ['徽章', '成就', '怎么得徽章', '徽章墙'],
      a: '徽章共 11 枚：首问、首答、采纳 5 次、提问达人、热心回答、连续七日、知识库贡献、拾金不昧、活跃半月、全勤周、元老。\n达成条件后系统自动点亮，展示在「我的 → 徽章墙」，昵称旁最多显示 1 枚。' },

    { id: 'rank', q: '每周双榜是什么？', k: ['双榜', '排行榜', '人气榜', '榜单'],
      a: '每周双榜是「热心回答榜」与「优质提问榜」，按本周的采纳数、有用数与回答数加权计算。\n周一零点（北京时间）自然重置，Top10 上榜，仅作荣誉展示。' },

    { id: 'thanks', q: '鸣谢墙 / 致谢名单是什么？', k: ['鸣谢', '致谢', '名单', '感谢墙'],
      a: '鸣谢墙展示支持尚贤圈的赞助者：皇级 ¥50 当月陈列、星级 ¥100 永久名单、钻级 ¥200 永久名单加专属铭牌。\n名单由爱发电订单自动同步，显示名取自你的留言与贤圈昵称。在贤圈中心「鸣谢」页可查看。' },

    { id: 'profile', q: '怎么改昵称和头像？', k: ['改昵称', '换头像', '修改资料', '个性签名'],
      a: 'App：「我的 → 编辑资料」可改昵称、头像与个性签名。\n贤圈中心：「我的 → 编辑资料」同样可以。\n头像建议不超过 800KB，系统会自动压缩。' },

    { id: 'upload', q: '图片上传失败 / 能发几张？', k: ['图片上传', '发图失败', '图片压缩', '能发几张图', '图片太大'],
      a: '图片发布前会自动压缩：超过约 800KB 会逐级降低质量重压，小图直接上传。\n发帖图片数量受额度影响：普通账号 3 张，贤士卡会员 9 张，可用「发帖图片 +3」增量包叠加。' },

    { id: 'free', q: '尚贤圈收费吗？', k: ['收费', '免费吗', '花钱', '要不要钱'],
      a: '基础功能永久免费、无广告。\n收费项目只有自愿的贤士卡会员、增量额度包与鸡腿打赏，都不影响发帖、提问、私信等基础功能。' },

    { id: 'minor', q: '未成年人可以使用吗？', k: ['未成年', '几岁能用', '监护人', '学生能用吗'],
      a: '尚贤圈面向初高中学生，请遵守未成年人保护要求。\n未满 18 周岁购买会员或加鸡腿，应在监护人同意并陪同下进行；监护人有权要求中止后续消费。' },

    { id: 'contact', q: '怎么联系官方？', k: ['联系官方', '客服邮箱', '怎么联系你们', 'qq群', '投诉邮箱'],
      a: '一般问题：sxcommunity@outlook.com\n紧急事项：sxemergency@outlook.com\n用户个人事务：3982206481@qq.com\n也可加入页脚公示的 QQ 交流群。' }
  ]

  // 默认展示的推荐提问（全部为预设，点击不消耗 AI 额度）
  var DEFAULT_CHIPS = ['publish', 'anon', 'vip', 'tips', 'arrival', 'download', 'xqcenter', 'report']

  function byId (id) { for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i]; return null }

  // 归一化：去空白、去标点、转小写，用于宽松匹配
  function norm (s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[\s\u3000，。？！、；：,.?!;:~～…「」『』【】（）()《》〈〉"'`·\-—_/\\|]/g, '')
  }

  // 命中预设返回预设对象，否则 null
  function matchPreset (text) {
    var n = norm(text)
    if (!n) return null
    var i
    // 1) 与某个预设问题完全一致（推荐提问走这条）
    for (i = 0; i < PRESETS.length; i++) if (norm(PRESETS[i].q) === n) return PRESETS[i]
    // 2) 关键词最长命中，避免"太泛的词"误吞自由提问
    var best = null, bestLen = 0
    for (i = 0; i < PRESETS.length; i++) {
      var ks = PRESETS[i].k || []
      for (var j = 0; j < ks.length; j++) {
        var k = norm(ks[j])
        if (k && k.length > bestLen && n.indexOf(k) >= 0) { best = PRESETS[i]; bestLen = k.length }
      }
    }
    // 命中阈值：关键词至少 2 个字，避免单字误判
    return bestLen >= 2 ? best : null
  }


  if (window.__SXQ_AI_MOUNTED) return
  window.__SXQ_AI_MOUNTED = true

  // ---------- 设备唯一标识（本地持久化，用于限流与防伪；不上传任何个人信息） ----------
  function deviceId () {
    var KEY = 'sxq_device_id'
    var v = null
    try { v = localStorage.getItem(KEY) } catch (e) {}
    if (!v) {
      var rnd = ''
      try {
        var a = new Uint8Array(16)
        ;(window.crypto || window.msCrypto).getRandomValues(a)
        rnd = Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2) }).join('')
      } catch (e) {
        rnd = String(Date.now()) + Math.random().toString(16).slice(2)
      }
      v = 'sxq_' + rnd
      try { localStorage.setItem(KEY, v) } catch (e) {}
    }
    return v
  }

  // 轻量防篡校验（时间戳 + 随机数 + 校验和）。真正的防篡在服务端。
  function digest (str) {
    var h = 5381
    for (var i = 0; i < str.length; i++) { h = ((h << 5) + h + str.charCodeAt(i)) | 0 }
    return (h >>> 0).toString(16)
  }
  function sign (payload) {
    var ts = String(Date.now())
    var nonce = Math.random().toString(36).slice(2, 12)
    return { ts: ts, nonce: nonce, sig: digest(payload + '|' + ts + '|' + nonce + '|' + deviceId()) }
  }

  // ---------- DOM ----------
  var root = document.createElement('div')
  root.className = 'sxq-ai'
  root.innerHTML =
    '<button class="sxq-ai-tab" type="button" aria-label="打开智能客服">客服</button>' +
    '<button class="sxq-ai-fab" type="button" aria-label="打开智能客服" aria-expanded="false">' +
      '<span class="sxq-ai-fab-lottie" data-lottie="chatbot" data-lottie-autoplay></span>' +
      '<span class="sxq-ai-fab-dot" aria-hidden="true"></span>' +
    '</button>' +
    '<section class="sxq-ai-panel" role="dialog" aria-modal="false" aria-label="智能客服" hidden>' +
      '<span class="sxq-ai-resize" title="拖动可调整窗口大小" aria-hidden="true"></span>' +
      '<header class="sxq-ai-head">' +
        '<span class="sxq-ai-title">' + CFG.title + '</span>' +
        '<span class="sxq-ai-aigc" title="AI 生成内容">AI 生成</span>' +
        '<span class="sxq-ai-head-acts">' +
          '<button class="sxq-ai-min" type="button" aria-label="收起客服浮窗">收起</button>' +
          '<button class="sxq-ai-close" type="button" aria-label="关闭">×</button>' +
        '</span>' +
      '</header>' +
      '<div class="sxq-ai-log" aria-live="polite"></div>' +
      '<div class="sxq-ai-quickbar">' +
        '<div class="sxq-ai-quick"></div>' +
        '<button class="sxq-ai-qtoggle" type="button" aria-label="显示/隐藏推荐提问">收起推荐</button>' +
      '</div>' +
      '<form class="sxq-ai-form">' +
        '<input class="sxq-ai-input" type="text" maxlength="200" placeholder="问点关于尚贤圈的问题…" autocomplete="off" />' +
        '<button class="sxq-ai-send" type="submit">发送</button>' +
      '</form>' +
      '<footer class="sxq-ai-foot">' +
        '<span>回答由 AI 生成，仅供参考，可能出错。</span>' +
        '<a href="mailto:' + CFG.email + '">详细问题请发邮件</a>' +
      '</footer>' +
    '</section>'
  document.body.appendChild(root)

  var fab = root.querySelector('.sxq-ai-fab')
  var panel = root.querySelector('.sxq-ai-panel')
  var log = root.querySelector('.sxq-ai-log')
  var quick = root.querySelector('.sxq-ai-quick')
  var form = root.querySelector('.sxq-ai-form')
  var input = root.querySelector('.sxq-ai-input')
  var sendBtn = root.querySelector('.sxq-ai-send')

  var history = []        // 仅存于内存，关闭页面即失（符合“不存对话”）
  var busy = false

  // ---------- 渲染 ----------
  // 富文本：识别 http(s) 链接 → 可点击；识别邮箱 → mailto。
  // 安全：先转义 HTML，再只对 http(s)/mailto 生成 <a>，杜绝注入。
  var RE_LINK = /(https?:\/\/[^\s<>"'）)】\]]+)/g
  var RE_MAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

  function escapeHtml (s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function richHtml (text) {
    var s = escapeHtml(text)
    // 先处理链接，用占位符保护，避免邮箱正则在链接内部重复匹配
    var slots = []
    s = s.replace(RE_LINK, function (m) {
      slots.push('<a class="sxq-ai-link" href="' + m + '" target="_blank" rel="noopener noreferrer">' + m + '</a>')
      return '\u0000' + (slots.length - 1) + '\u0000'
    })
    // 邮箱（跳过已被链接占位的内容）
    s = s.replace(RE_MAIL, function (m) {
      slots.push('<a class="sxq-ai-link" href="mailto:' + m + '">' + m + '</a>')
      return '\u0000' + (slots.length - 1) + '\u0000'
    })
    s = s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return slots[Number(i)] || '' })
    return s.replace(/\n/g, '<br>')
  }

  function setRich (el, text) {
    el.innerHTML = richHtml(text)
  }

  function bubble (role, text, tag) {
    var el = document.createElement('div')
    el.className = 'sxq-ai-msg sxq-ai-msg--' + role
    if (role === 'assistant') {
      setRich(el, text)
      if (tag) {
        var t = document.createElement('span')
        t.className = 'sxq-ai-tag' + (tag === 'preset' ? ' sxq-ai-tag--preset' : '')
        t.textContent = tag === 'preset' ? '预设回答 · 未消耗 AI 额度' : 'AI 生成'
        el.appendChild(t)
      }
    } else el.textContent = text
    log.appendChild(el)
    log.scrollTop = log.scrollHeight
    return el
  }
  function renderQuick () {
    quick.innerHTML = ''
    var ids = (CFG.chips && CFG.chips.length) ? CFG.chips : DEFAULT_CHIPS
    ids.forEach(function (id) {
      var p = byId(id)
      if (!p) return
      var b = document.createElement('button')
      b.type = 'button'
      b.className = 'sxq-ai-chip'
      b.textContent = p.q
      b.title = '预设回答，不消耗 AI 额度'
      // 推荐提问 → 直接走预设，绝不请求接口
      b.addEventListener('click', function () { ask(p.q) })
      quick.appendChild(b)
    })
  }

  // ---------- 请求 ----------
  function ask (text) {
    if (busy || !text) return
    bubble('user', text)
    history.push({ role: 'user', content: text })

    // ① 命中预设问答库 → 本地直接作答，绝不请求 AI 接口，零计费。
    //    （所有推荐提问都在这条路径上，用户敲到预设问题也一样。）
    var hit = matchPreset(text)
    if (hit) {
      history.push({ role: 'assistant', content: hit.a })
      bubble('assistant', hit.a, 'preset')
      return
    }

    // ② 只有用户自己输入、且未命中任何预设时，才调用边缘函数（计费）。
    busy = true
    sendBtn.disabled = true
    var out = bubble('assistant', '')
    out.classList.add('sxq-ai-typing')

    var s = sign(text)
    fetch(CFG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CFG.anonKey,
        'Authorization': 'Bearer ' + CFG.anonKey
      },
      body: JSON.stringify({
        messages: history.slice(-8),
        deviceId: deviceId(),
        ts: s.ts,
        nonce: s.nonce,
        sig: s.sig,
        client: 'web',
        page: location.pathname
      })
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return {} }).then(function (j) {
          if (res.status === 404) {
            throw new Error('客服暂未上线（服务端函数未部署）。详细问题请发邮件 ' + CFG.email)
          }
          throw new Error(j.message || ('服务繁忙（' + res.status + '），请稍后再试'))
        })
      }
      var ct = res.headers.get('content-type') || ''
      if (ct.indexOf('text/event-stream') >= 0 && res.body) return stream(res.body, out)
      return res.json().then(function (j) {
        out.classList.remove('sxq-ai-typing')
        var reply = (j && j.reply) ? j.reply : '（暂无回复）'
        setRich(out, reply)
        history.push({ role: 'assistant', content: reply })
      })
    }).catch(function (err) {
      out.classList.remove('sxq-ai-typing')
      out.classList.add('sxq-ai-msg--error')
      var m = (err && err.message) ? String(err.message) : ''
      // 浏览器对 CORS / 断网 / 404 预检失败统一报 "Failed to fetch"，换成能看懂的提示
      if (!m || err.name === 'TypeError' || /failed to fetch|load failed|networkerror/i.test(m)) {
        m = '客服暂未上线或网络异常，请稍后再试。详细问题请发邮件 ' + CFG.email
      }
      setRich(out, m)
    }).then(function () {
      busy = false
      sendBtn.disabled = false
    })
  }

  // SSE 流式读取
  function stream (body, out) {
    var reader = body.getReader()
    var dec = new TextDecoder()
    var buf = ''
    var acc = ''
    function pump () {
      return reader.read().then(function (r) {
        if (r.done) {
          out.classList.remove('sxq-ai-typing')
          history.push({ role: 'assistant', content: acc })
          return
        }
        buf += dec.decode(r.value, { stream: true })
        var parts = buf.split('\n')
        buf = parts.pop()
        parts.forEach(function (line) {
          line = line.trim()
          if (line.indexOf('data:') !== 0) return
          var payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') return
          try {
            var j = JSON.parse(payload)
            var piece = j.delta || j.text || ''
            if (piece) { acc += piece; setRich(out, acc); log.scrollTop = log.scrollHeight }
          } catch (e) {}
        })
        return pump()
      })
    }
    return pump()
  }

  // ---------- 交互 ----------
  function open () {
    panel.hidden = false
    root.classList.add('sxq-ai-open')
    fab.setAttribute('aria-expanded', 'true')
    if (!log.childNodes.length) {
      bubble('assistant', '你好，我是尚贤圈智能客服。可以问发帖、匿名、会员、下载、规则等产品问题；校园生活类也可以。详细问题请发邮件 ' + CFG.email + '。')
    }
    if (window.SXQ_LOTTIE && window.SXQ_LOTTIE.refresh) window.SXQ_LOTTIE.refresh()
    setTimeout(function () { input.focus() }, 60)
  }
  function close () {
    panel.hidden = true
    root.classList.remove('sxq-ai-open')
    fab.setAttribute('aria-expanded', 'false')
  }

  fab.addEventListener('click', function () { panel.hidden ? open() : close() })
  root.querySelector('.sxq-ai-close').addEventListener('click', close)

  // 「收起」= 把整个浮窗让开页面，只留右侧一个细标签，随时可再打开
  var tab = root.querySelector('.sxq-ai-tab')
  root.querySelector('.sxq-ai-min').addEventListener('click', function () {
    close()
    root.classList.add('sxq-ai-hidden')
  })
  tab.addEventListener('click', function () {
    root.classList.remove('sxq-ai-hidden')
    open()
  })
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var v = input.value.trim()
    if (!v) return
    input.value = ''
    ask(v)
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) close()
  })

  renderQuick()

  /* ══════════ 面板尺寸：拖左上角调整（范围钳制 + 本地持久化） ══════════ */
  var SIZE_KEY = 'sxq_ai_size'
  var QUICK_KEY = 'sxq_ai_quick_off'
  var rz = root.querySelector('.sxq-ai-resize')
  var clampN = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
  function applySize (w, h) {
    var st = document.documentElement.style
    if (w) st.setProperty('--sxq-ai-w', Math.round(w) + 'px')
    if (h) st.setProperty('--sxq-ai-h', Math.round(h) + 'px')
  }
  function saveSize (w, h) {
    try { localStorage.setItem(SIZE_KEY, JSON.stringify({ w: Math.round(w), h: Math.round(h) })) } catch (e) {}
  }
  function sizeRange () {
    var vw = window.innerWidth, vh = window.innerHeight
    return { wMin: 280, wMax: Math.min(760, vw - 24), hMin: 300, hMax: Math.min(920, vh - 110) }
  }
  ;(function restoreSize () {
    var s = null
    try { s = JSON.parse(localStorage.getItem(SIZE_KEY) || 'null') } catch (e) {}
    if (!s || !s.w || !s.h) return
    var R = sizeRange()
    applySize(clampN(s.w, R.wMin, R.wMax), clampN(s.h, R.hMin, R.hMax))
  })()

  if (rz) {
    var drag = null
    rz.addEventListener('pointerdown', function (e) {
      e.preventDefault()
      var r = panel.getBoundingClientRect()
      drag = { x: e.clientX, y: e.clientY, w: r.width, h: r.height }
      root.classList.add('sxq-ai-resizing')
      try { rz.setPointerCapture(e.pointerId) } catch (err) {}
    })
    rz.addEventListener('pointermove', function (e) {
      if (!drag) return
      var R = sizeRange()
      // 面板锚定在右下角：指针往左/上移动 → 尺寸变大
      applySize(
        clampN(drag.w + (drag.x - e.clientX), R.wMin, R.wMax),
        clampN(drag.h + (drag.y - e.clientY), R.hMin, R.hMax)
      )
    })
    var endDrag = function () {
      if (!drag) return
      var r = panel.getBoundingClientRect()
      saveSize(r.width, r.height)
      drag = null
      root.classList.remove('sxq-ai-resizing')
    }
    rz.addEventListener('pointerup', endDrag)
    rz.addEventListener('pointercancel', endDrag)
  }

  /* ══════════ 推荐提问：单行横向滚动 + 可整体收起 ══════════ */
  var qt = root.querySelector('.sxq-ai-qtoggle')
  function applyQuick (off) {
    quick.classList.toggle('sxq-ai-quick--off', off)
    if (qt) qt.textContent = off ? '展开推荐' : '收起推荐'
  }
  var quickOff = false
  try { quickOff = localStorage.getItem(QUICK_KEY) === '1' } catch (e) {}
  applyQuick(quickOff)
  if (qt) qt.addEventListener('click', function () {
    quickOff = !quickOff
    applyQuick(quickOff)
    try { localStorage.setItem(QUICK_KEY, quickOff ? '1' : '0') } catch (e) {}
  })

  // 右下角浮动操作分列排布：探测站点自带的浮动按钮/底栏，把 AI 客服叠到它们上方，
  // 避免遮挡「返回顶部」「发布」等原有按钮（三站通用）。
  function layoutFloat () {
    var GAP = 12
    var vw = window.innerWidth
    var vh = window.innerHeight
    var bottom = 18

    // 白名单：只避让这些"右下角浮动件 / 贴底通栏"，避免误判右侧竖排导航（如 .sec-rail）
    var probes = document.querySelectorAll(
      '#backTop, .fab, .tabbar, .uni-tabbar, .mtab, [data-sxq-avoid]'
    )

    Array.prototype.forEach.call(probes, function (el) {
      if (root.contains(el)) return
      var cs
      try { cs = getComputedStyle(el) } catch (e) { return }
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return
      var r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      // 只关心右下角的浮动件，或贴底的整条底栏
      var isBottomBar = r.width > vw * 0.6 && r.bottom > vh - 130
      var isRightFloat = r.right > vw * 0.55 && r.bottom > vh * 0.4
      if (isBottomBar || isRightFloat) {
        var need = (vh - r.top) + GAP
        if (need > bottom) bottom = need
      }
    })

    var rootStyle = document.documentElement.style
    rootStyle.setProperty('--sxq-ai-bottom', Math.round(bottom) + 'px')
    // 面板最大高度随之下调，保证不顶出视口
    var maxH = Math.max(240, vh - Math.round(bottom) - 110)
    rootStyle.setProperty('--sxq-ai-maxh', maxH + 'px')
  }

  layoutFloat()
  setTimeout(layoutFloat, 900)
  setTimeout(layoutFloat, 2400)
  var rafId = null
  function onScrollResize () {
    if (rafId) return
    rafId = requestAnimationFrame(function () { rafId = null; layoutFloat() })
  }
  window.addEventListener('resize', onScrollResize)
  window.addEventListener('scroll', onScrollResize, { passive: true })

  window.SXQ_AI_CHAT = { open: open, close: close, ask: ask }
})()
