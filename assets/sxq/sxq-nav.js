/*! 尚贤圈 · 通用导航菜单运行时（三站共用）
 *
 * 用法：
 *   <div class="sxq-menu" data-sxq-menu='[
 *     {"label":"产品特性","href":"#features","icon":"✦"},
 *     {"label":"实时看板","href":"#dashboard","icon":"▤","tag":"数据"},
 *     {"label":"我的","nav":"me","icon":"◍"}          // nav 用于 SPA（贤圈中心）
 *   ]'></div>
 *
 * - href：普通锚点跳转
 * - nav： 设置 data-nav，交给站点自身的委托路由（贤圈中心 app.js）
 * 渲染后自动移除 data-sxq-menu 标记，避免重复构建。
 */
(function () {
  'use strict'

  function esc (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function build (host) {
    if (host.getAttribute('data-sxq-built') === '1') return
    var raw = host.getAttribute('data-sxq-menu')
    var items = []
    try { items = JSON.parse(raw || '[]') } catch (e) { items = [] }
    if (!items.length) return

    var html = ''
    items.forEach(function (it) {
      if (it && it.group) {
        html += '<div class="sxq-menu-group">' + esc(it.group) + '</div>'
        return
      }
      if (!it || !it.label) return
      var attrs = 'class="sxq-menu-item"'
      if (it.nav) attrs += ' data-nav="' + esc(it.nav) + '"'
      if (it.href) attrs += ' href="' + esc(it.href) + '"'
      else attrs += ' href="#"'
      if (it.title) attrs += ' title="' + esc(it.title) + '"'
      html += '<a ' + attrs + '>' +
        '<span class="sxq-menu-ic">' + esc(it.icon || '·') + '</span>' +
        '<span class="sxq-menu-lb">' + esc(it.label) + '</span>' +
        (it.tag ? '<span class="sxq-menu-tag">' + esc(it.tag) + '</span>' : '') +
        '</a>'
    })

    host.innerHTML = html
    host.setAttribute('data-sxq-built', '1')

    // SPA（贤圈中心）：阻止默认跳转，让站点自身的 data-nav 委托处理
    host.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.sxq-menu-item')
      if (a && a.hasAttribute('data-nav')) e.preventDefault()
    })
  }

  function boot () {
    var hosts = document.querySelectorAll('[data-sxq-menu]')
    for (var i = 0; i < hosts.length; i++) build(hosts[i])
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()

  window.SXQ_NAV = { build: build, refresh: boot }
})()
