/* ══════════════════════════════════════════════════════════════
   尚贤圈 · 走廊（Corridor）
   ── 全部代码从零编写，未移植任何第三方项目源码
   ── 全部美术（墙面砖块、木门、地面石板、字牌、涂鸦）由 canvas 程序生成，
      不使用任何外部图片或贴图文件
   ── 3D 引擎：Three.js（MIT），本地 vendor 引入
   ══════════════════════════════════════════════════════════════ */
import * as THREE from './vendor/three.module.min.js'

/* ═══════════ 0. 板块数据（走廊两侧的六扇门） ═══════════ */
const XQ = 'https://sxcommunity.github.io/xq-center/'
const MODULES = [
  { key: 'feed', name: '广场', en: 'PLAZA', url: XQ + '#feed',
    desc: '同学们发的动态都在这。', color: '#c8401f',
    glyph: 'M3 12h18M12 3v18' },
  { key: 'market', name: '集市', en: 'MARKET', url: XQ + '#market',
    desc: '二手闲置与教材流转。', color: '#b98a2f',
    glyph: 'M4 8h16l-1.5 12h-13zM9 8V6a3 3 0 016 0v2' },
  { key: 'lost', name: '失物招领', en: 'LOST & FOUND', url: XQ + '#lost',
    desc: '丢了的、捡到的，都放这。', color: '#2f7a54',
    glyph: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2' },
  { key: 'ask', name: '提问', en: 'Q & A', url: XQ + '#ask',
    desc: '不懂就问，会有人答。', color: '#3a6dd0',
    glyph: 'M9 9a3 3 0 016 0c0 2-3 2.5-3 4.5M12 17h.01' },
  { key: 'rules', name: '规则中心', en: 'RULES', url: XQ + '#thanks',
    desc: '二十二篇约定，随时可查。', color: '#7a5c1e',
    glyph: 'M6 4h9l3 3v13H6zM8 10h8M8 14h6' },
  { key: 'thanks', name: '鸣谢墙', en: 'THANKS', url: XQ + '#thanks',
    desc: '支持过尚贤圈的人和名字。', color: '#9e3015',
    glyph: 'M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8z' }
]

/* ═══════════ 1. 确定性伪随机（保证每次生成的手绘纹理一致） ═══════════ */
function makeRng (seed) {
  let s = seed >>> 0
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ═══════════ 2. 手绘质感工具（全部 canvas 程序生成，零图片） ═══════════ */
function cv (w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return { c, x: c.getContext('2d') }
}
function paperBase (x, w, h, rng, tint) {
  x.fillStyle = tint || '#f4efe6'
  x.fillRect(0, 0, w, h)
  // 纸纹噪点
  for (let i = 0; i < w * h * 0.06; i++) {
    const px = rng() * w, py = rng() * h
    const a = 0.02 + rng() * 0.05
    x.fillStyle = 'rgba(28,26,23,' + a.toFixed(3) + ')'
    x.fillRect(px, py, 1, 1)
  }
}
/* 手抖线：把直线画成略有波动的手绘线 */
function wobblyLine (x, x1, y1, x2, y2, rng, amp) {
  const seg = Math.max(4, Math.round(Math.hypot(x2 - x1, y2 - y1) / 14))
  x.beginPath()
  x.moveTo(x1, y1)
  for (let i = 1; i <= seg; i++) {
    const t = i / seg
    const nx = x1 + (x2 - x1) * t
    const ny = y1 + (y2 - y1) * t
    const j = (rng() - 0.5) * (amp || 1.6)
    x.lineTo(nx + j, ny + j)
  }
  x.stroke()
}
/* 交叉排线（铅笔阴影） */
function hatch (x, bx, by, bw, bh, rng, density, angle, alpha) {
  x.save()
  x.beginPath(); x.rect(bx, by, bw, bh); x.clip()
  x.strokeStyle = 'rgba(28,26,23,' + (alpha || 0.16) + ')'
  x.lineWidth = 0.8
  const step = density || 5
  if (angle === 'v') {
    for (let px = bx; px < bx + bw; px += step) wobblyLine(x, px, by, px, by + bh, rng, 1.1)
  } else {
    for (let py = by; py < by + bh + bw; py += step) wobblyLine(x, bx, py, bx + bw, py - bw, rng, 1.1)
  }
  x.restore()
}

/* —— 砖墙 —— */
function makeBrickTexture () {
  const W = 512, H = 512
  const { c, x } = cv(W, H)
  const rng = makeRng(20260924)
  paperBase(x, W, H, rng, '#f6f1e7')
  const bh = 42, bw = 96
  for (let row = 0, y = -bh; y < H + bh; y += bh, row++) {
    const off = (row % 2) ? bw / 2 : 0
    for (let bx = -bw; bx < W + bw; bx += bw) {
      const px = bx + off, py = y
      x.strokeStyle = 'rgba(28,26,23,.42)'
      x.lineWidth = 1.3
      wobblyLine(x, px, py, px + bw, py, rng, 1.5)
      wobblyLine(x, px, py, px, py + bh, rng, 1.3)
      wobblyLine(x, px + bw, py, px + bw, py + bh, rng, 1.3)
      wobblyLine(x, px, py + bh, px + bw, py + bh, rng, 1.5)
      // 每块砖随机一点排线，做出手绘不均感
      if (rng() > 0.55) hatch(x, px + 3, py + 3, bw - 6, bh - 6, rng, 6, rng() > .5 ? 'v' : 'd', 0.07)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

/* —— 木门 —— */
function makeDoorTexture (color) {
  const W = 256, H = 384
  const { c, x } = cv(W, H)
  const rng = makeRng(77123)
  // 木色底
  const g = x.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#d8b483'); g.addColorStop(0.5, '#cba572'); g.addColorStop(1, '#bd9663')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  // 纵向木纹
  for (let i = 0; i < 190; i++) {
    const px = rng() * W
    x.strokeStyle = 'rgba(120,86,48,' + (0.05 + rng() * 0.14).toFixed(3) + ')'
    x.lineWidth = 0.6 + rng() * 1.3
    wobblyLine(x, px, 0, px + (rng() - .5) * 10, H, rng, 1.6)
  }
  // 门板分隔线
  x.strokeStyle = 'rgba(90,62,32,.55)'; x.lineWidth = 2
  ;[0.36, 0.72].forEach(function (r) { wobblyLine(x, 8, H * r, W - 8, H * r, rng, 2) })
  // 边框
  x.lineWidth = 3.2; x.strokeStyle = 'rgba(72,48,24,.7)'
  wobblyLine(x, 5, 5, W - 5, 5, rng, 1.6)
  wobblyLine(x, 5, 5, 5, H - 5, rng, 1.6)
  wobblyLine(x, W - 5, 5, W - 5, H - 5, rng, 1.6)
  wobblyLine(x, 5, H - 5, W - 5, H - 5, rng, 1.6)
  // 小块排线增加体积
  hatch(x, 12, 12, W - 24, H * 0.3, rng, 7, 'd', 0.05)

  // 门把手（画在贴图里，省一个 mesh）
  x.fillStyle = 'rgba(60,44,24,.9)'
  x.beginPath(); x.arc(W * 0.86, H * 0.5, 7, 0, Math.PI * 2); x.fill()
  x.strokeStyle = 'rgba(185,138,47,.9)'; x.lineWidth = 2.2
  x.beginPath(); x.arc(W * 0.86, H * 0.5, 9.5, 0, Math.PI * 2); x.stroke()

  // 门牌底色块（板块色的淡色区）
  x.save()
  x.globalAlpha = 0.16
  x.fillStyle = color
  x.fillRect(16, H * 0.09, W - 32, 46)
  x.restore()
  x.strokeStyle = 'rgba(28,26,23,.4)'; x.lineWidth = 1.4
  wobblyLine(x, 16, H * 0.09, W - 16, H * 0.09, rng, 1.4)
  wobblyLine(x, 16, H * 0.09 + 46, W - 16, H * 0.09 + 46, rng, 1.4)

  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  return t
}

/* —— 门牌文字（中文名 + 英文名 + 一句说明） —— */
function makeLabelTexture (m) {
  const W = 512, H = 256
  const { c, x } = cv(W, H)
  const rng = makeRng(m.name.length * 9973)
  paperBase(x, W, H, rng, '#faf6ee')
  // 外框手绘双线
  x.strokeStyle = 'rgba(28,26,23,.7)'; x.lineWidth = 3
  wobblyLine(x, 12, 12, W - 12, 12, rng, 2)
  wobblyLine(x, 12, 12, 12, H - 12, rng, 2)
  wobblyLine(x, W - 12, 12, W - 12, H - 12, rng, 2)
  wobblyLine(x, 12, H - 12, W - 12, H - 12, rng, 2)
  x.lineWidth = 1.2; x.strokeStyle = 'rgba(28,26,23,.3)'
  wobblyLine(x, 20, 20, W - 20, 20, rng, 1.6)
  wobblyLine(x, 20, H - 20, W - 20, H - 20, rng, 1.6)
  // 色条
  x.fillStyle = m.color; x.globalAlpha = .85
  x.fillRect(12, 12, 7, H - 24)
  x.globalAlpha = 1
  // 中文名
  x.fillStyle = '#1c1a17'
  x.font = '900 68px "PingFang SC","Microsoft YaHei",sans-serif'
  x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText(m.name, W / 2 + 6, H / 2 - 26)
  // 英文名
  x.font = '600 22px Consolas,monospace'
  x.fillStyle = 'rgba(87,80,63,.9)'
  x.fillText(m.en, W / 2 + 6, H / 2 + 26)
  // 说明
  x.font = '500 19px "PingFang SC",sans-serif'
  x.fillStyle = 'rgba(139,130,112,.95)'
  x.fillText(m.desc, W / 2 + 6, H / 2 + 62)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  return t
}

/* —— 石板地面 —— */
function makeFloorTexture () {
  const W = 512, H = 512
  const { c, x } = cv(W, H)
  const rng = makeRng(4242)
  paperBase(x, W, H, rng, '#ece5d6')
  const cell = 96
  for (let gy = 0, r = 0; gy < H; gy += cell, r++) {
    for (let gx = 0; gx < W; gx += cell) {
      const jx = (rng() - .5) * 6, jy = (rng() - .5) * 6
      x.strokeStyle = 'rgba(28,26,23,.34)'; x.lineWidth = 1.4
      wobblyLine(x, gx + jx, gy + jy, gx + cell + jx, gy + jy, rng, 1.8)
      wobblyLine(x, gx + jx, gy + jy, gx + jx, gy + cell + jy, rng, 1.8)
      if (rng() > 0.5) hatch(x, gx + 6 + jx, gy + 6 + jy, cell - 12, cell - 12, rng, 8, 'd', 0.05)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

/* —— 天花板 —— */
function makeCeilTexture () {
  const W = 256, H = 256
  const { c, x } = cv(W, H)
  const rng = makeRng(999)
  paperBase(x, W, H, rng, '#e6ded0')
  for (let i = 0; i < 90; i++) {
    x.strokeStyle = 'rgba(28,26,23,.06)'
    x.lineWidth = 0.8
    wobblyLine(x, rng() * W, 0, rng() * W, H, rng, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/* —— 涂鸦（彩蛋） —— */
function makeGraffitiTexture (text, color) {
  const W = 512, H = 256
  const { c, x } = cv(W, H)
  x.clearRect(0, 0, W, H)
  const rng = makeRng(text.length * 31)
  x.translate(W / 2, H / 2)
  x.rotate(-0.07)
  x.font = '900 84px Consolas,monospace'
  x.textAlign = 'center'; x.textBaseline = 'middle'
  // 墨点溅射
  for (let i = 0; i < 46; i++) {
    const a = rng() * Math.PI * 2, d = 60 + rng() * 170
    const r = 1 + rng() * 7
    x.fillStyle = color; x.globalAlpha = 0.5 + rng() * 0.5
    x.beginPath(); x.arc(Math.cos(a) * d, Math.sin(a) * d * 0.5, r, 0, Math.PI * 2); x.fill()
  }
  x.globalAlpha = 1
  x.fillStyle = color
  x.fillText(text, 0, 0)
  const t = new THREE.CanvasTexture(c)
  return t
}

/* ═══════════ 3. 合成音效（Web Audio，不引入任何音频文件） ═══════════ */
const Audio2 = (function () {
  let ctx = null, master = null, ambient = null, on = false
  function ensure () {
    if (ctx) return true
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      ctx = new AC()
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination)
      return true
    } catch (e) { return false }
  }
  function noiseBuffer (dur) {
    const n = Math.floor(ctx.sampleRate * dur)
    const buf = ctx.createBuffer(1, n, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n)
    return buf
  }
  function tick (f, dur, vol, type) {
    if (!on || !ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type || 'sine'; o.frequency.value = f
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.02)
  }
  function creak () {
    if (!on || !ctx) return
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.7)
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'
    bp.frequency.setValueAtTime(420, ctx.currentTime)
    bp.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.35)
    bp.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.7)
    bp.Q.value = 5
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    src.connect(bp); bp.connect(g); g.connect(master); src.start()
    tick(92, 0.34, 0.16, 'triangle')
  }
  function meow () {
    if (!on || !ctx) return
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(620, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.42)
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.44)
    o.connect(f); f.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + 0.46)
  }
  function squeak () {
    if (!on || !ctx) return
    tick(1180, 0.12, 0.1, 'square')
    setTimeout(function () { tick(1520, 0.09, 0.08, 'square') }, 90)
  }
  function startAmbient () {
    if (!ctx || ambient) return
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter()
    o.type = 'sine'; o.frequency.value = 68
    f.type = 'lowpass'; f.frequency.value = 260
    g.gain.value = 0.045
    const lfo = ctx.createOscillator(), lg = ctx.createGain()
    lfo.frequency.value = 0.07; lg.gain.value = 0.02
    lfo.connect(lg); lg.connect(g.gain); lfo.start()
    o.connect(f); f.connect(g); g.connect(master); o.start()
    ambient = { o: o, g: g, lfo: lfo }
  }
  function stopAmbient () {
    if (!ambient) return
    try { ambient.o.stop(); ambient.lfo.stop() } catch (e) {}
    ambient = null
  }
  return {
    get on () { return on },
    enable: function () {
      if (!ensure()) return false
      if (ctx.state === 'suspended') ctx.resume()
      on = true; startAmbient(); return true
    },
    disable: function () { on = false; stopAmbient() },
    tick: tick, creak: creak, meow: meow, squeak: squeak
  }
})()

/* ═══════════ 4. 设备能力评估（低端机直接走列表，不进 3D） ═══════════ */
function deviceTier () {
  const mem = navigator.deviceMemory || 0
  const cores = navigator.hardwareConcurrency || 0
  const small = Math.min(window.innerWidth, window.innerHeight) < 420
  if (mem && mem <= 2) return { ok: false, reason: '内存较小' }
  if (cores && cores <= 2) return { ok: false, reason: 'CPU 核心较少' }
  try {
    const t = document.createElement('canvas')
    if (!(t.getContext('webgl2') || t.getContext('webgl'))) return { ok: false, reason: '浏览器不支持 WebGL' }
  } catch (e) { return { ok: false, reason: '浏览器不支持 WebGL' } }
  return { ok: true, dpr: (mem && mem <= 4) || small ? 1 : Math.min(window.devicePixelRatio || 1, 1.8), small: small }
}

/* ═══════════ 5. 主场景 ═══════════ */
const $ = function (s) { return document.querySelector(s) }
const HALL_W = 7.2
const HALL_H = 4.4
const DOOR_GAP = 13
const EYE = 1.62

let renderer, scene, camera, clock
let doors = [], eggCat, eggDuck, eggGraffiti
let travelled = 0, targetTravelled = 0, speed = 0
let hovered = null, busy = false
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(0, 0)
let pointerPx = { x: 0, y: 0 }

function buildWorld () {
  const tier = deviceTier()
  const dpr = tier.dpr || 1

  renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: !tier.small, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#e9e2d4')
  scene.fog = new THREE.Fog('#e9e2d4', 26, 86)

  camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 220)
  camera.position.set(0, EYE, 3)
  camera.lookAt(0, EYE, -10)

  clock = new THREE.Clock()

  /* ── 走廊几何：地面 / 天花板 / 左右墙 / 尽头墙 ── */
  const floorTex = makeFloorTexture(); floorTex.repeat.set(2, 20)
  const ceilTex = makeCeilTexture(); ceilTex.repeat.set(2, 20)
  const brickL = makeBrickTexture(); brickL.repeat.set(4, 1.2)
  const brickR = makeBrickTexture(); brickR.repeat.set(4, 1.2)
  brickR.offset.x = 0.37

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W, 300),
    new THREE.MeshBasicMaterial({ map: floorTex })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, -140)
  scene.add(floor)

  const ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(HALL_W, 300),
    new THREE.MeshBasicMaterial({ map: ceilTex })
  )
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(0, HALL_H, -140)
  scene.add(ceil)

  const wallGeo = new THREE.PlaneGeometry(300, HALL_H)
  const wallL = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ map: brickL }))
  wallL.rotation.y = Math.PI / 2
  wallL.position.set(-HALL_W / 2, HALL_H / 2, -140)
  scene.add(wallL)

  const wallR = new THREE.Mesh(wallGeo, new THREE.MeshBasicMaterial({ map: brickR }))
  wallR.rotation.y = -Math.PI / 2
  wallR.position.set(HALL_W / 2, HALL_H / 2, -140)
  scene.add(wallR)

  /* ── 吸顶灯（手绘灯罩 + 地面光斑） ── */
  const lampGeo = new THREE.PlaneGeometry(1.5, 0.5)
  for (let i = 0; i < 26; i++) {
    const z = 2 - i * 11
    const lamp = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: '#fffdf5' }))
    lamp.rotation.x = Math.PI / 2
    lamp.position.set(0, HALL_H - 0.02, z)
    scene.add(lamp)
  }

  /* ── 六扇门（左右交替，循环复用实现无限走廊） ── */
  const doorGeo = new THREE.PlaneGeometry(2.5, 3.3)
  const labelGeo = new THREE.PlaneGeometry(2.0, 1.0)
  const lintelGeo = new THREE.BoxGeometry(0.34, 0.22, 3.0)

  MODULES.forEach(function (m, i) {
    const side = i % 2 === 0 ? -1 : 1
    const g = new THREE.Group()

    const tex = makeDoorTexture(m.color)
    const door = new THREE.Mesh(doorGeo, new THREE.MeshBasicMaterial({ map: tex }))
    door.position.set(side * (HALL_W / 2 - 0.06), 1.72, 0)
    door.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2
    // 以门轴为原点，方便"开门"绕铰链旋转
    const pivot = new THREE.Group()
    pivot.position.set(side * (HALL_W / 2 - 0.06), 1.72, -1.25)
    door.position.set(0, 0, 1.25)
    door.userData.module = m
    pivot.add(door)

    const lintel = new THREE.Mesh(lintelGeo, new THREE.MeshBasicMaterial({ color: '#b99a70' }))
    lintel.position.set(side * (HALL_W / 2 - 0.12), 3.62, 0)

    const label = new THREE.Mesh(labelGeo, new THREE.MeshBasicMaterial({ map: makeLabelTexture(m), transparent: true }))
    label.position.set(side * (HALL_W / 2 - 0.2), 4.06, 0)
    label.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2

    // 门下的地面光斑（选中时亮起来）
    const spotGeo = new THREE.PlaneGeometry(2.6, 2.6)
    const spot = new THREE.Mesh(spotGeo, new THREE.MeshBasicMaterial({
      color: m.color, transparent: true, opacity: 0
    }))
    spot.rotation.x = -Math.PI / 2
    spot.position.set(side * 1.5, 0.012, 0)

    g.add(pivot); g.add(lintel); g.add(label); g.add(spot)
    g.position.set(0, 0, -DOOR_GAP * (i + 1))
    g.userData = { module: m, side: side, pivot: pivot, door: door, spot: spot, label: label,
                   open: 0, opening: false, slot: i, baseZ: -DOOR_GAP * (i + 1) }
    scene.add(g)
    doors.push(g)
  })

  /* ── 彩蛋一：猫（蹲在墙根） ── */
  eggCat = makeCat()
  eggCat.position.set(-2.35, 0, -DOOR_GAP * 1 - 3.4)
  scene.add(eggCat)

  /* ── 彩蛋二：小黄鸭（放在窗台上） ── */
  eggDuck = makeDuck()
  eggDuck.position.set(2.55, 0.9, -DOOR_GAP * 3 - 2.2)
  scene.add(eggDuck)

  /* ── 彩蛋三：涂鸦「BUG FIXED!」 ── */
  const gt = makeGraffitiTexture('BUG FIXED!', '#1c1a17')
  eggGraffiti = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.3),
    new THREE.MeshBasicMaterial({ map: gt, transparent: true })
  )
  eggGraffiti.position.set(HALL_W / 2 - 0.05, 3.1, -DOOR_GAP * 2 - 5)
  eggGraffiti.rotation.y = -Math.PI / 2
  scene.add(eggGraffiti)

  /* ── 键盘可达的门牌清单（无障碍） ── */
  buildSeoList()
}

/* 猫：几只方块拼出来的简笔猫 */
function makeCat () {
  const g = new THREE.Group()
  const dark = new THREE.MeshBasicMaterial({ color: '#2b2b2b' })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.62), dark)
  body.position.y = 0.18; g.add(body)
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.3), dark)
  head.position.set(0, 0.47, 0.16); g.add(head)
  const earGeo = new THREE.ConeGeometry(0.075, 0.14, 4)
  const e1 = new THREE.Mesh(earGeo, dark); e1.position.set(-0.1, 0.66, 0.16); g.add(e1)
  const e2 = new THREE.Mesh(earGeo, dark); e2.position.set(0.1, 0.66, 0.16); g.add(e2)
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.075, 0.44), dark)
  tail.position.set(0, 0.2, -0.46); tail.rotation.x = -0.5; g.add(tail)
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#b98a2f' })
  const eyeGeo = new THREE.BoxGeometry(0.055, 0.055, 0.02)
  const ey1 = new THREE.Mesh(eyeGeo, eyeMat); ey1.position.set(-0.08, 0.5, 0.315); g.add(ey1)
  const ey2 = new THREE.Mesh(eyeGeo, eyeMat); ey2.position.set(0.08, 0.5, 0.315); g.add(ey2)
  g.userData = { kind: 'cat', hit: head }
  return g
}
/* 小黄鸭 */
function makeDuck () {
  const g = new THREE.Group()
  const yellow = new THREE.MeshBasicMaterial({ color: '#e8b531' })
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), yellow)
  g.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), yellow)
  head.position.set(0, 0.17, 0.08); g.add(head)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.11, 6), new THREE.MeshBasicMaterial({ color: '#d9772a' }))
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.16, 0.2); g.add(beak)
  const eyeGeo = new THREE.BoxGeometry(0.028, 0.028, 0.02)
  const em = new THREE.MeshBasicMaterial({ color: '#1c1a17' })
  const e1 = new THREE.Mesh(eyeGeo, em); e1.position.set(-0.045, 0.2, 0.15); g.add(e1)
  const e2 = new THREE.Mesh(eyeGeo, em); e2.position.set(0.045, 0.2, 0.15); g.add(e2)
  g.userData = { kind: 'duck', hit: head }
  return g
}

/* ═══════════ 6. 交互：滚动前进 / 悬停 / 点击 ═══════════ */
function setupInput () {
  const canvas = $('#gl')
  let dragging = false, lastY = 0

  window.addEventListener('wheel', function (e) {
    targetTravelled += e.deltaY * 0.016
    clampTravel()
  }, { passive: true })

  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; lastY = e.clientY
    canvas.classList.add('dragging')
  })
  window.addEventListener('pointerup', function () {
    dragging = false; canvas.classList.remove('dragging')
  })
  window.addEventListener('pointermove', function (e) {
    pointerPx.x = e.clientX; pointerPx.y = e.clientY
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    if (dragging) {
      targetTravelled += (lastY - e.clientY) * 0.045
      lastY = e.clientY
      clampTravel()
    }
  })
  canvas.addEventListener('click', function () { if (!dragging) activate(hovered) })

  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { targetTravelled += 5; clampTravel() }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { targetTravelled -= 5; clampTravel() }
    if (e.key === 'Enter' && hovered) activate(hovered)
  })

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
}
function clampTravel () {
  targetTravelled = Math.max(-1.6, targetTravelled)
}

/* 悬停检测 */
const _v = new THREE.Vector3()
function pick () {
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(pickables(), true)
  let found = null
  for (let i = 0; i < hits.length; i++) {
    let o = hits[i].object
    while (o && !o.userData) o = o.parent
    while (o && o.userData && !o.userData.module && !o.userData.kind) o = o.parent
    if (o && (o.userData.module || o.userData.kind)) { found = o; break }
  }
  return found
}
function pickables () {
  const list = doors.slice()
  if (eggCat) list.push(eggCat)
  if (eggDuck) list.push(eggDuck)
  if (eggGraffiti) list.push(eggGraffiti)
  return list
}
function activate (obj) {
  if (!obj || busy) return
  if (obj.userData.module) {
    const m = obj.userData.module
    busy = true
    Audio2.creak()
    obj.userData.opening = true
    hudDoor(true, m)
    setTimeout(function () { window.location.href = m.url }, 620)
    return
  }
  const kind = obj.userData.kind
  if (kind === 'cat') { Audio2.meow(); bounce(obj); toast('它说：别吵，我在看门。') }
  else if (kind === 'duck') { Audio2.squeak(); bounce(obj); toast('小黄鸭：早就修好了，别问了。') }
  else if (kind === 'graffiti') { Audio2.tick(760, 0.14, 0.09, 'square'); toast('BUG FIXED! —— 这是上一位同学留下的。') }
}
function bounce (obj) {
  obj.userData.hop = 1
}

/* ═══════════ 7. HUD ═══════════ */
let hoverReset = null
function hudDoor (show, m) {
  const el = $('#hudDoor')
  if (show && m) {
    el.querySelector('b').textContent = m.name
    el.querySelector('span').textContent = m.desc + ' · 点击进入'
    el.classList.add('on')
  } else el.classList.remove('on')
}
function toast (text) {
  let t = $('#toast')
  if (!t) {
    t = document.createElement('div')
    t.id = 'toast'
    t.style.cssText = 'position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:30;' +
      'background:rgba(28,26,23,.9);color:#f4efe6;font-size:13.5px;padding:11px 20px;border-radius:99px;' +
      'pointer-events:none;transition:opacity .3s ease;opacity:0;max-width:88vw;text-align:center'
    document.body.appendChild(t)
  }
  t.textContent = text
  t.style.opacity = '1'
  clearTimeout(toast._t)
  toast._t = setTimeout(function () { t.style.opacity = '0' }, 2200)
}
function buildHudDots () {
  const host = $('#hudDots')
  host.innerHTML = MODULES.map(function (m) { return '<i title="' + m.name + '"></i>' }).join('')
}
function buildSeoList () {
  $('#seoList').innerHTML = MODULES.map(function (m) {
    return '<li><a href="' + m.url + '">' + m.name + '（' + m.en + '）—— ' + m.desc + '</a></li>'
  }).join('')
}

/* ═══════════ 8. 保底列表 ═══════════ */
function showFallback (reason) {
  $('#fbSub').textContent = '走廊两侧一共六扇门，各通向一个板块。' +
    (reason ? '（检测到' + reason + '，已自动切换为列表。）' : '') +
    '这个列表和门后面完全一样，点哪一项就进哪个板块。'
  $('#fbList').innerHTML = MODULES.map(function (m, i) {
    return '<a class="fb-item" href="' + m.url + '">' +
      '<span class="fb-ic">' + glyphSvg(m, i) + '</span>' +
      '<span><b>' + m.name + '</b><span>' + m.desc + '</span></span>' +
      '<span class="fb-ar">›</span></a>'
  }).join('')
  $('#fallback').classList.add('on')
  $('#hudDots').style.display = 'none'
  $('#gl').style.display = 'none'
}
function glyphSvg (m, i) {
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="' + m.color + '" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' + m.glyph + '"/></svg>'
}

/* ═══════════ 9. 渲染循环 ═══════════ */
let fpsAcc = 0, fpsFrames = 0, fpsLowStreak = 0
function loop () {
  requestAnimationFrame(loop)
  const dt = Math.min(clock.getDelta(), 0.05)

  // 平滑推进
  travelled += (targetTravelled - travelled) * Math.min(1, dt * 6)
  camera.position.z = 3 - travelled

  // 无限走廊：把已掠过的门挪到队尾
  doors.forEach(function (g) {
    const worldZ = g.userData.baseZ + g.position.z
    if (camera.position.z - worldZ < 20) {
      g.position.z -= DOOR_GAP * doors.length
      g.userData.slot = (g.userData.slot + doors.length) % doors.length
    }
  })
  // 灯与彩蛋也循环
  scene.children.forEach(function (o) {
    if (o.isMesh && o.geometry && o.geometry.parameters &&
        o.geometry.parameters.width === 1.5 && o.geometry.parameters.height === 0.5) {
      if (camera.position.z - o.position.z < 16) o.position.z -= 11 * 26
    }
  })
  ;[eggCat, eggDuck].forEach(function (o) {
    if (o && camera.position.z - o.position.z < 14) o.position.z -= DOOR_GAP * 6
  })
  if (eggGraffiti && camera.position.z - eggGraffiti.position.z < 14) eggGraffiti.position.z -= DOOR_GAP * 6

  // 悬停
  const h = pick()
  if (h !== hovered) {
    hovered = h
    const canvas = $('#gl')
    canvas.classList.toggle('on-door', !!(h && (h.userData.module || h.userData.kind)))
    if (h && h.userData.module) {
      hudDoor(true, h.userData.module)
      Audio2.tick(660, 0.06, 0.045, 'sine')
    } else if (h && h.userData.kind) {
      hudDoor(false)
      hudDoor(true, { name: h.userData.kind === 'cat' ? '一只猫' : h.userData.kind === 'duck' ? '小黄鸭' : '涂鸦',
                      desc: '点一下试试' })
      Audio2.tick(880, 0.05, 0.04, 'sine')
    } else hudDoor(false)
    $('#hudDots') && Array.prototype.forEach.call($('#hudDots').children, function (d, i) { d.classList.remove('on') })
  }

  // 门的状态：高亮 / 开门 / 地面光斑
  doors.forEach(function (g) {
    const u = g.userData
    const isHover = hovered === g
    const targetOpacity = isHover ? 0.4 : 0
    u.spot.material.opacity += (targetOpacity - u.spot.material.opacity) * Math.min(1, dt * 8)
    if (u.opening) {
      u.open = Math.min(1, u.open + dt * 2.4)
    } else {
      u.open += (0 - u.open) * Math.min(1, dt * 4)
    }
    u.pivot.rotation.y = (u.side < 0 ? -1 : 1) * u.open * Math.PI * 0.62
    // 门在相机后面就隐藏，省性能
    g.visible = (g.position.z < camera.position.z + 6)
  })

  // 彩蛋弹跳
  ;[eggCat, eggDuck].forEach(function (o) {
    if (!o) return
    if (o.userData.baseY === undefined) o.userData.baseY = o.position.y
    if (o.userData.hop > 0) {
      o.userData.hop = Math.max(0, o.userData.hop - dt * 2.4)
      const k = Math.sin((1 - o.userData.hop) * Math.PI)
      o.position.y = o.userData.baseY + k * 0.24
      o.rotation.z = Math.sin((1 - o.userData.hop) * Math.PI * 2) * 0.16
    } else {
      o.position.y = o.userData.baseY
      o.rotation.z = 0
    }
  })

  // 相机轻微摆动（走路感）
  if (!Audio2.on) { /* noop */ }
  camera.position.y = EYE + Math.sin(travelled * 2.6) * 0.022
  camera.rotation.z = Math.sin(travelled * 1.7) * 0.006

  renderer.render(scene, camera)

  // 帧率监测：持续偏低就提供列表模式
  fpsAcc += dt; fpsFrames++
  if (fpsAcc >= 1.5) {
    const fps = fpsFrames / fpsAcc
    if (fps < 26) { fpsLowStreak++; if (fpsLowStreak >= 2) { toast('画面有点卡？点右上角「列表模式」会顺畅很多。'); fpsLowStreak = -999 } }
    else fpsLowStreak = 0
    fpsAcc = 0; fpsFrames = 0
  }
}

/* ═══════════ 10. 启动 ═══════════ */
function boot () {
  buildHudDots()

  const tier = deviceTier()
  if (!tier.ok) { finishLoading(); showFallback(tier.reason); return }

  const t0 = performance.now()
  try {
    buildWorld()
  } catch (e) {
    console.error(e)
    finishLoading(); showFallback('场景初始化失败'); return
  }
  setupInput()

  const ldBar = $('#ldBar')
  let p = 0
  const iv = setInterval(function () {
    p = Math.min(100, p + 12 + Math.random() * 20)
    ldBar.style.width = p + '%'
    if (p >= 100) { clearInterval(iv); setTimeout(finishLoading, 260) }
  }, 110)

  // 声音按钮
  const btn = $('#btnAudio')
  btn.addEventListener('click', function () {
    if (Audio2.on) { Audio2.disable(); btn.classList.remove('on'); btn.textContent = '声音 关'; btn.setAttribute('aria-pressed', 'false') }
    else if (Audio2.enable()) { btn.classList.add('on'); btn.textContent = '声音 开'; btn.setAttribute('aria-pressed', 'true'); Audio2.tick(700, 0.1, 0.07) }
    else toast('这个浏览器不支持声音合成')
  })
  // 列表模式
  $('#btnFlat').addEventListener('click', function () { showFallback('手动切换') })
  $('#fbRetry').addEventListener('click', function (e) { e.preventDefault(); location.reload() })

  loop()
}
function finishLoading () {
  $('#loader').classList.add('done')
  setTimeout(function () {
    const l = $('#loader')
    if (l && l.parentNode) l.parentNode.removeChild(l)
  }, 700)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
