/* ══════════════════════════════════════════════════════════════
   尚贤圈 · 招贤纳士   共享脚本
   四个页面共用：导航/页脚注入、视差、字符雨、打字机、数字滚动、
   环形流程、岗位列表与详情、腾讯问卷素材区、进度查询
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict'

  /* ── 全局配置（要改的东西都在这里） ── */
  var SITE = {
    surveyUrl: 'https://wj.qq.com/s2/28018323/gqle/',
    emailUser: 'sxcommunity',
    emailDomain: 'outlook.com',
    gitee: 'https://gitee.com/kernthal-studio/sxcommunity/releases',
    xqCenter: 'https://sxcommunity.github.io/xq-center/',
    pwa: 'https://sxcommunity.github.io/sxq-pwa/',
    official: 'https://kernthal.github.io/shangxianquan-official/',
    afdian: 'https://ifdian.net/a/kernthal-sxquan',
    disclosure: '../disclosure/index.html',
    history: '../history/',
    ENDPOINT: 'https://ocgqafxaapfzraeiehqg.supabase.co/rest/v1/rpc/xq_career_apply',
    STATUS_FN: 'https://ocgqafxaapfzraeiehqg.supabase.co/rest/v1/rpc/xq_career_status',
    ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ3FhZnhhYXBmenJhZWllaHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5OTYwOTYsImV4cCI6MjEwMzU3MjA5Nn0.icNXBGRtofllZkvypUvbJqwRxxaLwVLaXC92J5DhKI0'
  }
  window.SXQ = SITE

  var PAGE = document.body.getAttribute('data-page') || 'index'
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var isMobile = window.matchMedia('(max-width: 859px)').matches
  var $ = function (s, r) { return (r || document).querySelector(s) }
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)) }

  /* ═══════════ 1. 导航与页脚注入（四页共用，改一处即全站生效） ═══════════ */
  var NAV = [
    { k: 'index', n: '加入我们', href: './' },
    { k: 'about', n: '关于我们', href: './about.html' },
    { k: 'jobs', n: '岗位', href: './jobs.html' },
    { k: 'process', n: '招聘流程', href: './process.html' },
    { k: 'apply', n: '报名', href: './apply.html' }
  ]

  function injectBar () {
    var host = $('#xbar')
    if (!host) return
    host.className = 'xbar'
    host.innerHTML =
      '<a class="xbar-logo" href="./">' +
        '<span class="xbar-seal">贤</span>' +
        '<span class="xbar-t"><b>尚贤圈 · 招贤纳士</b><small>SHANGXIANQUAN CAREERS</small></span>' +
      '</a>' +
      '<nav class="xbar-nav">' + NAV.map(function (x) {
        return '<a href="' + x.href + '"' + (x.k === PAGE ? ' class="on"' : '') + '>' + x.n + '</a>'
      }).join('') + '</nav>' +
      '<a class="xbar-cta" href="./apply.html">立即报名</a>'
  }

  function injectFooter () {
    var host = $('#xfooter')
    if (!host) return
    var mail = SITE.emailUser + '@' + SITE.emailDomain
    host.innerHTML =
      '<div class="wrap">' +
        '<div class="ft-grid">' +
          '<div>' +
            '<div class="ft-brand"><span class="ft-seal">贤</span>' +
              '<span><b>尚贤圈</b><small>SHANGXIAN QUAN</small></span></div>' +
            '<p class="ft-desc">桂林市尚贤学校校园社区。由 Kernthal Studio 开发维护，基础功能永久免费、无广告。</p>' +
          '</div>' +
          '<div><h5>JOIN US</h5><ul>' +
            NAV.map(function (x) { return '<li><a href="' + x.href + '">' + x.n + '</a></li>' }).join('') +
          '</ul></div>' +
          '<div><h5>PRODUCT</h5><ul>' +
            '<li><a href="' + SITE.gitee + '" target="_blank" rel="noopener">App 下载（Gitee Releases）</a></li>' +
            '<li><a href="' + SITE.xqCenter + '" target="_blank" rel="noopener">贤圈中心（网页版）</a></li>' +
            '<li><a href="' + SITE.pwa + '" target="_blank" rel="noopener">App 网页版</a></li>' +
            '<li><a href="' + SITE.official + '" target="_blank" rel="noopener">官网</a></li>' +
          '</ul></div>' +
          '<div><h5>CONTACT</h5><ul>' +
            '<li><a href="mailto:' + mail + '?subject=' + encodeURIComponent('招贤纳士咨询') + '">' + mail + '</a></li>' +
            '<li><a href="' + SITE.afdian + '" target="_blank" rel="noopener">爱发电</a></li>' +
            '<li><a href="' + SITE.disclosure + '" target="_blank" rel="noopener">信息披露中心</a></li>' +
            '<li><a href="' + SITE.history + '" target="_blank" rel="noopener">版本档案馆</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="ft-bottom">' +
          '<span>© 2026 尚贤圈 · 桂林市尚贤学校校园社区 · Kernthal Studio</span>' +
          '<span>本页信息以最终面谈确认的书面记录为准</span>' +
        '</div>' +
      '</div>'
  }

  /* ═══════════ 2. 滚动进度 + 右侧进度点 ═══════════ */
  function initProgress () {
    var bar = $('#xprog')
    var raf = null
    function tick () {
      raf = null
      if (bar) {
        var h = document.documentElement
        bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%'
      }
      // 进度点高亮
      var dots = $$('.rail-dots button')
      if (dots.length) {
        var best = 0, bestD = 1e9
        dots.forEach(function (d, i) {
          var t = $(d.dataset.target)
          if (!t) return
          var dist = Math.abs(t.getBoundingClientRect().top - 120)
          if (dist < bestD) { bestD = dist; best = i }
        })
        dots.forEach(function (d, i) { d.classList.toggle('on', i === best) })
      }
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick) }, { passive: true })
    window.addEventListener('resize', tick)
    tick()
  }

  function injectRailDots () {
    var secs = $$('section[id]')
    if (secs.length < 2) return
    var host = document.createElement('div')
    host.className = 'rail-dots'
    host.innerHTML = secs.map(function (s) {
      var t = $('.eyebrow', s) || $('h2', s)
      var label = t ? t.textContent.trim().slice(0, 14) : s.id
      return '<button data-target="#' + s.id + '" title="' + label + '" aria-label="' + label + '"></button>'
    }).join('')
    document.body.appendChild(host)
    host.addEventListener('click', function (e) {
      var b = e.target.closest('button')
      if (!b) return
      var t = $(b.dataset.target)
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    })
  }

  /* ═══════════ 3. 视差：四层 + 全页 + 手机降级 ═══════════ */
  function initParallax () {
    if (reduce) return
    var els = [], cache = []
    var scale = isMobile ? 0.45 : 1
    function collect () {
      els = $$('[data-px]')
      cache = els.map(function (el) {
        var r = el.getBoundingClientRect()
        return { top: r.top + window.scrollY, h: r.height || 1 }
      })
    }
    var raf = null
    function render () {
      raf = null
      var sy = window.scrollY, vh = window.innerHeight
      for (var i = 0; i < els.length; i++) {
        var mid = cache[i].top + cache[i].h / 2 - sy
        var off = (mid - vh / 2) / vh
        var y = off * (parseFloat(els[i].dataset.px) || 0) * 120 * scale
        var x = off * (parseFloat(els[i].dataset.pxx) || 0) * 160 * scale
        els[i].style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)'
      }
    }
    function onScroll () { if (!raf) raf = requestAnimationFrame(render) }
    collect(); render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', function () { isMobile = window.matchMedia('(max-width: 859px)').matches; scale = isMobile ? 0.45 : 1; collect(); onScroll() })
    window.addEventListener('load', function () { collect(); render() })
    setTimeout(function () { collect(); render() }, 400)
  }

  /* ═══════════ 4. 入场动效（默认可见 + 三重兜底） ═══════════ */
  function initReveal () {
    var root = document.documentElement
    if (!('IntersectionObserver' in window)) return
    root.classList.add('anim')
    var els = $$('.rv')
    function showAll () { els.forEach(function (e) { e.classList.add('in') }) }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: .06, rootMargin: '0px 0px -4% 0px' })
    els.forEach(function (e) { io.observe(e) })
    function inView () {
      var vh = window.innerHeight
      els.forEach(function (e) {
        var r = e.getBoundingClientRect()
        if (r.top < vh && r.bottom > -40) e.classList.add('in')
      })
    }
    requestAnimationFrame(inView); setTimeout(inView, 220)
    window.addEventListener('load', inView)
    window.addEventListener('hashchange', function () { setTimeout(showAll, 60) })
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a[href^="#"]')) setTimeout(showAll, 80)
    })
    setTimeout(showAll, 2500)
  }

  /* ═══════════ 5. 数字滚动 ═══════════ */
  function initCount () {
    var els = $$('[data-count]')
    if (!els.length) return
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.textContent = e.dataset.count }); return }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return
        var el = en.target, target = parseFloat(el.dataset.count) || 0
        var dec = (String(el.dataset.count).split('.')[1] || '').length
        var t0 = null
        function step (ts) {
          if (!t0) t0 = ts
          var p = Math.min(1, (ts - t0) / 900)
          var v = target * (1 - Math.pow(1 - p, 3))
          el.textContent = dec ? v.toFixed(dec) : Math.round(v)
          if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
        io.unobserve(el)
      })
    }, { threshold: .4 })
    els.forEach(function (e) { io.observe(e) })
  }

  /* ═══════════ 6. 打字机 ═══════════ */
  function typewriter (el, text, speed) {
    if (reduce) { el.textContent = text; return }
    el.classList.add('tw')
    var i = 0
    ;(function step () {
      el.textContent = text.slice(0, ++i)
      if (i < text.length) setTimeout(step, speed || 68)
      else el.classList.remove('tw')
    })()
  }

  /* ═══════════ 7. 字符雨（节与节之间 / 换页时） ═══════════ */
  var RAIN_CHARS = '尚贤圈校园社区招贤纳士报名0123456789ABCDEF○●◇◆░▒▓'
  function makeRain (host, count) {
    var frag = document.createDocumentFragment()
    for (var i = 0; i < (count || 46); i++) {
      var s = document.createElement('span')
      var n = 6 + Math.floor(Math.random() * 10)
      var t = ''
      for (var j = 0; j < n; j++) t += RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)] + '\n'
      s.textContent = t
      s.style.left = (Math.random() * 100).toFixed(2) + '%'
      s.style.animation = 'rainfall ' + (0.9 + Math.random() * 1.1).toFixed(2) + 's linear ' + (Math.random() * 0.5).toFixed(2) + 's 1 forwards'
      frag.appendChild(s)
    }
    host.appendChild(frag)
  }
  function injectRainKeyframes () {
    if ($('#rainKf')) return
    var st = document.createElement('style')
    st.id = 'rainKf'
    st.textContent = '@keyframes rainfall{from{transform:translateY(0)}to{transform:translateY(132vh)}}'
    document.head.appendChild(st)
  }

  /* 页面切换：先把字符雨盖上来，再跳走（只对站内 .html 链接生效） */
  function initPageTransitions () {
    if (reduce) return
    injectRainKeyframes()
    var full = document.createElement('div')
    full.className = 'rainfull'
    document.body.appendChild(full)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]')
      if (!a) return
      var href = a.getAttribute('href') || ''
      if (!/^(\.\/)?[a-z-]+\.html$/.test(href) && href !== './') return
      if (a.target === '_blank' || e.metaKey || e.ctrlKey) return
      e.preventDefault()
      makeRain(full, 40)
      full.classList.add('on')
      setTimeout(function () { location.href = href }, 330)
    })
  }

  /* ═══════════ 8. 环形流程（学 Kimi 登月申请流程） ═══════════ */
  var FLOW = [
    { n: '01', t: '投递报名', d: '填报名表或走腾讯问卷、邮箱、QQ 群任一渠道。提交后立刻拿到报名编号。' },
    { n: '02', t: '材料初审', d: '3 个工作日内逐份看完，重点看开放题与作品。无论通过与否都会回复。' },
    { n: '03', t: '线上面谈', d: '十五到二十分钟，聊你想做什么、能投入多少、提成档位怎么定。可以带家长一起听。' },
    { n: '04', t: '确认意向', d: '双方确认岗位、投入时长与提成比例，形成简短书面记录，各留一份。' },
    { n: '05', t: '两周试用', d: '做一件真实的小事，标准提前告知，不靠感觉判断。' },
    { n: '06', t: '正式加入', d: '进入贡献者名单，开通权限，按第一个月任务量执行并按月结算。' }
  ]

  function renderFlow () {
    var host = $('#flowring')
    if (!host) return
    var R = 37 // 半径（百分比）
    var nodes = FLOW.map(function (f, i) {
      var ang = (-90 + i * (360 / FLOW.length)) * Math.PI / 180
      var x = 50 + R * Math.cos(ang)
      var y = 50 + R * 0.78 * Math.sin(ang)
      return '<div class="fnode" data-i="' + i + '" style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%">' +
          pixIcon(i) +
          '<span class="fnode-n">' + (i + 1) + '</span>' +
        '</div>'
    }).join('')

    host.innerHTML =
      '<svg viewBox="0 0 100 78">' +
        '<ellipse cx="50" cy="39" rx="' + R + '" ry="' + (R * 0.78).toFixed(2) + '" fill="none" ' +
          'stroke="#ddd3bf" stroke-width="0.5" stroke-dasharray="2 1.6"/>' +
        '<ellipse cx="50" cy="39" rx="' + (R - 6) + '" ry="' + ((R - 6) * 0.78).toFixed(2) + '" fill="none" ' +
          'stroke="rgba(185,138,47,.3)" stroke-width="0.35"/>' +
      '</svg>' +
      '<div class="fcard" id="flowcard"></div>' +
      nodes

    function show (i) {
      var f = FLOW[i]
      $('#flowcard').innerHTML = '<div class="fn">STEP ' + f.n + '</div><b>' + f.t + '</b><p>' + f.d + '</p>'
      $$('.fnode', host).forEach(function (n) { n.classList.toggle('on', +n.dataset.i === i) })
    }
    host.addEventListener('click', function (e) {
      var n = e.target.closest('.fnode')
      if (n) show(+n.dataset.i)
    })
    show(0)
    // 自动轮播
    if (!reduce) {
      var idx = 0, paused = false
      host.addEventListener('mouseenter', function () { paused = true })
      host.addEventListener('mouseleave', function () { paused = false })
      setInterval(function () { if (!paused) { idx = (idx + 1) % FLOW.length; show(idx) } }, 3200)
    }
  }

  /* 8×8 像素图标（纯字符串点阵，零图片零请求） */
  var ICONS = [
    ['..1111..', '.1....1.', '.1....1.', '.1....1.', '.1....1.', '.111111.', '..1..1..', '.11..11.'],
    ['..1111..', '.1....1.', '1.1..1.1', '1..11..1', '1..11..1', '1.1..1.1', '.1....1.', '..1111..'],
    ['..1111..', '.1....1.', '1..11..1', '1.1..1.1', '1.1..1.1', '1..11..1', '.1....1.', '..1111..'],
    ['...11...', '...11...', '.111111.', '.1....1.', '.1....1.', '.111111.', '...11...', '...11...'],
    ['11111111', '1......1', '1.1111.1', '1.1..1.1', '1.1..1.1', '1.1111.1', '1......1', '11111111'],
    ['...11...', '..1111..', '.111111.', '11111111', '.1.11.1.', '.1.11.1.', '11....11', '11....11']
  ]
  function pixIcon (i) {
    var map = ICONS[i % ICONS.length]
    var rects = ''
    for (var y = 0; y < map.length; y++) {
      for (var x = 0; x < map[y].length; x++) {
        if (map[y][x] === '1') rects += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'
      }
    }
    return '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" style="padding:16px;box-sizing:border-box" fill="#c8401f">' + rects + '</svg>'
  }

  /* ═══════════ 9. 山水像素画（程序生成，无图片） ═══════════ */
  function mountainSVG (w, h, seed) {
    var cols = w, rows = h
    var rects = ''
    var s = seed || 7
    function rnd () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 }
    var ridge = []
    var y = rows * 0.52
    for (var x = 0; x < cols; x++) {
      y += (rnd() - 0.5) * 1.5
      y = Math.max(rows * 0.16, Math.min(rows * 0.86, y))
      ridge.push(Math.round(y))
    }
    // 第二层远山
    var ridge2 = [], y2 = rows * 0.4
    for (var x2 = 0; x2 < cols; x2++) {
      y2 += (rnd() - 0.5) * 1.0
      y2 = Math.max(rows * 0.1, Math.min(rows * 0.7, y2))
      ridge2.push(Math.round(y2))
    }
    for (var c = 0; c < cols; c++) {
      rects += '<rect x="' + c + '" y="' + ridge2[c] + '" width="1" height="' + (rows - ridge2[c]) + '" fill="rgba(185,138,47,.24)"/>'
    }
    for (var c2 = 0; c2 < cols; c2++) {
      rects += '<rect x="' + c2 + '" y="' + ridge[c2] + '" width="1" height="' + (rows - ridge[c2]) + '" fill="rgba(28,26,23,.82)"/>'
    }
    // 水面横纹
    for (var r2 = Math.round(rows * 0.8); r2 < rows; r2 += 2) {
      var off = (r2 % 4 === 0) ? 0 : 1
      rects += '<rect x="' + off + '" y="' + r2 + '" width="' + (cols - 1) + '" height="1" fill="rgba(200,64,31,.16)" opacity="' + (r2 / rows).toFixed(2) + '"/>'
    }
    return '<svg viewBox="0 0 ' + cols + ' ' + rows + '" shape-rendering="crispEdges" preserveAspectRatio="none">' + rects + '</svg>'
  }

  /* ═══════════ 10. 贤字图腾（同心环 + 环形旋转文字 + 像素山水） ═══════════ */
  function renderTotem () {
    var host = $('#totem')
    if (!host) return
    var ringText = '尚贤圈 · 桂林市尚贤学校校园社区 · 招贤纳士 · '
    host.innerHTML =
      '<div class="totem-art px" data-px="0.12">' +
        '<svg viewBox="0 0 200 200" shape-rendering="crispEdges">' +
          '<rect x="0" y="150" width="200" height="50" fill="none"/>' +
        '</svg>' +
        '<div style="position:absolute;inset:14%">' + mountainSVG(120, 80, 13) + '</div>' +
        /* 印章 */
        '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
          'width:104px;height:104px;border-radius:14px;background:linear-gradient(140deg,#c8401f,#9e3015);' +
          'display:grid;place-items:center;box-shadow:0 12px 34px rgba(200,64,31,.34);overflow:hidden">' +
          '<span class="dotface-lg" style="font-size:52px;color:#fff;line-height:1">贤</span>' +
        '</div>' +
        /* 环形旋转文字 */
        '<svg class="totem-ring" viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%">' +
          '<defs><path id="ringPath" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"/></defs>' +
          '<text style="font-family:var(--mono);font-size:8.4px;letter-spacing:2.6px;fill:#57503f">' +
            '<textPath href="#ringPath" startOffset="0">' + ringText + ringText + '</textPath>' +
          '</text>' +
        '</svg>' +
        /* 外圈点阵环 */
        '<svg viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%">' +
          dotsRing(100, 100, 96, 72, 'rgba(200,64,31,.32)') +
          dotsRing(100, 100, 74, 48, 'rgba(185,138,47,.3)') +
        '</svg>' +
      '</div>'
  }
  function dotsRing (cx, cy, r, count, color) {
    var s = ''
    for (var i = 0; i < count; i++) {
      var a = (i / count) * Math.PI * 2
      var x = (cx + r * Math.cos(a)).toFixed(2)
      var y = (cy + r * Math.sin(a)).toFixed(2)
      var big = i % 6 === 0
      s += '<rect x="' + x + '" y="' + y + '" width="' + (big ? 2 : 1.2) + '" height="' + (big ? 2 : 1.2) + '" fill="' + color + '"/>'
    }
    return s
  }

  /* ═══════════ 11. 触底加载：在每屏底部插「继续探索」 ═══════════ */
  function initScrollHints () {
    $$('.screen').forEach(function (s) {
      if ($('.scroll-hint', s)) return
      var h = document.createElement('div')
      h.className = 'scroll-hint'
      h.innerHTML = '<i></i><span>SCROLL</span>'
      s.appendChild(h)
    })
  }

  /* ═══════════ 12. 岗位：列表 + 详情（学字节） ═══════════ */
  var JOBS = [
    {
      id: 'SXQ-AMB-01', key: 'ambassador', name: '校园大使', en: 'CAMPUS AMBASSADOR',
      city: '校内', type: '兼职', dept: '推广与社群', num: '1–3 人',
      desc: '在班级和社团里让同学知道尚贤圈，收集大家真正想要什么、哪里不好用，并组织小型线下活动（例如失物招领角）。工作以线下为主，不需要坐班，时间自己安排。',
      duties: [
        '在自己班级与熟识的社团里介绍尚贤圈，让同学真正用起来（不是扫码看一眼，而是完成一次真实操作）',
        '收集同学的反馈，每周整理成清单交给主理人，写清「哪里不好用、希望能怎样」',
        '组织小型线下活动，例如失物招领角、闲置交换角，提前一周报备',
        '每周在群里同步一次进度：做了什么、卡在哪里、下周做什么'
      ],
      reqs: [
        '本校在读同学，年级不限',
        '愿意主动跟同学说话，不怕被拒绝',
        '能把一件事讲清楚，不夸张、不承诺自己做不到的事',
        '每周能投入 2–4 小时'
      ],
      fit: '人缘不错、乐意张罗、愿意跑腿的同学。不需要写代码，不需要成绩好。'
    },
    {
      id: 'SXQ-DSN-01', key: 'design', name: '设计', en: 'DESIGN',
      city: '校内 / 远程', type: '兼职', dept: '视觉与物料', num: '1–2 人',
      desc: '负责尚贤圈对外的视觉物料：招新海报、功能配图、活动视觉，以及把复杂功能画成一眼能懂的图示。作品会真实出现在校园公告栏和同学手机里。',
      duties: [
        '交付招新海报、活动海报与功能配图，需给出可编辑源文件',
        '把复杂功能（例如贤圈ID绑定、增量包）画成一眼能懂的图示',
        '维护一套可复用的模板，让后续物料改字就能出',
        '配合校园大使的线下活动提供现场物料'
      ],
      reqs: [
        '会用任意一款设计工具（稿定 / Canva / Photoshop / Illustrator 都算）',
        '对配色和排版有基本判断，能接受被要求改稿',
        '每周能投入 3–5 小时，不卡死期限但要有交付'
      ],
      fit: '喜欢把东西弄好看、在意细节的同学。不需要科班出身，也不需要专业设备。'
    },
    {
      id: 'SXQ-CNT-01', key: 'content', name: '运营 / 内容', en: 'CONTENT',
      city: '校内 / 远程', type: '兼职', dept: '内容与规则', num: '1–2 人',
      desc: '负责尚贤圈的文字产出：月刊、功能说明、规则解读与推文，并把同学零散的反馈整理成能执行的清单。这个岗位的核心不是文笔，是把话说清楚。',
      duties: [
        '每月产出一篇月刊栏目或功能说明，需排版完成、可直接发布',
        '把规则中心的条款改写成同学看得懂的短文',
        '整理与归档同学反馈，输出可执行的改进清单',
        '维护常见问题应答口径，供其他伙伴统一使用'
      ],
      reqs: [
        '能把话说短、说准，写得让人愿意读完',
        '愿意反复改稿，能接受「说得漂亮」不如「说得清楚」',
        '每周能投入 3–5 小时'
      ],
      fit: '爱写、爱整理、爱表达的同学。不需要文笔华丽，也不需要运营经验。'
    }
  ]

  function renderJobList () {
    var host = $('#joblist')
    if (!host) return
    host.innerHTML = JOBS.map(function (j) {
      return '<button class="jrow" data-job="' + j.key + '">' +
        '<span class="jrow-l">' +
          '<span class="jt">' + j.name + '</span>' +
          '<span class="jm">' +
            '<span>' + j.city + '</span><span>' + j.type + '</span>' +
            '<span>' + j.dept + '</span><span>' + j.num + '</span>' +
            '<span class="jid">' + j.id + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="jrow-r">›</span>' +
      '</button>'
    }).join('') +
    '<div class="jrow no" style="cursor:default;grid-template-columns:1fr">' +
      '<span class="jrow-l"><span class="jt" style="color:var(--muted)">开发岗（本次不招）</span>' +
      '<span class="jm"><span>尚贤圈全部代码由主理人一人开发与维护，保持架构与风格一致</span></span></span>' +
    '</div>'
  }

  function openJob (key, prefill) {
    var j = JOBS.filter(function (x) { return x.key === key })[0]
    if (!j) return
    var mask = $('#jobmask')
    if (!mask) return
    $('#jobbody').innerHTML =
      '<div class="jd-sec">' +
        '<h3 style="font-family:var(--mono);font-size:21px;font-weight:900;margin-bottom:8px">' + j.name + ' · ' + j.en + '</h3>' +
        '<div class="jd-meta"><span>' + j.city + '</span><span>' + j.type + '</span><span>' + j.dept + '</span>' +
          '<span>招聘 ' + j.num + '</span><span class="jid">' + j.id + '</span></div>' +
      '</div>' +
      '<div class="jd-sec"><h4>职位描述</h4><p>' + j.desc + '</p></div>' +
      '<div class="jd-sec"><h4>你要做的事</h4><ol>' + j.duties.map(function (d) { return '<li>' + d + '</li>' }).join('') + '</ol></div>' +
      '<div class="jd-sec"><h4>职位要求</h4><ol>' + j.reqs.map(function (d) { return '<li>' + d + '</li>' }).join('') + '</ol></div>' +
      '<div class="jd-sec"><h4>适合谁</h4><p>' + j.fit + '</p></div>' +
      '<div class="jd-sec"><h4>收益</h4><p>无底薪，按产出提成，按月结算。具体档位在面谈时确认，本页不承诺金额。全程不收取任何费用。</p></div>'
    mask.classList.add('on')
    document.body.classList.add('lock')
    $('.btn-p', mask).onclick = function () {
      mask.classList.remove('on')
      document.body.classList.remove('lock')
      location.href = './apply.html?job=' + j.key
    }
  }

  function initJobs () {
    renderJobList()
    var mask = $('#jobmask')
    if (mask) {
      mask.addEventListener('click', function (e) {
        if (e.target === mask || e.target.closest('.m-x')) {
          mask.classList.remove('on'); document.body.classList.remove('lock')
        }
      })
    }
    var host = $('#joblist')
    if (host) {
      host.addEventListener('click', function (e) {
        var r = e.target.closest('.jrow[data-job]')
        if (r) openJob(r.dataset.job)
      })
    }
    // 卡片概览也点得开
    $$('[data-openjob]').forEach(function (c) {
      c.addEventListener('click', function () { openJob(c.dataset.openjob) })
    })
    // 带 ?job= 直接打开详情
    var q = new URLSearchParams(location.search).get('job')
    if (q && mask) openJob(q)
  }

  /* ═══════════ 13. 腾讯问卷素材区 ═══════════ */
  function initSurveyBlock () {
    var url = SITE.surveyUrl
    var linkEl = $('#wjLink')
    if (linkEl) { linkEl.href = url; linkEl.textContent = url.replace(/^https?:\/\//, '') }
    var cp = $('#wjCopy')
    if (cp) {
      cp.addEventListener('click', function () {
        var done = function () { cp.textContent = '已复制'; setTimeout(function () { cp.textContent = '复制链接' }, 1600) }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { fallback() })
        } else fallback()
        function fallback () {
          var t = document.createElement('textarea')
          t.value = url; document.body.appendChild(t); t.select()
          try { document.execCommand('copy'); done() } catch (e) { cp.textContent = '请手动复制' }
          document.body.removeChild(t)
        }
      })
    }
    var pb = $('#wjPoster')
    var lb = $('#lightbox')
    if (pb && lb) {
      pb.addEventListener('click', function () { lb.classList.add('on'); document.body.classList.add('lock') })
      lb.addEventListener('click', function () { lb.classList.remove('on'); document.body.classList.remove('lock') })
    }
  }

  /* ═══════════ 14. 进度查询 ═══════════ */
  function initStatusQuery () {
    var btn = $('#qbtn')
    if (!btn) return
    var codeEl = $('#q-code'), phoneEl = $('#q-phone'), msgEl = $('#qmsg'), res = $('#qres')
    var LABEL = { pending: '初审中', reviewing: '待面谈', accepted: '已通过', rejected: '未通过' }
    var DESC = {
      pending: '材料已收到，正在排队初审，3 个工作日内会有结果。',
      reviewing: '初审已过，正在安排线上面谈，会通过你留的联系方式约时间。',
      accepted: '已经通过，接下来会有人联系你确认岗位与提成档位。',
      rejected: '这次没有通过。不影响你以后再报名，也欢迎发邮件问原因。'
    }
    btn.addEventListener('click', function () {
      var code = (codeEl.value || '').trim().toUpperCase()
      var phone = (phoneEl.value || '').trim()
      if (!code) { msgEl.textContent = '请填写报名编号'; return }
      if (!/^\d{11}$/.test(phone)) { msgEl.textContent = '请填写 11 位手机号'; return }
      msgEl.textContent = '查询中…'; res.innerHTML = ''
      fetch(SITE.STATUS_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SITE.ANON, Authorization: 'Bearer ' + SITE.ANON },
        body: JSON.stringify({ p_code: code, p_phone: phone })
      }).then(function (r) { return r.json() }).then(function (j) {
        msgEl.textContent = ''
        if (!j || !j.ok) {
          var m = (j && (j.message || j.error)) || ''
          res.innerHTML = '<p class="note">' + (/Could not find|PGRST202|does not exist/i.test(m)
            ? '查询功能还没开通（数据库补丁未执行），可以先发邮件问。' : (m || '查询失败，请稍后再试')) + '</p>'
          return
        }
        var d = j.data || {}
        if (!d.found) { res.innerHTML = '<p class="note">没有找到这个编号。请确认编号与手机号是否与提交时一致。</p>'; return }
        res.innerHTML = '<div class="card"><h4>QUERY RESULT</h4><ul>' +
          '<li><i></i>编号：<b>' + (d.code || code) + '</b></li>' +
          '<li><i></i>岗位：<b>' + (d.roleLabel || '—') + '</b></li>' +
          '<li><i></i>状态：<b style="color:var(--cinnabar)">' + (LABEL[d.status] || d.status) + '</b></li>' +
          '<li><i></i>提交时间：' + (d.createTime ? String(d.createTime).slice(0, 10) : '—') + '</li>' +
          '</ul><p class="note" style="margin-top:12px">' + (DESC[d.status] || '') + '</p></div>'
      }).catch(function () {
        msgEl.textContent = ''
        res.innerHTML = '<p class="note">网络异常，请稍后再试。</p>'
      })
    })
    ;[codeEl, phoneEl].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click() }) })
  }

  /* ═══════════ 14b. 右下角常驻扫码按钮（二维码悬浮） ═══════════ */
  function injectQRFloat () {
    if (PAGE === 'apply') return          // 报名页本身就有大二维码，不重复
    var el = document.createElement('div')
    el.className = 'qrfloat'
    el.innerHTML =
      '<img src="./assets/wj-qrcode.png" alt="尚贤圈招贤纳士报名问卷二维码" />' +
      '<b>扫码报名</b>' +
      '<span>腾讯问卷 · 5 组 35 题</span>'
    el.addEventListener('click', function () { location.href = './apply.html' })
    document.body.appendChild(el)
  }

  /* ═══════════ 15. 备用报名表单（五步向导 + 草稿） ═══════════ */
  function initForm () {
    var form = $('#form')
    if (!form) return
    var mask = $('#formmask'), steps = $$('.step', form), bar = $$('#mBar div')
    var prev = $('#mPrev'), next = $('#mNext'), msg = $('#msg'), tip = $('#draftTip')
    var DRAFT = 'sxq_career_draft2'
    var cur = 1
    function setMsg (t, ok) { msg.textContent = t || ''; msg.className = 'msg' + (ok ? ' ok' : '') }
    function val (n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : '' }
    function chk (n) { var el = form.elements[n]; return el ? !!el.checked : false }
    function mult (n) { return $$('input[name="' + n + '"]:checked', form).map(function (x) { return x.value }) }
    function len (s) { return String(s || '').replace(/\s/g, '').length }

    function paint () {
      steps.forEach(function (s, i) { s.classList.toggle('on', i + 1 === cur) })
      bar.forEach(function (b, i) { b.classList.toggle('on', i + 1 === cur); b.classList.toggle('ok', i + 1 < cur) })
      prev.style.visibility = cur === 1 ? 'hidden' : 'visible'
      next.textContent = cur === steps.length ? '提交报名' : '下一步'
      $('#mBody').scrollTop = 0
    }
    function open (preset) {
      mask.classList.add('on'); document.body.classList.add('lock')
      paint(); setMsg(''); loadDraft()
      if (preset) { var r = form.elements['role1']; if (r) r.value = preset }
      setTimeout(function () { try { $('#f-realName').focus() } catch (e) {} }, 260)
    }
    function close () { mask.classList.remove('on'); document.body.classList.remove('lock'); saveDraft() }

    function collect () {
      var d = {}
      for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i]
        if (!el.name || el.name === 'website') continue
        if (el.type === 'checkbox') { if (!Array.isArray(d[el.name])) d[el.name] = []; if (el.checked) d[el.name].push(el.value) }
        else if (el.type !== 'submit' && el.type !== 'button') d[el.name] = el.value
      }
      return d
    }
    function saveDraft () { try { localStorage.setItem(DRAFT, JSON.stringify(collect())) } catch (e) {} }
    function loadDraft () {
      var d = null
      try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null') } catch (e) {}
      if (!d) { if (tip) tip.textContent = ''; return }
      var n = 0
      Object.keys(d).forEach(function (k) {
        var els = form.querySelectorAll('[name="' + k + '"]'); if (!els.length) return
        if (els[0].type === 'checkbox') { var a = d[k] || []; els.forEach(function (e) { e.checked = a.indexOf(e.value) >= 0 }) }
        else els[0].value = d[k] || ''
        n++
      })
      if (tip) tip.textContent = n ? '已恢复上次填写的草稿' : ''
    }
    var st = null
    form.addEventListener('input', function () { clearTimeout(st); st = setTimeout(saveDraft, 500) })
    form.addEventListener('change', function () { clearTimeout(st); st = setTimeout(saveDraft, 300) })

    function validate (s) {
      if (s === 1) { if (!val('realName')) return '请填写真实姓名'; if (!val('grade')) return '请选择年级'; if (!val('className')) return '请填写班级' }
      if (s === 2) { if (!/^\d{11}$/.test(val('phone'))) return '请填写 11 位手机号'; if (!val('guardianPhone')) return '请填写监护人联系方式'; if (!val('guardianAgreed')) return '请选择是否已获得监护人同意' }
      if (s === 3) { if (!val('role1')) return '请选择第一志愿'; if (val('role2') && val('role2') === val('role1')) return '第二志愿与第一志愿相同'; if (!val('hoursPerWeek')) return '请选择每周可投入时长'; if (!val('acceptTrial')) return '请选择是否接受两周试用期' }
      if (s === 4) { if (!val('source')) return '请选择从哪里知道这次招新' }
      if (s === 5) {
        if (len(val('whyJoin')) < 80) return '「为什么想加入」请至少 80 字（当前 ' + len(val('whyJoin')) + ' 字）'
        if (len(val('bestFit')) < 50) return '「你最适合做什么」请至少 50 字（当前 ' + len(val('bestFit')) + ' 字）'
        if (val('noOutputPlan') && len(val('noOutputPlan')) < 30) return '「一个月没产出会怎么做」如填写请至少 30 字'
        if (!chk('agreeRules')) return '请先勾选同意「要求与底线」'
        if (!chk('confirmTruth')) return '请先勾选信息真实与监护人知情确认'
      }
      return ''
    }
    next.addEventListener('click', function () {
      if (cur < steps.length) { var e1 = validate(cur); if (e1) return setMsg(e1); setMsg(''); cur++; paint(); return }
      var e2 = validate(steps.length); if (e2) return setMsg(e2)
      submit()
    })
    prev.addEventListener('click', function () { if (cur > 1) { cur--; paint(); setMsg('') } })
    $('#mClose').addEventListener('click', close)
    mask.addEventListener('click', function (e) { if (e.target === mask) close() })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mask.classList.contains('on')) close() })
    $$('[data-openform]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open() }) })

    function submit () {
      if (form.elements.website && form.elements.website.value) return
      var detail = {
        realName: val('realName'), nickname: val('nickname'), gender: val('gender'), birth: val('birth'),
        grade: val('grade'), className: val('className'), studentNo: val('studentNo'), boarding: val('boarding'),
        phone: val('phone'), qq: val('qq'), wechat: val('wechat'), email: val('email'),
        guardianPhone: val('guardianPhone'), guardianAgreed: val('guardianAgreed'),
        role1: val('role1'), role2: val('role2'), hoursPerWeek: val('hoursPerWeek'),
        slots: mult('slots'), startTime: val('startTime'), acceptTrial: val('acceptTrial'),
        hasLeaderRole: val('hasLeaderRole'), leaderDetail: val('leaderDetail'),
        tools: mult('tools'), contentExp: val('contentExp'), contentExpDetail: val('contentExpDetail'),
        portfolio: val('portfolio'), source: val('source'), devices: mult('devices'), languages: val('languages'),
        whyJoin: val('whyJoin'), bestFit: val('bestFit'), noOutputPlan: val('noOutputPlan'), suggestions: val('suggestions'),
        agreeRules: true, confirmTruth: true, at: new Date().toISOString()
      }
      next.disabled = true; setMsg('正在提交…')
      fetch(SITE.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SITE.ANON, Authorization: 'Bearer ' + SITE.ANON },
        body: JSON.stringify({ payload: {
          name: val('realName') + (val('nickname') ? '（' + val('nickname') + '）' : ''),
          grade: val('grade') + ' ' + val('className'),
          contact: val('phone'), role: val('role1'), intro: val('whyJoin'), detail: detail
        } })
      }).then(function (r) { return r.json() }).then(function (j) {
        next.disabled = false
        if (j && j.ok) {
          try { localStorage.removeItem(DRAFT) } catch (e) {}
          var code = (j.data && j.data.code) || ''
          $('#mBody').innerHTML =
            '<div class="done-box"><div class="di">✓</div><h3>报名已提交</h3>' +
            '<p>我们会在 <b>3 个工作日</b>内用你留的联系方式回复。<br>无论通过与否都会回复，不会让你干等。</p>' +
            (code ? '<div class="code-box"><b>' + code + '</b><span>你的报名编号 · 请记下来</span></div>' : '') +
            '<p style="font-size:13.5px;color:var(--muted)">在报名页底部可用编号加手机号查询当前状态。</p></div>'
          $('#mBar').style.display = 'none'; prev.style.visibility = 'hidden'
          next.textContent = '关闭'; next.onclick = close
          return
        }
        var m = (j && (j.message || j.error)) || '提交失败，请稍后再试'
        if (/Could not find|PGRST202|does not exist/i.test(m)) { setMsg(''); fallback() } else setMsg(m)
      }).catch(function () { next.disabled = false; setMsg('网络异常'); fallback() })
    }
    function fallback () {
      $('#mBody').innerHTML =
        '<div class="fall"><b>站内提交暂时不可用</b>' +
        '<p>用腾讯问卷更快：<a href="' + SITE.surveyUrl + '" target="_blank" rel="noopener" style="color:var(--cinnabar);font-weight:700">' +
        SITE.surveyUrl + '</a><br>也可以发邮件到 ' + SITE.emailUser + '@' + SITE.emailDomain + '</p></div>'
      $('#mBar').style.display = 'none'; prev.style.visibility = 'hidden'
      next.textContent = '关闭'; next.onclick = close
    }
  }

  /* ═══════════ 16. 数字看板（真数据，取不到就隐藏） ═══════════ */
  function initStats () {
    var host = $('#stats')
    if (!host) return
    // 数据源：新库的公开计数（如果补丁未执行，整块隐藏，绝不留假数字）
    fetch('https://ocgqafxaapfzraeiehqg.supabase.co/rest/v1/rpc/xq_public_stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SITE.ANON, Authorization: 'Bearer ' + SITE.ANON },
      body: '{}'
    }).then(function (r) { return r.json() }).then(function (j) {
      if (!j || !j.ok || !j.data) { host.style.display = 'none'; return }
      var d = j.data
      var items = [
        { v: d.moments, i: 'POSTS', p: '广场上同学发布过的动态条数' },
        { v: d.questions, i: 'QUESTIONS', p: '提问区累计提出的问题条数' },
        { v: d.answers, i: 'ANSWERS', p: '提问区累计收到的回答条数' },
        { v: d.found, i: 'FOUND', p: '失物招领里已标记找回的件数' },
        { v: d.market, i: 'MARKET', p: '集市上挂出过的闲置件数' },
        { v: d.users, i: 'MEMBERS', p: '使用过贤圈中心的同学人数' }
      ].filter(function (x) { return typeof x.v === 'number' && x.v > 0 })
      if (!items.length) { host.style.display = 'none'; return }
      host.innerHTML = items.map(function (x) {
        return '<div class="stat"><b data-count="' + x.v + '">0</b><i>' + x.i + '</i><p>' + x.p + '</p></div>'
      }).join('')
      initCount()
    }).catch(function () { host.style.display = 'none' })
  }

  /* ═══════════ 启动 ═══════════ */
  function boot () {
    injectBar(); injectFooter()
    renderTotem(); renderFlow(); initJobs(); initSurveyBlock(); injectQRFloat()
    initScrollHints(); injectRailDots()
    initParallax(); initReveal(); initCount(); initProgress()
    initStatusQuery(); initForm(); initStats(); initPageTransitions()
    // 打字机（只对带 data-tw 的元素）
    $$('[data-tw]').forEach(function (el) {
      var txt = el.getAttribute('data-tw')
      if (!txt) return
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { typewriter(el, txt); io.unobserve(el) } })
      }, { threshold: .5 }) : null
      if (io) io.observe(el); else typewriter(el, txt)
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
