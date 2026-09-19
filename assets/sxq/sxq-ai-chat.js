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
    faq: [
      '怎么发帖？',
      '匿名发帖安全吗？',
      '贤士卡会员有什么用？',
      '怎么下载 App？',
      '规则中心在哪里？'
    ]
  }, window.SXQ_AI || {})

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
    '<button class="sxq-ai-fab" type="button" aria-label="打开智能客服" aria-expanded="false">' +
      '<span class="sxq-ai-fab-lottie" data-lottie="chatbot" data-lottie-autoplay></span>' +
      '<span class="sxq-ai-fab-dot" aria-hidden="true"></span>' +
    '</button>' +
    '<section class="sxq-ai-panel" role="dialog" aria-modal="false" aria-label="智能客服" hidden>' +
      '<header class="sxq-ai-head">' +
        '<span class="sxq-ai-title">' + CFG.title + '</span>' +
        '<span class="sxq-ai-aigc" title="AI 生成内容">AI 生成</span>' +
        '<button class="sxq-ai-close" type="button" aria-label="关闭">×</button>' +
      '</header>' +
      '<div class="sxq-ai-log" aria-live="polite"></div>' +
      '<div class="sxq-ai-quick"></div>' +
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
  function bubble (role, text) {
    var el = document.createElement('div')
    el.className = 'sxq-ai-msg sxq-ai-msg--' + role
    el.textContent = text
    log.appendChild(el)
    log.scrollTop = log.scrollHeight
    return el
  }
  function renderQuick () {
    quick.innerHTML = ''
    CFG.faq.forEach(function (q) {
      var b = document.createElement('button')
      b.type = 'button'
      b.className = 'sxq-ai-chip'
      b.textContent = q
      b.addEventListener('click', function () { ask(q) })
      quick.appendChild(b)
    })
  }

  // ---------- 请求 ----------
  function ask (text) {
    if (busy || !text) return
    busy = true
    sendBtn.disabled = true
    bubble('user', text)
    history.push({ role: 'user', content: text })
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
          throw new Error(j.message || ('服务繁忙（' + res.status + '），请稍后再试'))
        })
      }
      var ct = res.headers.get('content-type') || ''
      if (ct.indexOf('text/event-stream') >= 0 && res.body) return stream(res.body, out)
      return res.json().then(function (j) {
        out.classList.remove('sxq-ai-typing')
        out.textContent = (j && j.reply) ? j.reply : '（暂无回复）'
        history.push({ role: 'assistant', content: out.textContent })
      })
    }).catch(function (err) {
      out.classList.remove('sxq-ai-typing')
      out.classList.add('sxq-ai-msg--error')
      out.textContent = err.message || '网络异常，请稍后再试'
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
            if (piece) { acc += piece; out.textContent = acc; log.scrollTop = log.scrollHeight }
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

  window.SXQ_AI_CHAT = { open: open, close: close, ask: ask }
})()
