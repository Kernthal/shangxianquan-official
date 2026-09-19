/*!
 * 尚贤圈 · Lottie 运行时（三站共用）
 * 功能：懒加载 / 视口外暂停 / 手机端降配 / 加载失败静态兜底 /
 *       可交互导航条（悬停播放对应片段、点击真实跳转）
 *
 * 用法：
 *   <div class="sxq-lottie" data-lottie="nav"
 *        data-lottie-items='[{"label":"广场","href":"#/feed","marker":0}, ...]'></div>
 *   <span class="sxq-lottie" data-lottie="loading"></span>
 */
(function () {
  'use strict'

  var LOTTIE_BASE = window.SXQ_LOTTIE_BASE || './assets/lottie/'
  var VENDOR_SRC = window.SXQ_LOTTIE_VENDOR || './assets/vendor/lottie.min.js'

  // 每个动画的默认配置（导航已改为原生 HTML 菜单，见 sxq-nav.js）
  var CFG = {
    loading: { file: 'loading.json', loop: true, autoplay: true },
    chatbot: { file: 'chatbot.json', loop: true, autoplay: true },
    marketing: { file: 'marketing.json', loop: true, autoplay: true }
  }

  var libPromise = null
  function loadLib () {
    if (window.lottie) return Promise.resolve(window.lottie)
    if (libPromise) return libPromise
    libPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script')
      s.src = VENDOR_SRC
      s.async = true
      s.onload = function () { window.lottie ? resolve(window.lottie) : reject(new Error('lottie 未就绪')) }
      s.onerror = function () { reject(new Error('lottie 加载失败')) }
      document.head.appendChild(s)
    })
    return libPromise
  }

  function isMobile () {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches
  }
  function preferReduced () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // 静态兜底：图片不存在时静默隐藏
  function fallback (el, name) {
    var img = document.createElement('img')
    img.className = 'sxq-lottie-fallback'
    img.alt = ''
    img.src = LOTTIE_BASE + 'fallback/' + name + '.png'
    img.onerror = function () { el.style.display = 'none' }
    el.innerHTML = ''
    el.appendChild(img)
    el.classList.add('sxq-lottie-static')
  }

  function initEl (el) {
    if (el.__sxqInited) return el.__sxqAnim || null
    var name = el.getAttribute('data-lottie')
    var cfg = CFG[name]
    if (!cfg) return null
    el.__sxqInited = true

    // 用户要求减少动效 → 直接静态兜底
    if (preferReduced()) {
      fallback(el, name)
      return null
    }

    var stage = document.createElement('div')
    stage.className = 'sxq-lottie-stage'
    el.appendChild(stage)

    loadLib().then(function (lottie) {
      var autoplay = el.hasAttribute('data-lottie-autoplay') || cfg.autoplay
      var anim = lottie.loadAnimation({
        container: stage,
        renderer: 'svg',
        loop: el.hasAttribute('data-lottie-loop') ? true : cfg.loop,
        autoplay: autoplay,
        path: LOTTIE_BASE + cfg.file,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true }
      })
      el.__sxqAnim = anim

      // 手机端降配：跳过子帧、限制帧率，省电
      if (isMobile()) {
        try { anim.setSubframe(false) } catch (e) {}
        el.classList.add('sxq-lottie-mobile')
      }

      anim.addEventListener('DOMLoaded', function () {
        el.classList.add('sxq-lottie-ready')
        if (name === 'nav') setupNav(el, anim)
      })
      anim.addEventListener('data_failed', function () { fallback(el, name) })
    }).catch(function () { fallback(el, name) })

    return null
  }

  function boot () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-lottie]'))

    if (!('IntersectionObserver' in window)) {
      els.forEach(initEl)
      return
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target
        if (en.isIntersecting) {
          initEl(el)
          var a = el.__sxqAnim
          if (a && el.hasAttribute('data-lottie-autoplay')) { try { a.play() } catch (e) {} }
        } else {
          var a2 = el.__sxqAnim
          if (a2) { try { a2.pause() } catch (e) {} }
        }
      })
    }, { rootMargin: '120px 0px' })

    els.forEach(function (el) { io.observe(el) })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }

  window.SXQ_LOTTIE = { init: initEl, refresh: boot }
})()
