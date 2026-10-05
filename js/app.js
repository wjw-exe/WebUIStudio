/* =====================================================
   WebUI Studio - 核心逻辑
   状态 / 渲染 / 拖拽 / 缩放 / 属性面板 / 图层 / 撤销重做
   ===================================================== */
"use strict";

(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 组件库定义 ---------- */
  const ICON = {
    button: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="3"/><path d="M7.5 12h9"/></svg>',
    text: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linecap="round"><path d="M6 6h12M12 6v13M9 19h6"/></svg>',
    switch: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="9" cy="12" r="2.4" fill="#5b8cff" stroke="none"/></svg>',
    input: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 12h6"/></svg>',
    slider: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linecap="round"><path d="M3 12h12"/><circle cx="18" cy="12" r="2.6" fill="#5b8cff" stroke="none"/><path d="M3 8h7M3 16h7"/></svg>',
    select: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m9 10 3 3 3-3"/></svg>',
    checkbox: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="m8 12.5 2.5 2.5L16 9"/></svg>',
    radio: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4" fill="#5b8cff" stroke="none"/></svg>',
    image: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="9.5" r="1.8"/><path d="m6 18 5-5 3 3 4-4 3 3"/></svg>',
    progress: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M3 8h18v8H3z" opacity=".3"/><path d="M3 8h9v8H3z" fill="#5b8cff" stroke="none"/></svg>',
    divider: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linecap="round"><path d="M4 12h16"/><path d="M9 8 6 12l3 4M15 8l3 4-3 4" opacity=".45"/></svg>',
    container: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.5" stroke-dasharray="3 2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
    badge: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M9 12h6"/></svg>',
    tabs: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 11h18M7 6V4.5M12 6V4.5"/></svg>',
    card: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M8 4v6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M4 20V10M9.5 20V5M15 20v-7M20.5 20V8" stroke-linecap="round"/></svg>',
    table: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M3 15h18M10 4v16"/></svg>',
    video: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m20 10 2-1.5v7L20 14" stroke-linejoin="round"/></svg>',
    date: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>',
    modal: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M4 9h16M9 3v6"/></svg>',
    custom: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><path d="m9.5 4 7 8-5 8M15.5 4l-7 8 1 3"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M8 6h13M8 12h13M8 18h13" stroke-linecap="round"/><circle cx="4.2" cy="6" r="1.4" fill="#5b8cff" stroke="none"/><circle cx="4.2" cy="12" r="1.4" fill="#5b8cff" stroke="none"/><circle cx="4.2" cy="18" r="1.4" fill="#5b8cff" stroke="none"/></svg>',
    rating: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><path d="m12 3 2.6 5.4 6 .7-4.5 4.2 1.2 5.9L12 16.4 6.7 19.2l1.2-5.9L3.4 9.1l6-.7Z"/><path d="M7 6.5l3.5-1" opacity=".45"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="10" cy="12" r="3.2"/><path d="m12.6 14.6 4 4" stroke-linecap="round"/></svg>',
    navbar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18" opacity=".5"/><circle cx="7" cy="7" r="1.1" fill="#5b8cff" stroke="none"/><path d="M12 13h6M12 16h4" stroke-linecap="round" opacity=".7"/></svg>',
    steps: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><circle cx="5" cy="12" r="2.2" fill="#5b8cff" stroke="none"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M7.4 12h3.2M14.4 12h3.2" opacity=".5"/></svg>',
    timeline: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M5 4v16" opacity=".45"/><circle cx="5" cy="7" r="2" fill="#5b8cff" stroke="none"/><circle cx="5" cy="13" r="2"/><circle cx="5" cy="19" r="2"/><path d="M9 7h10M9 13h8M9 19h11" stroke-linecap="round" opacity=".7"/></svg>',
    footer: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 16h18M9 13h6M10 19h4" opacity=".6" stroke-linecap="round"/></svg>',
    avatar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><circle cx="12" cy="9" r="3.4"/><path d="M5 19c1.2-3.2 4-4.6 7-4.6s5.8 1.4 7 4.6"/></svg>',
    carousel: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9-3 3 3 3M14 9l3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    breadcrumb: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><path d="M4 8h6l4 4-4 4H4Z"/><path d="M12 8h6l4 4-4 4h-6" opacity=".45"/></svg>',
    stat: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M4 20V10M9.5 20V5M15 20v-7M20.5 20V8" stroke-linecap="round"/><path d="m4 10 5.5-5 5.5 7 5.5-4" opacity=".5" stroke-linejoin="round"/></svg>',
    price: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M3 7h18v10H3Z" rx="3"/><text x="12" y="14.5" text-anchor="middle" font-size="9" fill="#5b8cff" stroke="none" font-weight="700">¥</text></svg>',
    sidebar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16" opacity=".4"/><path d="M12 9h7M12 12.5h7M12 16h4" stroke-linecap="round"/></svg>',
    notice: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M13 5.5V3M16 4l-1.5 1.5" opacity=".5"/></svg>',
    accordion: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M3 14h18" opacity=".45"/><path d="M8 11.5 10.5 9 13 11.5M8 16.5 10.5 14l2.5 2.5" opacity=".7"/></svg>',
    quote: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><path d="M5 5h6v6H5Z" opacity=".5"/><path d="M13 13h6v6h-6Z"/><path d="M5 14h4v5H5Z" opacity=".7"/></svg>',
    code: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m9.5 9-3 3 3 3M14.5 9l3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    qrcode: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2M20 14v3M14 20h3" stroke-linecap="round"/></svg>',
    tags: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7" stroke-linejoin="round"><path d="M12 4 21 8l-9 4-9-4Z"/><path d="m5 12-1 6 8 2 8-2-1-6" opacity=".7"/></svg>'
  };

  const TYPE_NAMES = {
    button: "按钮", text: "文字", switch: "开关", input: "输入框", slider: "滑块",
    select: "下拉框", checkbox: "复选框", radio: "单选", image: "图片",
    progress: "进度条", divider: "分割线", container: "容器", badge: "徽章",
    tabs: "标签页", card: "卡片", chart: "图表", table: "表格", video: "视频", date: "日期选择", modal: "弹窗",
    custom: "自定义 HTML",
    list: "列表", rating: "评分", search: "搜索框", navbar: "导航栏",
    steps: "步骤条", timeline: "时间线", footer: "页脚", avatar: "头像",
    carousel: "轮播图", breadcrumb: "面包屑", stat: "统计数字", price: "价格卡", sidebar: "侧边菜单", notice: "通知条",
    accordion: "手风琴", quote: "引用块", code: "代码块", qrcode: "二维码", tags: "标签组"
  };

  const DEFAULT_STYLE = () => ({
    bgColor: "#2f5cff", textColor: "#ffffff", fontSize: 15, bold: false,
    radius: 8, opacity: 1, rotate: 0, z: 1,
    borderColor: "#c9ced6", borderWidth: 1, borderStyle: "solid",
    accentColor: "#2f5cff", fillColor: "#2f5cff", trackColor: "#e4e8ee"
  });

  const DEFAULT_PROPS = {
    button: () => ({ text: "按钮" }),
    text: () => ({ text: "双击编辑文字", align: "left" }),
    switch: () => ({ label: "开关", checked: true }),
    input: () => ({ placeholder: "请输入内容…", text: "" }),
    slider: () => ({ min: 0, max: 100, value: 50 }),
    select: () => ({ options: "选项一,选项二,选项三" }),
    checkbox: () => ({ label: "复选框", checked: false }),
    radio: () => ({ label: "单选", checked: true, name: "radio" }),
    image: () => ({ src: "", fit: "cover" }),
    progress: () => ({ value: 60, max: 100 }),
    divider: () => ({ color: "#d0d5dd", thickness: 2, style2: "solid" }),
    container: () => ({ padding: 0 }),
    badge: () => ({ text: "NEW" }),
    tabs: () => ({ tabs: "标签一,标签二", active: 0 }),
    card: () => ({ title: "卡片标题", content: "卡片内容，可双击编辑文字组件，或在属性面板修改。" }),
    chart: () => ({ type: "bar", data: "45,72,60,90", labels: "一月,二月,三月,四月", colors: "" }),
    table: () => ({ rows: "标题|数量|价格\n苹果|3|15\n香蕉|5|20" }),
    video: () => ({ src: "", poster: "" }),
    date: () => ({ value: "", placeholder: "选择日期" }),
    modal: () => ({ btnText: "打开弹窗", title: "弹窗标题", content: "弹窗内容，点击关闭按钮可关闭。" }),
    custom: () => ({ html: '<div style="padding:12px;border:1px dashed #9aa0b0;border-radius:6px;font-size:13px;color:#555;">自定义 HTML 组件<br>选中后在属性面板「自定义」分组编辑原始代码</div>' }),
    list: () => ({ items: "苹果,香蕉,橙子", mark: "dot" }),
    rating: () => ({ value: 4, max: 5 }),
    search: () => ({ placeholder: "搜索关键词…", btnText: "搜索" }),
    navbar: () => ({ brand: "Logo", links: "首页,产品,关于,联系" }),
    steps: () => ({ items: "第一步,第二步,第三步", active: 1 }),
    timeline: () => ({ items: "2026-01|发布 v1.0\n2026-06|新增 20+ 组件", dotColor: "#2f5cff" }),
    footer: () => ({ text: "© 2026 WebUI Studio. All rights reserved.", links: "关于,隐私,条款" }),
    avatar: () => ({ src: "", text: "U", shape: "circle" }),
    carousel: () => ({ images: "https://picsum.photos/seed/a/800/320,https://picsum.photos/seed/b/800/320,https://picsum.photos/seed/c/800/320", interval: 3 }),
    breadcrumb: () => ({ items: "首页,产品中心,详情页" }),
    stat: () => ({ value: "12,345", label: "累计用户", prefix: "", suffix: "", icon: "user" }),
    price: () => ({ title: "专业版", price: "99", period: "/月", desc: "适合进阶用户，含全部高级功能与专属支持。", btnText: "立即订阅", featured: false }),
    sidebar: () => ({ brand: "WebUI", items: "仪表盘,数据分析,用户管理,系统设置" }),
    notice: () => ({ text: "系统将于今晚 23:00 进行维护，请提前保存数据。", tone: "info" }),
    accordion: () => ({ items: "什么是 WebUI Studio？|一款拖拽式网页 UI 设计器，支持自由布局与一键导出 HTML。\n支持哪些导出方式？|可导出独立单文件 HTML，离线也能打开使用。", active: 0 }),
    quote: () => ({ text: "设计是解决问题的过程，而非装饰。", author: "— 佚名" }),
    code: () => ({ code: "console.log('Hello WebUI Studio!');", lang: "javascript" }),
    qrcode: () => ({ text: "https://github.com/wjw-exe/WebUIStudio", size: 180 }),
    tags: () => ({ items: "设计,开发,高效", tone: "blue" })
  };

  const DEF_W = { button: 150, text: 180, switch: 90, input: 220, slider: 240, select: 180, checkbox: 140, radio: 140, image: 200, progress: 260, divider: 220, container: 320, badge: 70, tabs: 260, card: 260, chart: 360, table: 340, video: 360, date: 200, modal: 200, custom: 240, list: 220, rating: 180, search: 280, navbar: 600, steps: 380, timeline: 260, footer: 600, avatar: 56, carousel: 560, breadcrumb: 320, stat: 220, price: 240, sidebar: 240, notice: 640, accordion: 300, quote: 320, code: 380, qrcode: 180, tags: 260 };
  const DEF_H = { button: 44, text: 32, switch: 34, input: 40, slider: 34, select: 40, checkbox: 30, radio: 30, image: 140, progress: 30, divider: 24, container: 200, badge: 28, tabs: 120, card: 180, chart: 200, table: 160, video: 200, date: 40, modal: 44, custom: 120, list: 150, rating: 36, search: 40, navbar: 48, steps: 52, timeline: 170, footer: 56, avatar: 56, carousel: 220, breadcrumb: 36, stat: 88, price: 260, sidebar: 360, notice: 44, accordion: 220, quote: 88, code: 160, qrcode: 180, tags: 36 };

  /* ---------- 状态 ---------- */
  const state = {
    version: 3,
    title: "未命名页面",
    stage: { w: 1280, h: 720, bg: "#ffffff", grid: true, bp: { tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 844 } } },
    bpView: "desktop",
    pages: [],
    pageIdx: 0,
    elements: [],
    groups: [],
    css: "",
    selectedId: null,
    sel: new Set(),
    tool: "move" /* move=移动工具  paint=画笔工具 */
  };

  let history = [];
  let histIdx = -1;
  let zoom = 1;
  let snap = true;
  let bridge = null;
  let editing = false;
  let clipboardEls = null;
  let clipboardGroups = [];

  const elById = id => state.elements.find(e => e.id === id);
  const selEl = () => elById(state.selectedId);
  let uid = 1;
  const genId = () => "el_" + (uid++) + "_" + Date.now().toString(36);

  function makeEl(type, x, y) {
    const st = DEFAULT_STYLE();
    const zMax = state.elements.reduce((m, e) => Math.max(m, e.style.z || 0), 0);
    st.z = zMax + 1;
    return {
      id: genId(), type, name: "", x, y,
      w: DEF_W[type], h: DEF_H[type],
      visible: true, locked: false,
      cls: "", attrs: {}, overrideHtml: "",
      props: DEFAULT_PROPS[type](),
      style: st
    };
  }

  /* ---------- 响应式断点 ---------- */
  const BPS = ["desktop", "tablet", "mobile"];
  const BP_NAMES = { desktop: "桌面", tablet: "平板", mobile: "手机" };
  const BP_BREAK = { tabletMin: 768, tabletMax: 1023, mobileMax: 767 };
  function curBp() { return state.bpView || "desktop"; }
  function bpRect(el, bp) {
    if (bp === "desktop") return { x: el.x, y: el.y, w: el.w, h: el.h };
    const b = (el.bp && el.bp[bp]) || {};
    return {
      x: (b.x != null ? b.x : el.x), y: (b.y != null ? b.y : el.y),
      w: (b.w != null ? b.w : el.w), h: (b.h != null ? b.h : el.h)
    };
  }
  function posOf(el) { return bpRect(el, curBp()); }
  function setBpRect(el, bp, r) {
    if (bp === "desktop") { el.x = r.x; el.y = r.y; el.w = r.w; el.h = r.h; return; }
    if (!el.bp) el.bp = {};
    const b = el.bp[bp] = el.bp[bp] || {};
    b.x = r.x; b.y = r.y; b.w = r.w; b.h = r.h;
  }
  function setPos(el, r) { setBpRect(el, curBp(), r); }
  function stageSize() {
    const b = curBp() === "tablet" || curBp() === "mobile" ? (state.stage.bp || {})[curBp()] : null;
    if (b && b.w) return { w: b.w, h: b.h || Math.round(b.w * 0.75) };
    return { w: state.stage.w, h: state.stage.h };
  }
  function resetBpDefaults() {
    state.stage.bp = { tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 844 } };
  }
  function bpSize(b) {
    if (b === "desktop") return { w: state.stage.w, h: state.stage.h };
    const bp = (state.stage.bp || {})[b];
    return bp ? { w: bp.w, h: bp.h } : (b === "tablet" ? { w: 768, h: 1024 } : { w: 390, h: 844 });
  }
  function setBpSize(b, w, h) {
    if (b === "desktop") { state.stage.w = w; state.stage.h = h; return; }
    if (!state.stage.bp) state.stage.bp = {};
    state.stage.bp[b] = { w: w, h: h };
  }

  /* ---------- 历史 ---------- */
  function snapshot() {
    return JSON.parse(JSON.stringify({ title: state.title, stage: state.stage, elements: state.elements, groups: state.groups }));
  }
  function restore(snap) {
    state.title = snap.title; state.stage = snap.stage; state.elements = snap.elements;
    state.groups = snap.groups || [];
    state.selectedId = null;
  }
  function snapshotOf(i) { return JSON.parse(JSON.stringify(history[i])); }
  function pushHistory() {
    history = history.slice(0, histIdx + 1);
    history.push(snapshot());
    if (history.length > 120) history.shift();
    histIdx = history.length - 1;
    updateUndoBtns();
  }
  function undo() {
    if (histIdx <= 0) return;
    histIdx--;
    restore(snapshotOf(histIdx));
    afterHistoryChange();
  }
  function redo() {
    if (histIdx >= history.length - 1) return;
    histIdx++;
    restore(snapshotOf(histIdx));
    afterHistoryChange();
  }
  function afterHistoryChange() {
    state.selectedId = null;
    renderStage();
    renderLayers();
    renderInspector();
    updateCount();
    updateUndoBtns();
  }
  let dirtyTimer = null;
  function markDirty(push) {
    if (push) pushHistory();
    if (dirtyTimer) clearTimeout(dirtyTimer);
  }

  /* ---------- 渲染 ---------- */
  const stageEl = () => $("#stage");

  function renderStage() {
    const st = stageEl();
    const ss = stageSize();
    st.style.width = ss.w + "px";
    st.style.height = ss.h + "px";
    st.style.background = state.stage.bg;
    st.classList.toggle("grid-on", state.stage.grid);
    const eh = $("#empty-hint");
    eh.style.display = state.elements.length ? "none" : "block";
    st.querySelectorAll(".el").forEach(n => n.remove());
    state.elements.slice().sort((a, b) => (a.style.z || 0) - (b.style.z || 0)).forEach(el => {
      if (!el.visible) return;
      st.appendChild(renderEl(el));
    });
    applyStudioCss();
    renderGroupOverlays();
    syncInspectorNumbers();
  }

  /* 全局自定义 CSS + hover 样式注入（设计器实时预览） */
  function applyStudioCss() {
    let tag = document.getElementById("studio-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "studio-css";
      document.head.appendChild(tag);
    }
    let css = state.css || "";
    state.elements.forEach(el => {
      if (el.style && el.style.hoverCss) {
        css += "\n#stage .el[data-id=\"" + el.id + "\"]:hover{" + el.style.hoverCss + "}";
      }
    });
    tag.textContent = css;
  }

  function renderEl(el) {
    const d = document.createElement("div");
    d.className = "el" + (el.cls ? " " + el.cls : "");
    d.dataset.id = el.id;
    if (el.attrs) {
      Object.keys(el.attrs).forEach(k => {
        if (k && k !== "class" && k !== "style" && k !== "id" && k !== "data-id") {
          d.setAttribute(k, el.attrs[k]);
        }
      });
    }
    if (el.id === state.selectedId || state.sel.has(el.id)) d.classList.add("selected");
    if (el.locked) d.classList.add("locked");
    applyElStyle(d, el);
    let extra = "";
    if (el.style.icon && el.style.icon !== "none") {
      const ic = { star: "★", heart: "♥", check: "✓", arrow: "→", info: "ℹ", play: "▶", cart: "🛒", bell: "🔔", lock: "🔒", home: "🏠" }[el.style.icon];
      if (ic) extra = '<span class="el-icon">' + ic + '</span>';
    }
    d.innerHTML = extra + elInnerHTML(el) + handlesHTML();
    bindElEvents(d, el);
    return d;
  }

  function applyElStyle(d, el) {
    const r = posOf(el);
    d.style.left = r.x + "px";
    d.style.top = r.y + "px";
    d.style.width = r.w + "px";
    d.style.height = r.h + "px";
    d.style.opacity = el.style.opacity;
    d.style.zIndex = el.style.z;
    d.style.transform = "rotate(" + el.style.rotate + "deg)";
    d.style.fontFamily = el.style.fontFamily || "";
    const sh = { soft: "0 2px 12px rgba(0,0,0,.10)", medium: "0 4px 20px rgba(0,0,0,.18)", strong: "0 8px 30px rgba(0,0,0,.28)", glow: "0 0 18px rgba(90,140,255,.45)" }[el.style.shadow];
    d.style.boxShadow = sh || "none";
    if (el.style.inlineCss) d.style.cssText += ";" + el.style.inlineCss;
  }
  function bgc(st) {
    return st.bgGradient || st.bgColor;
  }

  function handlesHTML() {
    return '<span class="h nw"></span><span class="h n"></span><span class="h ne"></span>'
      + '<span class="h w"></span><span class="h e"></span>'
      + '<span class="h sw"></span><span class="h s"></span><span class="h se"></span>';
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* 设计器内组件内部结构（可交互预览） */
  function elInnerHTML(el) {
    const p = el.props, st = el.style;
    if (el.overrideHtml) return el.overrideHtml;   /* 用户自定义原始 HTML 覆盖内置渲染 */
    switch (el.type) {
      case "button":
        return '<button class="wuis-btn" style="background:' + bgc(st) + ';color:' + st.textColor
          + ';font-size:' + st.fontSize + 'px;font-weight:' + (st.bold ? "700" : "400")
          + ';border-radius:' + st.radius + 'px;">' + esc(p.text || "按钮") + '</button>';
      case "text": {
        const a = p.align || "left";
        return '<div class="wuis-text" style="color:' + st.textColor + ';font-size:' + st.fontSize
          + 'px;font-weight:' + (st.bold ? "700" : "400")
          + ';justify-content:' + (a === "left" ? "flex-start" : a === "center" ? "center" : "flex-end") + ';">'
          + esc(p.text || "双击编辑文字") + '</div>';
      }
      case "switch": {
        const on = p.checked ? " on" : "";
        return '<div class="wuis-switch' + on + '" data-acc="' + esc(st.accentColor) + '">'
          + '<div class="sw-track"><div class="sw-thumb"></div></div>'
          + '<span class="sw-label">' + esc(p.label || "开关") + '</span></div>';
      }
      case "input":
        return '<input class="wuis-input" type="text" placeholder="' + esc(p.placeholder || "")
          + '" value="' + esc(p.text || "") + '" style="font-size:' + st.fontSize + 'px;color:' + st.textColor
          + ';border-radius:' + st.radius + 'px;border:' + st.borderWidth + 'px solid ' + st.borderColor
          + ';background:' + st.bgColor + ';">';
      case "slider":
        return '<div class="wuis-slider"><input type="range" min="' + p.min + '" max="' + p.max + '" value="' + p.value
          + '" style="accent-color:' + st.accentColor + '"><span class="sl-val">' + p.value + '</span></div>';
      case "select": {
        const opts = String(p.options || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<select class="wuis-select" style="font-size:' + st.fontSize + 'px;color:' + st.textColor
          + ';border-radius:' + st.radius + 'px;">' + opts.map(o => '<option>' + esc(o) + '</option>').join("") + '</select>';
      }
      case "checkbox":
        return '<label class="wuis-check"><input type="checkbox"' + (p.checked ? " checked" : "")
          + ' style="accent-color:' + st.accentColor + '"><span class="ck-label">' + esc(p.label || "复选框") + '</span></label>';
      case "radio":
        return '<label class="wuis-radio"><input type="radio" name="' + esc(p.name || "radio") + '"' + (p.checked ? " checked" : "")
          + ' style="accent-color:' + st.accentColor + '"><span class="rd-label">' + esc(p.label || "单选") + '</span></label>';
      case "image": {
        const src = p.src || "";
        if (src) {
          return '<img class="wuis-img" src="' + esc(src) + '" style="border-radius:' + st.radius + 'px;object-fit:' + p.fit + ';">';
        }
        return '<div class="wuis-img" style="background:#eef1f5;display:flex;align-items:center;justify-content:center;"><span style="font-size:30px;color:#b7c2d0;">IMG</span></div>';
      }
      case "progress": {
        const pct = Math.round(clamp((p.value / Math.max(1, p.max)) * 100, 0, 100));
        return '<div class="wuis-progress"><div class="pr-track" style="background:' + st.trackColor + '">'
          + '<div class="pr-fill" style="width:' + pct + '%;background:' + st.fillColor + '"></div></div>'
          + '<span class="pr-val">' + pct + '%</span></div>';
      }
      case "divider": {
        const b = { solid: "solid", dashed: "dashed", dotted: "dotted" }[p.style2] || "solid";
        return '<div class="wuis-divider"><div style="width:100%;border-top:' + p.thickness + 'px ' + b + ' ' + esc(p.color) + ';"></div></div>';
      }
      case "container":
        return '<div class="wuis-container" style="background:' + bgc(st) + ';border:' + st.borderWidth + 'px '
          + st.borderStyle + ' ' + st.borderColor + ';border-radius:' + st.radius + 'px;"></div>';
      case "badge":
        return '<span class="wuis-badge" style="background:' + bgc(st) + ';color:' + st.textColor
          + ';font-size:' + st.fontSize + 'px;">' + esc(p.text || "NEW") + '</span>';
      case "tabs": {
        const names = String(p.tabs || "标签一,标签二").split(",").map(s => s.trim()).filter(Boolean);
        const act = Math.max(0, Math.min(names.length - 1, Number(p.active) || 0));
        return '<div class="wuis-tabs" style="border-radius:' + st.radius + 'px;">'
          + '<div class="wt-head">' + names.map((n, i) => '<span class="wt-tab' + (i === act ? " on" : "") + '">' + esc(n) + '</span>').join("")
          + '</div><div class="wt-body"><span style="color:#8a94a3;font-size:13px;">内容区域</span></div></div>';
      }
      case "card":
        return '<div class="wuis-card" style="background:' + bgc(st) + ';border-radius:' + st.radius + 'px;">'
          + '<div class="wc-title" style="color:' + st.textColor + ';font-size:' + Math.max(14, st.fontSize) + 'px;font-weight:700;">' + esc(p.title || "卡片标题") + '</div>'
          + '<div class="wc-body" style="color:' + st.textColor + ';font-size:' + st.fontSize + 'px;opacity:.8;">' + esc(p.content || "") + '</div></div>';
      case "chart": {
        const arr = String(p.data || "").split(",").map(s => Number(s.trim()) || 0);
        const mx = Math.max.apply(null, arr.concat([1]));
        return '<div class="wuis-chart" style="border-radius:' + st.radius + 'px;">'
          + '<div class="chart-bars">' + arr.map(v => '<div class="chart-col" style="height:' + Math.round((v / mx) * 100) + '%;background:' + st.accentColor + ';"></div>').join("")
          + '</div></div>';
      }
      case "table": {
        const rows = String(p.rows || "").split("\n").map(r => r.split("|").map(s => s.trim())).filter(r => r.length);
        const first = rows.shift() || [];
        return '<table class="wuis-table" style="border-radius:' + st.radius + 'px;">'
          + '<thead><tr>' + first.map(c => '<th>' + esc(c) + '</th>').join("") + '</tr></thead>'
          + '<tbody>' + rows.map(r => '<tr>' + r.map((c, i) => '<td' + (i === 0 ? ' class="td-strong"' : '') + '>' + esc(c) + '</td>').join("") + '</tr>').join("") + '</tbody></table>';
      }
      case "video": {
        const src = p.src || "";
        if (src) {
          return '<div class="wuis-video" style="border-radius:' + st.radius + 'px;"><video controls src="' + esc(src) + '" style="width:100%;height:100%;object-fit:cover;"></video></div>';
        }
        return '<div class="wuis-video" style="border-radius:' + st.radius + 'px;background:#0e1116;display:flex;align-items:center;justify-content:center;"><span style="font-size:34px;color:#5a6472;">▶</span></div>';
      }
      case "date":
        return '<input class="wuis-input wuis-date" type="text" placeholder="' + esc(p.placeholder || "选择日期") + '" value="' + esc(p.value || "") + '" style="font-size:' + st.fontSize + 'px;color:' + st.textColor + ';border-radius:' + st.radius + 'px;">';
      case "modal":
        return '<div class="wuis-modal">'
          + '<button class="wuis-btn" style="background:' + bgc(st) + ';color:' + st.textColor + ';font-size:' + st.fontSize + 'px;border-radius:' + st.radius + 'px;">' + esc(p.btnText || "打开弹窗") + '</button>'
          + '<div class="modal-mask" style="display:none;"><div class="modal-box"><b>' + esc(p.title || "弹窗标题") + '</b><span>' + esc(p.content || "") + '</span><button class="modal-close">关闭</button></div></div></div>';
      case "custom":
        return p.html || "";
      case "list": {
        const items = String(p.items || "").split(",").map(s => s.trim()).filter(Boolean);
        const m = { dot: "•", num: "1", check: "✓" }[p.mark] || "•";
        return '<div class="wuis-list" style="border-radius:' + st.radius + 'px;background:' + bgc(st) + ';">'
          + '<ul class="wl-ul">' + items.map((it, i) => '<li>' + (m === "num" ? '<span class="wl-num">' + (i + 1) + '</span>' : '<span class="wl-mark">' + m + '</span>')
          + '<span style="color:' + st.textColor + ';font-size:' + st.fontSize + 'px;">' + esc(it) + '</span></li>').join("")
          + '</ul></div>';
      }
      case "rating": {
        const mx = Math.max(1, Math.min(10, Number(p.max) || 5));
        const val = Math.max(0, Math.min(mx, Number(p.value) || 0));
        let stars = "";
        for (let i = 1; i <= mx; i++) {
          stars += '<span class="wr-star' + (i <= val ? " on" : "") + '" data-v="' + i + '" style="font-size:' + st.fontSize + 'px;">★</span>';
        }
        return '<div class="wuis-rating" data-val="' + val + '" style="color:' + st.accentColor + ';">'
          + stars + '<span class="wr-val" style="color:' + st.textColor + ';font-size:' + Math.max(11, st.fontSize - 3) + 'px;">' + val + '/' + mx + '</span></div>';
      }
      case "search":
        return '<div class="wuis-search" style="border-radius:' + st.radius + 'px;background:' + bgc(st) + ';">'
          + '<svg viewBox="0 0 24 24" class="ws-ic" width="15" height="15" fill="none" stroke="' + esc(st.borderColor) + '" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.6-4.6" stroke-linecap="round"/></svg>'
          + '<input type="text" class="ws-input" placeholder="' + esc(p.placeholder || "搜索关键词…") + '" style="font-size:' + st.fontSize + 'px;color:' + st.textColor + ';">'
          + '<button class="ws-btn" style="background:' + st.accentColor + ';color:#fff;font-size:' + Math.max(12, st.fontSize - 2) + 'px;border-radius:' + Math.max(2, st.radius - 3) + 'px;">' + esc(p.btnText || "搜索") + '</button></div>';
      case "navbar": {
        const links = String(p.links || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<div class="wuis-navbar" style="background:' + bgc(st) + ';border-radius:' + st.radius + 'px;">'
          + '<div class="wn-brand" style="color:' + st.textColor + ';font-size:' + Math.max(13, st.fontSize) + 'px;font-weight:700;">' + esc(p.brand || "Logo") + '</div>'
          + '<div class="wn-links">' + links.map((l, i) => '<a style="color:' + (i === 0 ? st.accentColor : st.textColor) + ';font-size:' + st.fontSize + 'px;">' + esc(l) + '</a>').join("") + '</div>'
          + '<div class="wn-cta" style="background:' + st.accentColor + ';border-radius:' + Math.max(2, st.radius - 3) + 'px;color:#fff;">按钮</div></div>';
      }
      case "steps": {
        const items = String(p.items || "").split(",").map(s => s.trim()).filter(Boolean);
        const active = Math.max(1, Math.min(items.length, parseInt(p.active, 10) || 1));
        return '<div class="wuis-steps" style="color:' + st.textColor + ';">'
          + items.map((t, i) => {
            const done = i + 1 < active, cur = i + 1 === active;
            return '<div class="ws-step" style="flex:' + (i < items.length - 1 ? 1 : "none") + ';">'
              + '<div class="ws-sline"><span class="ws-sdot" style="background:' + (done || cur ? st.accentColor : bgc(st)) + ';border-color:' + st.accentColor + ';">' + (done ? "✓" : (cur ? '<b style="color:#fff;">' + (i + 1) + '</b>' : i + 1)) + '</span>'
              + (i < items.length - 1 ? '<span class="ws-sbar" style="background:' + (done ? st.accentColor : st.borderColor) + ';"></span>' : '')
              + '</div><span class="ws-stlabel" style="color:' + (cur ? st.accentColor : st.textColor) + ';font-size:' + st.fontSize + 'px;">' + esc(t) + '</span></div>';
          }).join("")
          + '</div>';
      }
      case "timeline": {
        const rows = String(p.items || "").split("\n").map(s => s.trim()).filter(Boolean).map(s => {
          const i = s.indexOf("|");
          return i > -1 ? { t: s.slice(0, i).trim(), d: s.slice(i + 1).trim() } : { t: s, d: "" };
        });
        return '<div class="wuis-timeline" style="color:' + st.textColor + ';font-size:' + st.fontSize + 'px;">'
          + rows.map(r => '<div class="wt-item"><div class="wt-line"><span class="wt-dot" style="background:' + p.dotColor + ';"></span></div><div class="wt-body"><span class="wt-time">' + esc(r.t) + '</span>' + (r.d ? '<span class="wt-desc" style="opacity:.65;">' + esc(r.d) + '</span>' : '') + '</div></div>').join("")
          + '</div>';
      }
      case "footer": {
        const links = String(p.links || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<div class="wuis-footer" style="background:' + bgc(st) + ';border-top:1px solid ' + st.borderColor + ';border-radius:' + st.radius + 'px;">'
          + '<span style="color:' + st.textColor + ';font-size:' + st.fontSize + 'px;">' + esc(p.text || "") + '</span>'
          + (links.length ? '<span class="wf-links">' + links.map(l => '<a style="color:' + st.accentColor + ';font-size:' + Math.max(11, st.fontSize - 2) + 'px;">' + esc(l) + '</a>').join("") + '</span>' : '')
          + '</div>';
      }
      case "avatar": {
        const size = Math.max(16, parseInt(st.width, 10) || 56);
        const shape = p.shape === "square" ? Math.max(4, st.radius) + "px" : "50%";
        const inner = p.src
          ? '<img src="' + esc(p.src) + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
          : '<span style="font-size:' + Math.round(size * 0.42) + 'px;font-weight:600;">' + esc(p.text || "U") + '</span>';
        return '<div class="wuis-avatar" style="width:' + size + 'px;height:' + size + 'px;border-radius:' + shape + ';background:' + st.accentColor + ';color:#fff;">' + inner + '</div>';
      }
      case "carousel": {
        const imgs = String(p.images || "").split(",").map(s => s.trim()).filter(Boolean);
        const slide = imgs[0]
          ? '<div class="wc-slide"><img src="' + esc(imgs[0]) + '" alt=""></div>'
          : '<div class="wc-slide" style="background:#eef1f5;display:flex;align-items:center;justify-content:center;"><span style="font-size:26px;color:#b7c2d0;">IMG</span></div>';
        return '<div class="wuis-carousel" style="border-radius:' + st.radius + 'px;">' + slide
          + '<div class="wc-dots">' + imgs.map((_, i) => '<span class="wc-dot' + (i === 0 ? " on" : "") + '" data-i="' + i + '"></span>').join("") + '</div></div>';
      }
      case "breadcrumb": {
        const items = String(p.items || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<div class="wuis-crumb" style="font-size:' + st.fontSize + 'px;">'
          + items.map((it, i) => i < items.length - 1
            ? '<span class="wcr-item" style="color:' + st.textColor + ';">' + esc(it) + '</span><span class="wcr-sep" style="color:' + st.accentColor + ';opacity:.75;">/</span>'
            : '<span class="wcr-item" style="color:' + st.accentColor + ';font-weight:600;">' + esc(it) + '</span>').join("")
          + '</div>';
      }
      case "stat": {
        const icons = {
          user: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.6-6 8-6s6.8 2 8 6"/></svg>',
          star: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.1L12 16.9 6.4 20l1.3-6.1L3 9.6l6.3-.7Z"/></svg>',
          cart: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.6 11h10.2L21 7H6"/></svg>',
          heart: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.3-7-9.5A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.5C19 15.7 12 20 12 20Z"/></svg>',
          arrow: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h14M13 6l6 6-6 6"/></svg>',
          check: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 5 5 9-10"/></svg>'
        };
        const ic = icons[p.icon] || "";
        const raw = String(p.value || "0");
        const num = /^-?\d+(\.\d+)?$/.test(raw.replace(/,/g, "")) ? Number(raw.replace(/,/g, "")) : null;
        const fmt = num != null ? num.toLocaleString("zh-CN", { maximumFractionDigits: 1 }) : raw;
        return '<div class="wuis-stat" style="background:' + bgc(st) + ';border-radius:' + st.radius + 'px;">'
          + '<div class="wst-top"><span class="wst-ic" style="color:' + st.accentColor + ';background:' + st.accentColor + '1f;">' + ic + '</span>'
          + '<span class="wst-label" style="color:' + st.textColor + ';font-size:' + Math.max(11, st.fontSize - 3) + 'px;">' + esc(p.label || "") + '</span></div>'
          + '<div class="wst-val" style="color:' + st.accentColor + ';font-size:' + Math.max(20, st.fontSize + 8) + 'px;font-weight:700;">' + esc(p.prefix || "") + fmt + esc(p.suffix || "") + '</div></div>';
      }
      case "price": {
        const featured = p.featured ? " wpr-feat" : "";
        return '<div class="wuis-price' + featured + '" style="background:' + bgc(st) + ';border-radius:' + st.radius + 'px;border:1.5px solid ' + (p.featured ? st.accentColor : st.borderColor) + ';">'
          + '<div class="wpr-title" style="color:' + st.textColor + ';font-size:' + st.fontSize + 'px;">' + esc(p.title || "专业版") + '</div>'
          + '<div class="wpr-price"><span class="wpr-sym" style="color:' + st.accentColor + ';">¥</span><span class="wpr-num" style="color:' + st.textColor + ';font-size:' + Math.max(24, st.fontSize + 14) + 'px;">' + esc(p.price || "0") + '</span><span class="wpr-period" style="color:' + st.textColor + ';font-size:' + Math.max(11, st.fontSize - 4) + 'px;opacity:.6;">' + esc(p.period || "") + '</span></div>'
          + '<div class="wpr-desc" style="color:' + st.textColor + ';font-size:' + Math.max(11, st.fontSize - 3) + 'px;opacity:.7;">' + esc(p.desc || "") + '</div>'
          + '<button class="wpr-btn" style="background:' + st.accentColor + ';border-radius:' + Math.max(3, st.radius - 3) + 'px;">' + esc(p.btnText || "立即订阅") + '</button></div>';
      }
      case "sidebar": {
        const items = String(p.items || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<div class="wuis-sidebar" style="background:' + bgc(st) + ';border-radius:' + st.radius + 'px;">'
          + '<div class="wsb-brand" style="color:' + st.textColor + ';font-size:' + Math.max(13, st.fontSize) + 'px;font-weight:700;">' + esc(p.brand || "WebUI") + '</div>'
          + '<div class="wsb-menu">' + items.map((it, i) => '<div class="wsb-item' + (i === 0 ? " on" : "") + '" style="color:' + (i === 0 ? st.accentColor : st.textColor) + ';font-size:' + st.fontSize + 'px;border-radius:' + Math.max(2, st.radius - 4) + 'px;background:' + (i === 0 ? st.accentColor + "14" : "transparent") + ';">' + esc(it) + '</div>').join("") + '</div></div>';
      }
      case "notice": {
        const toneMap = {
          info: { bg: "#e8f1ff", fg: "#1f6bff", label: "信息" },
          success: { bg: "#e6f9ef", fg: "#12a05c", label: "成功" },
          warn: { bg: "#fff5e0", fg: "#c77a00", label: "提醒" },
          danger: { bg: "#ffecec", fg: "#d93a3a", label: "警告" }
        };
        const t = toneMap[p.tone] || toneMap.info;
        return '<div class="wuis-notice" style="background:' + t.bg + ';border-left:3px solid ' + t.fg + ';border-radius:' + st.radius + 'px;">'
          + '<span class="wnt-label" style="background:' + t.fg + ';">' + t.label + '</span>'
          + '<span class="wnt-text" style="color:' + t.fg + ';font-size:' + st.fontSize + 'px;">' + esc(p.text || "") + '</span></div>';
      }
      case "accordion": {
        const rows = String(p.items || "").split("\n").map(s => s.trim()).filter(Boolean).map(s => {
          const i = s.indexOf("|");
          return i > -1 ? { t: s.slice(0, i).trim(), d: s.slice(i + 1).trim() } : { t: s, d: "" };
        });
        const act = Math.max(0, Math.min(rows.length - 1, Number(p.active) || 0));
        const col = st.accentColor || "#2f5cff";
        return '<div class="wuis-accordion" style="border-radius:' + st.radius + 'px;border:1px solid ' + st.borderColor + ';font-size:' + st.fontSize + 'px;">'
          + rows.map((r, i) => '<div class="wacc-item' + (i === act ? " open" : "") + '" data-open="' + (i === act ? "1" : "0") + '">'
            + '<div class="wacc-head" style="color:' + (i === act ? col : st.textColor) + ';"><span>' + esc(r.t) + '</span><span class="wacc-arrow">' + (i === act ? "−" : "+") + '</span></div>'
            + '<div class="wacc-body" style="' + (i === act ? "" : "display:none;") + '">' + esc(r.d || "") + '</div></div>').join("")
          + '</div>';
      }
      case "quote": {
        return '<div class="wuis-quote" style="border-left:4px solid ' + st.accentColor + ';background:' + bgc(st) + ';border-radius:0 ' + st.radius + 'px ' + st.radius + 'px 0;color:' + st.textColor + ';font-size:' + st.fontSize + 'px;">'
          + '<div class="wq-mark" style="color:' + st.accentColor + ';">“</div>'
          + '<div class="wq-text">' + esc(p.text || "") + '</div>'
          + (p.author ? '<div class="wq-author" style="opacity:.65;">' + esc(p.author) + '</div>' : '') + '</div>';
      }
      case "code": {
        return '<div class="wuis-code" style="border-radius:' + st.radius + 'px;font-size:' + Math.max(11, st.fontSize - 2) + 'px;">'
          + '<div class="wc-head"><span class="wc-dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></span><span class="wc-lang">' + esc(p.lang || "") + '</span></div>'
          + '<pre class="wc-pre"><code>' + esc(p.code || "") + '</code></pre></div>';
      }
      case "qrcode": {
        const qs = Math.max(48, Math.min(320, Number(p.size) || 180));
        const tgt = encodeURIComponent(p.text || "https://example.com");
        const url = "https://api.qrserver.com/v1/create-qr-code/?size=" + Math.round(qs * 2) + "x" + Math.round(qs * 2) + "&data=" + tgt;
        return '<div class="wuis-qrcode" style="width:' + qs + 'px;height:' + qs + 'px;border-radius:' + Math.max(4, st.radius) + 'px;border:1px solid ' + st.borderColor + ';">'
          + '<img src="' + url + '" alt="二维码" style="width:100%;height:100%;object-fit:contain;">'
          + '<span class="wqr-cap" style="color:' + st.textColor + ';font-size:' + Math.max(9, st.fontSize - 5) + 'px;">' + esc(p.text || "") + '</span></div>';
      }
      case "tags": {
        const items = String(p.items || "").split(",").map(s => s.trim()).filter(Boolean);
        const tones = {
          blue: { bg: "#e8f1ff", fg: "#1f6bff" }, green: { bg: "#e6f9ef", fg: "#12a05c" },
          orange: { bg: "#fff5e0", fg: "#c77a00" }, red: { bg: "#ffecec", fg: "#d93a3a" }, gray: { bg: "#f1f3f6", fg: "#5b6472" }
        };
        const t = tones[p.tone] || tones.blue;
        return '<div class="wuis-tags" style="font-size:' + st.fontSize + 'px;">'
          + items.map(x => '<span class="wtg-item" style="background:' + t.bg + ';color:' + t.fg + ';border-radius:' + Math.max(2, Math.round(st.radius / 2)) + 'px;">' + esc(x) + '</span>').join("")
          + '</div>';
      }
    }
    return "";
  }

  /* ---------- 元素交互绑定 ---------- */
  function bindElEvents(d, el) {
    $$(".wuis-switch, .wuis-slider input, .wuis-check input, .wuis-radio input, .wuis-select", d).forEach(c => {
      c.addEventListener("mousedown", e => e.stopPropagation());
    });
    const sw = d.querySelector(".wuis-switch");
    if (sw) sw.addEventListener("click", e => {
      e.stopPropagation();
      if (el.locked) return;
      el.props.checked = !el.props.checked;
      sw.classList.toggle("on", el.props.checked);
      markDirty(false);
      selectEl(el.id);
    });
    const range = d.querySelector(".wuis-slider input");
    if (range) range.addEventListener("input", e => {
      el.props.value = parseInt(e.target.value, 10);
      const v = d.querySelector(".sl-val");
      if (v) v.textContent = el.props.value;
      markDirty(false);
    });
    const ck = d.querySelector(".wuis-check input");
    if (ck) ck.addEventListener("change", e => {
      el.props.checked = e.target.checked;
      markDirty(false);
      selectEl(el.id);
    });
    const rd = d.querySelector(".wuis-radio input");
    if (rd) rd.addEventListener("change", e => {
      el.props.checked = e.target.checked;
      markDirty(false);
      selectEl(el.id);
    });
    const selBox = d.querySelector(".wuis-select");
    if (selBox) selBox.addEventListener("change", e => {
      el.props.value = e.target.value;
      markDirty(false);
      selectEl(el.id);
    });
    const inp = d.querySelector(".wuis-input");
    if (inp) {
      inp.addEventListener("mousedown", e => { if (el.id === state.selectedId) e.stopPropagation(); });
      inp.addEventListener("input", e => {
        el.props.text = e.target.value;
        markDirty(false);
      });
    }

    const rt = d.querySelector(".wuis-rating");
    if (rt) {
      rt.querySelectorAll(".wr-star").forEach(s => {
        s.addEventListener("mousedown", e => e.stopPropagation());
        s.addEventListener("click", e => {
          if (el.locked) return;
          e.stopPropagation();
          el.props.value = Number(s.dataset.v);
          rt.dataset.val = el.props.value;
          rt.querySelectorAll(".wr-star").forEach(x => x.classList.toggle("on", Number(x.dataset.v) <= el.props.value));
          const v = rt.querySelector(".wr-val");
          if (v) v.textContent = el.props.value + "/" + el.props.max;
          markDirty(true);
          selectEl(el.id);
        });
      });
    }
    const ws = d.querySelector(".wuis-search");
    if (ws) {
      const wsi = ws.querySelector(".ws-input");
      if (wsi) wsi.addEventListener("mousedown", e => { if (el.id === state.selectedId) e.stopPropagation(); });
    }
    const carousel = d.querySelector(".wuis-carousel");
    if (carousel) {
      carousel.querySelectorAll(".wc-dot").forEach(dot => {
        dot.addEventListener("mousedown", e => e.stopPropagation());
        dot.addEventListener("click", e => {
          if (el.locked) return;
          e.stopPropagation();
          const i = Number(dot.dataset.i);
          const imgs = String(el.props.images || "").split(",").map(s => s.trim()).filter(Boolean);
          const slide = carousel.querySelector(".wc-slide");
          if (slide && imgs[i]) {
            const img = slide.querySelector("img");
            if (img) img.src = imgs[i];
          }
          carousel.querySelectorAll(".wc-dot").forEach(x => x.classList.toggle("on", x === dot));
          markDirty(false);
          selectEl(el.id);
        });
      });
    }

    const t = d.querySelector(".wuis-text");
    if (t) t.addEventListener("dblclick", e => {
      e.stopPropagation();
      startTextEdit(d, el, t);
    });

    const acc = d.querySelector(".wuis-accordion");
    if (acc) {
      acc.querySelectorAll(".wacc-head").forEach(h => {
        h.addEventListener("mousedown", e => e.stopPropagation());
        h.addEventListener("click", e => {
          if (el.locked) return;
          e.stopPropagation();
          const item = h.closest(".wacc-item");
          const isOpen = item.classList.contains("open");
          acc.querySelectorAll(".wacc-item").forEach(x => {
            x.classList.remove("open");
            const b = x.querySelector(".wacc-body");
            if (b) b.style.display = "none";
            const ar = x.querySelector(".wacc-arrow");
            if (ar) ar.textContent = "+";
          });
          if (!isOpen) {
            item.classList.add("open");
            const b = item.querySelector(".wacc-body");
            if (b) b.style.display = "";
            const ar = item.querySelector(".wacc-arrow");
            if (ar) ar.textContent = "−";
          }
          markDirty(false);
          selectEl(el.id);
        });
      });
    }

    const mbtn = d.querySelector(".wuis-modal .wuis-btn");
    if (mbtn) mbtn.addEventListener("click", e => {
      e.stopPropagation();
      const mask = d.querySelector(".modal-mask");
      if (mask) mask.style.display = "flex";
      selectEl(el.id);
    });
    const mclose = d.querySelector(".modal-close");
    if (mclose) mclose.addEventListener("click", e => {
      e.stopPropagation();
      const mask = d.querySelector(".modal-mask");
      if (mask) mask.style.display = "none";
    });
    const mmask = d.querySelector(".modal-mask");
    if (mmask) mmask.addEventListener("click", e => {
      if (e.target === mmask) mmask.style.display = "none";
    });

    d.addEventListener("mousedown", e => {
      if (editing) return;
      if (e.target.classList.contains("h")) return;
      selectEl(el.id, e.ctrlKey || e.metaKey || e.shiftKey);
      if (state.tool === "paint") return;   /* 画笔模式：只选中，不拖动 */
      if (el.locked) return;
      startDrag(e, d, el);
    });
    $$(".h", d).forEach(h => {
      h.addEventListener("mousedown", e => {
        e.stopPropagation();
        e.preventDefault();
        if (state.tool === "paint") return;  /* 画笔模式禁用缩放手柄 */
        if (el.locked) return;
        selectEl(el.id);
        startResize(e, d, el, h.classList[1]);
      });
    });
    d.addEventListener("contextmenu", e => {
      e.preventDefault();
      e.stopPropagation();
      selectEl(el.id);
      showCtxMenu(e.clientX, e.clientY);
    });
  }

  /* ---------- 文字编辑 ---------- */
  function startTextEdit(d, el, t) {
    editing = true;
    t.classList.add("editing");
    t.contentEditable = "true";
    t.focus();
    const sel = window.getSelection();
    sel.selectAllChildren(t);
    const done = () => {
      t.contentEditable = "false";
      t.classList.remove("editing");
      editing = false;
      el.props.text = t.innerText;
      markDirty(true);
      renderInspector();
    };
    t.addEventListener("blur", done, { once: true });
    t.addEventListener("keydown", e => {
      if (e.key === "Escape") t.blur();
    });
  }

  /* ---------- 拖动 / 缩放 ---------- */
  let dragState = null;

  function startDrag(e, d, el) {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = stageEl().getBoundingClientRect();
    const r = posOf(el);
    dragState = {
      mode: "move", el, startX: e.clientX, startY: e.clientY,
      ox: r.x, oy: r.y, stageRect: rect, moved: false
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  }

  function startResize(e, d, el, dir) {
    const rect = stageEl().getBoundingClientRect();
    const r = posOf(el);
    dragState = {
      mode: "resize", el, dir, startX: e.clientX, startY: e.clientY,
      ox: r.x, oy: r.y, ow: r.w, oh: r.h, stageRect: rect
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  }

  function onDragMove(e) {
    if (!dragState) return;
    const ds = dragState;
    const rect = ds.stageRect;
    let dx = (e.clientX - ds.startX) / zoom;
    let dy = (e.clientY - ds.startY) / zoom;
    const d = document.querySelector('.el[data-id="' + ds.el.id + '"]');
    if (ds.mode === "move") {
      if (Math.abs(e.clientX - ds.startX) + Math.abs(e.clientY - ds.startY) > 2) ds.moved = true;
      let nx = ds.ox + dx, ny = ds.oy + dy;
      if (snap) { nx = Math.round(nx / 4) * 4; ny = Math.round(ny / 4) * 4; }
      nx = Math.round(nx); ny = Math.round(ny);
      const r = posOf(ds.el);
      setPos(ds.el, { x: nx, y: ny, w: r.w, h: r.h });
      if (d) { d.style.left = nx + "px"; d.style.top = ny + "px"; }
    } else {
      const dir = ds.dir;
      let x = ds.ox, y = ds.oy, w = ds.ow, h = ds.oh;
      if (dir.indexOf("e") >= 0) w = ds.ow + dx;
      if (dir.indexOf("s") >= 0) h = ds.oh + dy;
      if (dir.indexOf("w") >= 0) { w = ds.ow - dx; x = ds.ox + dx; }
      if (dir.indexOf("n") >= 0) { h = ds.oh - dy; y = ds.oy + dy; }
      if (w < 12) { x -= 12 - w; w = 12; }
      if (h < 12) { y -= 12 - h; h = 12; }
      w = Math.round(w); h = Math.round(h); x = Math.round(x); y = Math.round(y);
      setPos(ds.el, { x, y, w, h });
      if (d) { d.style.left = x + "px"; d.style.top = y + "px"; d.style.width = w + "px"; d.style.height = h + "px"; }
    }
    syncInspectorNumbers();
    updateCoord();
  }

  function onDragEnd() {
    if (!dragState) return;
    const d = document.querySelector('.el[data-id="' + dragState.el.id + '"]');
    if (d) d.classList.remove("dragging");
    const moved = dragState.moved || dragState.mode === "resize";
    dragState = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
    if (moved) pushHistory();
    updateCount();
  }

  /* ---------- 选中 ---------- */
  function selectEl(id, additive) {
    if (additive) {
      if (state.sel.has(id)) {
        state.sel.delete(id);
        if (state.selectedId === id) state.selectedId = state.sel.size ? state.sel.values().next().value : null;
      } else {
        state.sel.add(id);
        state.selectedId = id;
      }
      refreshSelection(); renderInspector(); renderLayers(); updateSelInfo();
      return;
    }
    state.sel.clear();
    if (state.selectedId === id) { refreshSelection(); return; }
    state.selectedId = id;
    state.sel.add(id);
    refreshSelection();
    renderInspector();
    renderLayers();
    updateSelInfo();
  }
  function refreshSelection() {
    $$("#stage .el").forEach(n => {
      n.classList.toggle("selected", n.dataset.id === state.selectedId || state.sel.has(n.dataset.id));
    });
  }
  function selList() {
    if (state.sel.size) return state.elements.filter(e => state.sel.has(e.id));
    const s = selEl(); return s ? [s] : [];
  }

  /* ---------- 属性面板 ---------- */
  function renderInspector() {
    const ip = $("#inspector");
    const el = selEl();
    if (!el) {
      ip.innerHTML = '<div class="no-sel"><b>未选中元素</b><br>从左侧组件库拖入组件<br>或点击组件添加到画布</div>';
      return;
    }
    ip.innerHTML = buildInspector(el);
    bindInspector(el);
    updateInspectorValues(el);
  }

  function buildInspector(el) {
    const p = el.props, st = el.style;
    const t = TYPE_NAMES[el.type];
    let h = "";
    h += '<div class="ip-head"><div class="ih-thumb">' + (ICON[el.type] || "") + '</div>'
      + '<div><div class="ih-name">' + t + '</div><div class="ih-type">' + el.id + '</div></div></div>';
    h += '<div class="prop"><label>名称</label><input type="text" data-c="name" placeholder="自定义名称，显示在图层列表"></div>';

    h += '<div class="ip-group"><div class="ip-title foldable">位置与尺寸</div>';
    h += '<div class="prop"><label>断点</label><div class="seg" data-bpseg="1">'
      + BPS.map(b => '<button class="seg-btn' + (curBp() === b ? " on" : "") + '" data-bp="' + b + '">' + BP_NAMES[b] + '</button>').join("")
      + '</div></div>';
    h += '<div class="prop"><label>X</label><input type="number" data-bp="x" min="0" max="9999"></div>';
    h += '<div class="prop"><label>Y</label><input type="number" data-bp="y" min="0" max="9999"></div>';
    h += '<div class="prop"><label>宽度</label><input type="number" data-bp="w" min="12" max="9999"></div>';
    h += '<div class="prop"><label>高度</label><input type="number" data-bp="h" min="12" max="9999"></div>';
    h += '<div class="prop"><label></label><div class="btn-row">'
      + '<button class="btn-mini primary" data-icmd="top">置于顶层</button>'
      + '<button class="btn-mini primary" data-icmd="bottom">置于底层</button></div></div>';
    h += '<div class="prop"><label></label><div class="btn-row">'
      + '<button class="btn-mini" data-icmd="duplicate">复制</button>'
      + '<button class="btn-mini" data-icmd="delete" style="color:#e5484d;">删除</button></div></div>';
    h += '</div>';

    h += '<div class="ip-group"><div class="ip-title">内容</div>';
    h += contentRows(el);
    h += '</div>';

    h += '<div class="ip-group"><div class="ip-title foldable">外观</div>';
    h += colorRow("背景色", "bgColor", st.bgColor);
    h += gradRow(st.bgGradient, st.bgColor);
    h += colorRow("文字色", "textColor", st.textColor);
    h += numRow("字号", "fontSize", st.fontSize, 8, 200);
    h += '<div class="prop"><label>粗体</label><input type="checkbox" class="chk" data-s="bold"></div>';
    h += numRow("圆角", "radius", st.radius, 0, 200);
    h += numRow("旋转", "rotate", st.rotate, -360, 360);
    h += rangeRow("不透明度", "opacity", Math.round(st.opacity * 100), 5, 100);
    h += numRow("层级 z", "z", st.z, -9999, 9999);
    h += colorRow("边框色", "borderColor", st.borderColor);
    h += numRow("边框宽", "borderWidth", st.borderWidth, 0, 20);
    h += '<div class="prop"><label>阴影</label><select data-s="shadow">'
      + opt("none", "无", st.shadow) + opt("soft", "柔和", st.shadow) + opt("medium", "中等", st.shadow) + opt("strong", "强烈", st.shadow) + opt("glow", "光晕", st.shadow) + '</select></div>';
    h += '<div class="prop"><label>字体</label><select data-s="fontFamily">'
      + opt("", "默认", st.fontFamily) + opt("'Microsoft YaHei', sans-serif", "微软雅黑", st.fontFamily)
      + opt("'SimSun', serif", "宋体", st.fontFamily) + opt("'Segoe UI', sans-serif", "Segoe UI", st.fontFamily)
      + opt("Georgia, serif", "Georgia", st.fontFamily) + opt("'Courier New', monospace", "等宽", st.fontFamily) + '</select></div>';
    h += '<div class="prop"><label>图标</label><select data-s="icon">'
      + opt("none", "无", st.icon)
      + iconOpt("star", "★ 星标", st.icon) + iconOpt("heart", "♥ 爱心", st.icon) + iconOpt("check", "✓ 对勾", st.icon)
      + iconOpt("arrow", "→ 箭头", st.icon) + iconOpt("info", "ℹ 信息", st.icon) + iconOpt("play", "▶ 播放", st.icon)
      + iconOpt("cart", "购物车", st.icon) + iconOpt("bell", "铃铛", st.icon) + iconOpt("lock", "锁定", st.icon) + iconOpt("home", "主页", st.icon) + '</select></div>';
    h += '</div>';

    h += '<div class="ip-group"><div class="ip-title foldable">自定义</div>';
    h += '<div class="prop"><label>Class</label><input type="text" data-c="cls" placeholder="my-class other-class"></div>';
    h += '<div class="prop"><label>内联样式</label><textarea rows="3" data-c="inlineCss" placeholder="padding:8px;margin:4px;cursor:pointer;"></textarea></div>';
    h += '<div class="prop"><label>悬停样式</label><textarea rows="3" data-c="hoverCss" placeholder="鼠标悬停时的额外样式，如：&#10;background:#1a45cc;transform:scale(1.05);"></textarea></div>';
    h += '<div class="prop"><label>HTML 属性</label><textarea rows="3" data-c="attrs" placeholder="每行一个：&#10;data-idx=1&#10;data-role=hero"></textarea></div>';
    h += '<div class="prop"><label>覆盖 HTML</label><textarea rows="5" data-c="overrideHtml" placeholder="留空使用内置渲染；填写后替换组件内部 HTML（支持任意标签）"></textarea></div>';
    if (el.type === "custom") {
      h += '<div class="prop"><label>自定义 HTML</label><textarea rows="8" data-p="html" placeholder="在此编写组件原始 HTML"></textarea></div>';
    }
    h += '<div class="prop block"><label>CSS 预览</label><textarea class="css-preview" rows="4" readonly spellcheck="false" data-c="cssPreview"></textarea></div>';
    h += '<div class="prop"><label></label><button class="btn-mini" data-icmd="copycss">复制样式代码</button></div>';
    h += '<div class="prop"><label></label><span class="ip-hint">class / 属性 / 内联样式 / 悬停样式 / 覆盖 HTML 均会在导出 HTML 时保留；悬停样式自动生成 :hover 规则。</span></div>';
    h += '</div>';

    h += '<div class="ip-group"><div class="ip-title foldable">交互</div>';
    if (el.type === "switch" || el.type === "checkbox" || el.type === "radio" || el.type === "slider" || el.type === "progress") {
      h += colorRow("强调色", "accentColor", st.accentColor);
    }
    if (el.type === "progress") h += colorRow("轨道色", "trackColor", st.trackColor) + colorRow("进度色", "fillColor", st.fillColor);
    h += '<div class="prop"><label>点击动作</label><select data-i="clickAction">'
      + opt("none", "无", p.clickAction || "none") + opt("link", "打开链接", p.clickAction || "none")
      + opt("page", "跳转页面", p.clickAction || "none") + opt("modal", "打开弹窗", p.clickAction || "none")
      + opt("toggle", "切换显示", p.clickAction || "none") + '</select></div>';
    h += '<div class="prop" id="row-clickTarget"><label>目标</label><input type="text" data-i="clickTarget" placeholder="链接 URL / 页面名 / 弹窗组件 ID"></div>';
    h += '<div class="prop"><label>显示动画</label><select data-i="showAnim">'
      + opt("none", "无", p.showAnim || "none") + opt("fade", "淡入", p.showAnim || "none")
      + opt("pop", "弹入", p.showAnim || "none") + opt("slide", "滑入", p.showAnim || "none")
      + opt("flip", "翻转", p.showAnim || "none") + opt("zoom", "缩放", p.showAnim || "none") + '</select></div>';
    h += '<div class="prop"><label>动画时长</label><input type="number" data-i="animDur" min="0.1" max="5" step="0.1"></div>';
    h += '<div class="prop"><label>锁定</label><input type="checkbox" class="chk" data-l="locked"></div>';
    h += '</div>';

    return h;
  }

  function contentRows(el) {
    const p = el.props;
    let h = "";
    switch (el.type) {
      case "button":
      case "badge":
        h += textRow("文字", "text", p.text);
        break;
      case "text":
        h += '<div class="prop"><label>文字</label><textarea data-p="text">' + esc(p.text) + '</textarea></div>';
        h += '<div class="prop"><label>对齐</label><select data-p="align">'
          + opt("left", "左对齐", p.align) + opt("center", "居中", p.align) + opt("right", "右对齐", p.align) + '</select></div>';
        break;
      case "switch":
        h += textRow("标签", "label", p.label);
        h += '<div class="prop"><label>开启</label><input type="checkbox" class="chk" data-p="checked"></div>';
        break;
      case "input":
        h += textRow("占位文字", "placeholder", p.placeholder);
        h += textRow("默认值", "text", p.text);
        break;
      case "slider":
        h += numRowP("最小值", "min", p.min, 0, 100000) + numRowP("最大值", "max", p.max, 1, 100000) + numRowP("当前值", "value", p.value, 0, 100000);
        break;
      case "select":
        h += textRow("选项", "options", p.options);
        break;
      case "checkbox":
        h += textRow("标签", "label", p.label);
        h += '<div class="prop"><label>勾选</label><input type="checkbox" class="chk" data-p="checked"></div>';
        break;
      case "radio":
        h += textRow("标签", "label", p.label);
        h += textRow("组名 name", "name", p.name);
        h += '<div class="prop"><label>选中</label><input type="checkbox" class="chk" data-p="checked"></div>';
        break;
      case "image":
        h += '<div class="prop"><label>图片</label><button class="btn-mini primary" data-icmd="pickimg">选择本地图片</button></div>';
        h += textRow("URL / 路径", "src", p.src);
        h += '<div class="prop"><label>裁切</label><select data-p="fit">'
          + opt("cover", "铺满裁切", p.fit) + opt("contain", "完整显示", p.fit) + opt("fill", "拉伸", p.fit) + '</select></div>';
        break;
      case "progress":
        h += numRowP("当前值", "value", p.value, 0, 100000) + numRowP("最大值", "max", p.max, 1, 100000);
        break;
      case "divider":
        h += colorRowP("颜色", "color", p.color);
        h += numRowP("粗细", "thickness", p.thickness, 1, 20);
        h += '<div class="prop"><label>样式</label><select data-p="style2">'
          + opt("solid", "实线", p.style2) + opt("dashed", "虚线", p.style2) + opt("dotted", "点线", p.style2) + '</select></div>';
        break;
      case "tabs":
        h += textRow("标签（逗号分隔）", "tabs", p.tabs);
        h += numRowP("默认激活", "active", p.active, 0, 100);
        break;
      case "card":
        h += textRow("标题", "title", p.title);
        h += textAreaRow("内容", "content", p.content);
        break;
      case "chart":
        h += '<div class="prop"><label>类型</label><select data-p="type">'
          + opt("bar", "柱状图", p.type) + opt("line", "折线图", p.type) + opt("pie", "环形图", p.type) + '</select></div>';
        h += textRow("数据（逗号分隔）", "data", p.data);
        h += textRow("标签（逗号分隔）", "labels", p.labels);
        h += textRow("颜色（逗号分隔，留空自动）", "colors", p.colors);
        break;
      case "table":
        h += textAreaRow("表格数据", "rows", p.rows);
        break;
      case "video":
        h += textRow("视频 URL", "src", p.src);
        h += textRow("封面图", "poster", p.poster);
        break;
      case "date":
        h += textRow("占位文字", "placeholder", p.placeholder);
        h += textRow("默认日期", "value", p.value);
        break;
      case "modal":
        h += textRow("按钮文字", "btnText", p.btnText);
        h += textRow("弹窗标题", "title", p.title);
        h += textAreaRow("弹窗内容", "content", p.content);
        break;
      case "custom":
        h += textAreaRow("自定义 HTML", "html", p.html);
        break;
      case "list":
        h += textAreaRow("列表项（逗号分隔）", "items", p.items);
        h += '<div class="prop"><label>项目符号</label><select data-p="mark">'
          + opt("dot", "圆点", p.mark) + opt("num", "数字", p.mark) + opt("check", "对勾", p.mark) + '</select></div>';
        break;
      case "rating":
        h += numRowP("评分值", "value", p.value, 0, 10);
        h += numRowP("最大星级", "max", p.max, 1, 10);
        break;
      case "search":
        h += textRow("占位文字", "placeholder", p.placeholder);
        h += textRow("按钮文字", "btnText", p.btnText);
        break;
      case "navbar":
        h += textRow("品牌名", "brand", p.brand);
        h += textRow("链接（逗号分隔）", "links", p.links);
        break;
      case "steps":
        h += textRow("步骤（逗号分隔）", "items", p.items);
        h += numRowP("当前步骤", "active", p.active, 1, 100);
        break;
      case "timeline":
        h += textAreaRow("时间线（每行：时间|描述）", "items", p.items);
        h += colorRowP("节点颜色", "dotColor", p.dotColor);
        break;
      case "footer":
        h += textRow("页脚文字", "text", p.text);
        h += textRow("链接（逗号分隔）", "links", p.links);
        break;
      case "avatar":
        h += textRow("图片 URL（留空用文字）", "src", p.src);
        h += textRow("文字", "text", p.text);
        h += '<div class="prop"><label>形状</label><select data-p="shape">'
          + opt("circle", "圆形", p.shape) + opt("square", "圆角方形", p.shape) + '</select></div>';
        break;
      case "carousel":
        h += textRow("图片 URL（逗号分隔）", "images", p.images);
        h += numRowP("自动轮播间隔（秒，0 关闭）", "interval", p.interval, 0, 30);
        break;
      case "breadcrumb":
        h += textRow("层级（逗号分隔，末项高亮）", "items", p.items);
        break;
      case "stat":
        h += textRow("数值", "value", p.value);
        h += textRow("标签", "label", p.label);
        h += textRow("前缀（如 ¥）", "prefix", p.prefix);
        h += textRow("后缀（如 %）", "suffix", p.suffix);
        h += '<div class="prop"><label>图标</label><select data-p="icon">'
          + opt("none", "无", p.icon) + opt("user", "用户", p.icon) + opt("star", "星标", p.icon)
          + opt("cart", "购物车", p.icon) + opt("heart", "心形", p.icon) + opt("arrow", "箭头", p.icon) + opt("check", "对勾", p.icon)
          + '</select></div>';
        break;
      case "price":
        h += textRow("套餐名", "title", p.title);
        h += textRow("价格", "price", p.price);
        h += textRow("周期（如 /月）", "period", p.period);
        h += textAreaRow("说明", "desc", p.desc);
        h += textRow("按钮文字", "btnText", p.btnText);
        h += '<div class="prop"><label>突出推荐</label><input type="checkbox" data-p="featured" ' + (p.featured ? "checked" : "") + '></div>';
        break;
      case "sidebar":
        h += textRow("品牌名", "brand", p.brand);
        h += textAreaRow("菜单项（逗号分隔）", "items", p.items);
        break;
      case "notice":
        h += textAreaRow("通知文字", "text", p.text);
        h += '<div class="prop"><label>色调</label><select data-p="tone">'
          + opt("info", "信息", p.tone) + opt("success", "成功", p.tone) + opt("warn", "提醒", p.tone) + opt("danger", "警告", p.tone)
          + '</select></div>';
        break;
      case "accordion":
        h += textAreaRow("条目（每行：标题|内容）", "items", p.items);
        h += numRowP("默认展开项", "active", p.active, 0, 100);
        break;
      case "quote":
        h += textAreaRow("引用内容", "text", p.text);
        h += textRow("来源", "author", p.author);
        break;
      case "code":
        h += textAreaRow("代码内容", "code", p.code);
        h += textRow("语言标签", "lang", p.lang);
        break;
      case "qrcode":
        h += textRow("二维码内容", "text", p.text);
        h += numRowP("尺寸（px）", "size", p.size, 48, 320);
        break;
      case "tags":
        h += textRow("标签（逗号分隔）", "items", p.items);
        h += '<div class="prop"><label>色调</label><select data-p="tone">'
          + opt("blue", "蓝", p.tone) + opt("green", "绿", p.tone) + opt("orange", "橙", p.tone) + opt("red", "红", p.tone) + opt("gray", "灰", p.tone)
          + '</select></div>';
        break;
    }
    return h;
  }

  function textAreaRow(label, key, val) {
    return '<div class="prop"><label>' + label + '</label><textarea rows="4" data-p="' + key + '"></textarea></div>';
  }

  function numRow(label, key, val, min, max) {
    return '<div class="prop"><label>' + label + '</label><input type="number" data-s="' + key + '" min="' + min + '" max="' + max + '"></div>';
  }
  function numRowP(label, key, val, min, max) {
    return '<div class="prop"><label>' + label + '</label><input type="number" data-p="' + key + '"'
      + (min != null ? ' min="' + min + '"' : "") + (max != null ? ' max="' + max + '"' : "") + '></div>';
  }
  function textRow(label, key, val) {
    return '<div class="prop"><label>' + label + '</label><input type="text" data-p="' + key + '"></div>';
  }
  function colorRow(label, key, val) {
    return '<div class="prop"><label>' + label + '</label><input type="color" data-s="' + key + '"><input type="text" class="hex" data-s="' + key + '-hex"></div>'
      + swatchRow(key, "s");
  }
  function colorRowP(label, key, val) {
    return '<div class="prop"><label>' + label + '</label><input type="color" data-p="' + key + '"><input type="text" class="hex" data-p="' + key + '-hex"></div>'
      + swatchRow(key, "p");
  }
  function swatchRow(key, kind) {
    const SWATCHES = ["#2f5cff", "#0b1f66", "#7c3aed", "#db2777", "#e11d48", "#f97316", "#f59e0b", "#10b981", "#059669", "#0ea5e9", "#64748b", "#1e293b"];
    return '<div class="swatches" data-swatch-kind="' + kind + '" data-swatch="' + key + '">'
      + SWATCHES.map(c => '<span class="swatch" data-c="' + c + '" style="background:' + c + ';"></span>').join("")
      + '</div>';
  }
  function rangeRow(label, key, val, min, max) {
    return '<div class="prop"><label>' + label + '</label><input type="range" data-s="' + key + '" min="' + min + '" max="' + max + '"><span class="range-val"></span></div>';
  }
  function gradRow(val, base) {
    const preset = [
      ["", "无渐变"], ["linear-gradient(135deg,#667eea,#764ba2)", "紫蓝"],
      ["linear-gradient(135deg,#f093fb,#f5576c)", "粉红"], ["linear-gradient(135deg,#4facfe,#00f2fe)", "天蓝"],
      ["linear-gradient(135deg,#43e97b,#38f9d7)", "翠绿"], ["linear-gradient(135deg,#fa709a,#fee140)", "橙粉"],
      ["linear-gradient(135deg,#30cfd0,#330867)", "深蓝青"], ["linear-gradient(135deg,#a8edea,#fed6e3)", "浅粉青"]
    ];
    return '<div class="prop"><label>渐变</label><div class="grad-chips">'
      + preset.map(g => '<span class="grad-chip' + (val === g[0] ? " on" : "") + '" data-grad="' + esc(g[0]) + '" title="' + g[1] + '" style="background:' + (g[0] || (base || "#e4e8ee")) + ';"></span>').join("")
      + '</div></div>';
  }
  function iconOpt(v, t, cur) {
    return '<option value="' + v + '"' + (cur === v ? " selected" : "") + '>' + t + '</option>';
  }
  function opt(v, t, cur) {
    return '<option value="' + v + '"' + (cur === v ? " selected" : "") + '>' + t + '</option>';
  }

  function bindInspector(el) {
    const ip = $("#inspector");
    ip.querySelectorAll(".ip-title.foldable").forEach(t => {
      t.addEventListener("click", () => {
        t.parentElement.classList.toggle("folded");
      });
    });
    ip.querySelectorAll("[data-bpseg] .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.bpView = btn.dataset.bp;
        renderStage();
        refreshSelection();
        renderInspector();
        renderLayers();
        updateSelInfo();
        updateCoord();
      });
    });
    ip.querySelectorAll("input[type=number][data-bp]").forEach(inp => {
      inp.addEventListener("change", () => {
        const v = clamp(parseFloat(inp.value) || 0, parseFloat(inp.min || -1e9), parseFloat(inp.max || 1e9));
        const r = posOf(el);
        const next = { x: r.x, y: r.y, w: r.w, h: r.h };
        next[inp.dataset.bp] = v;
        setPos(el, next);
        renderStage();
        renderElementOnly(el);
        updateCoord();
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=number][data-s]").forEach(inp => {
      inp.addEventListener("change", () => {
        const key = inp.dataset.s;
        el.style[key] = clamp(parseFloat(inp.value) || 0, parseFloat(inp.min || -1e9), parseFloat(inp.max || 1e9));
        applyStyleToDom(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=number][data-p]").forEach(inp => {
      inp.addEventListener("change", () => {
        el.props[inp.dataset.p] = clamp(parseFloat(inp.value) || 0, parseFloat(inp.min || -1e9), parseFloat(inp.max || 1e9));
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=text][data-p]").forEach(inp => {
      inp.addEventListener("change", () => {
        el.props[inp.dataset.p] = inp.value;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("textarea[data-p]").forEach(ta => {
      ta.addEventListener("change", () => {
        el.props[ta.dataset.p] = ta.value;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("select[data-p]").forEach(sel => {
      sel.addEventListener("change", () => {
        el.props[sel.dataset.p] = sel.value;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=checkbox][data-s]").forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.dataset.s === "bold") el.style.bold = cb.checked;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=checkbox][data-p]").forEach(cb => {
      cb.addEventListener("change", () => {
        el.props[cb.dataset.p] = cb.checked;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=checkbox][data-l]").forEach(cb => {
      cb.addEventListener("change", () => {
        el.locked = cb.checked;
        renderStage();
        renderLayers();
        markDirty(true);
      });
    });
    ip.querySelectorAll("input[type=color][data-s]").forEach(c => {
      c.addEventListener("input", () => {
        el.style[c.dataset.s] = c.value;
        const hex = ip.querySelector('input[data-s="' + c.dataset.s + '-hex"]');
        if (hex) hex.value = c.value;
        renderElementOnly(el);
        markDirty(false);
      });
    });
    ip.querySelectorAll("input[type=color][data-p]").forEach(c => {
      c.addEventListener("input", () => {
        el.props[c.dataset.p] = c.value;
        const hex = ip.querySelector('input[data-p="' + c.dataset.p + '-hex"]');
        if (hex) hex.value = c.value;
        renderElementOnly(el);
        markDirty(false);
      });
    });
    ip.querySelectorAll("input[type=text].hex").forEach(inp => {
      inp.addEventListener("change", () => {
        let v = inp.value;
        if (/^#?[0-9a-fA-F]{6}$/.test(v)) v = v[0] === "#" ? v : "#" + v;
        if (inp.dataset.s) el.style[inp.dataset.s.replace("-hex", "")] = v;
        if (inp.dataset.p) el.props[inp.dataset.p.replace("-hex", "")] = v;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("[data-swatch]").forEach(w => {
      const kind = w.dataset.swatchKind, key = w.dataset.swatch;
      w.querySelectorAll(".swatch").forEach(s => {
        s.addEventListener("click", () => {
          const color = s.dataset.c;
          if (kind === "s") {
            el.style[key] = color;
            const c = ip.querySelector('input[type=color][data-s="' + key + '"]');
            if (c) c.value = color;
            const hex = ip.querySelector('input[data-s="' + key + '-hex"]');
            if (hex) hex.value = color;
            applyStyleToDom(el);
          } else {
            el.props[key] = color;
            const c = ip.querySelector('input[type=color][data-p="' + key + '"]');
            if (c) c.value = color;
            const hex = ip.querySelector('input[data-p="' + key + '-hex"]');
            if (hex) hex.value = color;
            renderElementOnly(el);
          }
          markDirty(true);
        });
      });
    });
    ip.querySelectorAll("input[type=range][data-s]").forEach(r => {
      r.addEventListener("input", () => {
        const key = r.dataset.s;
        el.style[key] = parseFloat(r.value) / 100;
        const v = ip.querySelector(".range-val");
        if (v) v.textContent = r.value + "%";
        applyStyleToDom(el);
      });
      r.addEventListener("change", () => { markDirty(true); });
    });
    ip.querySelectorAll("[data-i]").forEach(c => {
      c.addEventListener("change", () => {
        el.props[c.dataset.i] = c.type === "number" ? (parseFloat(c.value) || 0) : c.value;
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("[data-grad]").forEach(g => {
      g.addEventListener("click", () => {
        el.style.bgGradient = g.dataset.grad;
        renderInspector();
        renderElementOnly(el);
        markDirty(true);
      });
    });
    ip.querySelectorAll("[data-c]").forEach(c => {
      c.addEventListener("change", () => {
        const key = c.dataset.c;
        if (key === "name") el.name = c.value;
        else if (key === "cls") el.cls = c.value.trim();
        else if (key === "inlineCss") el.style.inlineCss = c.value;
        else if (key === "hoverCss") el.style.hoverCss = c.value;
        else if (key === "attrs") {
          const attrs = {};
          String(c.value || "").split("\n").forEach(line => {
            line = line.trim();
            if (!line) return;
            const eq = line.indexOf("=");
            if (eq > 0) attrs[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
            else attrs[line] = "";
          });
          el.attrs = attrs;
        }
        else if (key === "overrideHtml") el.overrideHtml = c.value;
        renderElementOnly(el);
        if (key === "hoverCss") applyStudioCss();
        renderInspector();
        markDirty(true);
      });
    });
    ip.querySelectorAll("[data-icmd]").forEach(b => {
      b.addEventListener("click", () => {
        const cmd = b.dataset.icmd;
        if (cmd === "duplicate") duplicate();
        else if (cmd === "delete") delSelected();
        else if (cmd === "top") zTop();
        else if (cmd === "bottom") zBottom();
        else if (cmd === "pickimg") pickImage(el);
        else if (cmd === "copycss") {
          const ta = ip.querySelector('[data-c="cssPreview"]');
          if (ta) {
            ta.select();
            try { document.execCommand("copy"); toast("样式代码已复制"); }
            catch (e) { toast("复制失败，请手动选择复制"); }
          }
        }
      });
    });
  }

  function updateInspectorValues(el) {
    const ip = $("#inspector");
    const r = posOf(el);
    ip.querySelectorAll("input[type=number][data-bp]").forEach(inp => { inp.value = r[inp.dataset.bp]; });
    ip.querySelectorAll("input[type=number][data-s]").forEach(inp => { inp.value = el.style[inp.dataset.s]; });
    ip.querySelectorAll("input[type=number][data-p]").forEach(inp => { inp.value = el.props[inp.dataset.p]; });
    ip.querySelectorAll("input[type=text][data-p]").forEach(inp => { inp.value = el.props[inp.dataset.p] || ""; });
    ip.querySelectorAll("textarea[data-p]").forEach(ta => { ta.value = el.props[ta.dataset.p] || ""; });
    ip.querySelectorAll("[data-c]").forEach(c => {
      if (c.dataset.c === "name") c.value = el.name || "";
      else if (c.dataset.c === "cls") c.value = el.cls || "";
      else if (c.dataset.c === "inlineCss") c.value = el.style.inlineCss || "";
      else if (c.dataset.c === "hoverCss") c.value = el.style.hoverCss || "";
      else if (c.dataset.c === "attrs") {
        c.value = Object.keys(el.attrs || {}).map(k => k + "=" + el.attrs[k]).join("\n");
      }
      else if (c.dataset.c === "overrideHtml") c.value = el.overrideHtml || "";
      else if (c.dataset.c === "cssPreview") {
        const st = el.style || {};
        let css = "left:" + el.x + "px; top:" + el.y + "px;\n"
          + "width:" + el.w + "px; height:" + el.h + "px;\n"
          + "opacity:" + (st.opacity || 1) + "; z-index:" + (st.z || 1) + ";\n"
          + "transform:rotate(" + (st.rotate || 0) + "deg);";
        if (st.inlineCss) css += "\n" + st.inlineCss;
        if (st.hoverCss) css += "\n:hover {\n  " + st.hoverCss + "\n}";
        c.value = css;
      }
    });
    ip.querySelectorAll("select[data-p]").forEach(s => { s.value = el.props[s.dataset.p]; });
    ip.querySelectorAll("input[type=checkbox][data-s]").forEach(cb => {
      if (cb.dataset.s === "bold") cb.checked = !!el.style.bold;
    });
    ip.querySelectorAll("input[type=checkbox][data-p]").forEach(cb => { cb.checked = !!el.props[cb.dataset.p]; });
    ip.querySelectorAll("input[type=checkbox][data-l]").forEach(cb => { cb.checked = !!el.locked; });
    ip.querySelectorAll("input[type=color][data-s]").forEach(c => { c.value = el.style[c.dataset.s] || "#000000"; });
    ip.querySelectorAll("input[type=color][data-p]").forEach(c => { c.value = el.props[c.dataset.p] || "#000000"; });
    ip.querySelectorAll("input[type=text].hex").forEach(inp => {
      if (inp.dataset.s) inp.value = el.style[inp.dataset.s.replace("-hex", "")] || "";
      if (inp.dataset.p) inp.value = el.props[inp.dataset.p.replace("-hex", "")] || "";
    });
    ip.querySelectorAll("input[type=range][data-s]").forEach(r => {
      const v = Math.round(el.style[r.dataset.s] * 100);
      r.value = v;
      const val = ip.querySelector(".range-val");
      if (val) val.textContent = v + "%";
    });
  }

  function syncInspectorNumbers() {
    const ip = $("#inspector");
    const el = selEl();
    if (!el) return;
    const r = posOf(el);
    ip.querySelectorAll("input[type=number][data-bp]").forEach(inp => {
      if (document.activeElement !== inp) inp.value = r[inp.dataset.bp];
    });
    ip.querySelectorAll("input[type=number][data-s]").forEach(inp => {
      if (document.activeElement !== inp) inp.value = el.style[inp.dataset.s];
    });
    ip.querySelectorAll("input[type=number][data-p]").forEach(inp => {
      if (document.activeElement !== inp) inp.value = el.props[inp.dataset.p];
    });
    ip.querySelectorAll("input[type=range][data-s]").forEach(r => {
      if (document.activeElement !== r) r.value = Math.round(el.style[r.dataset.s] * 100);
    });
  }

  function renderElementOnly(el) {
    const old = document.querySelector('.el[data-id="' + el.id + '"]');
    if (!old) return;
    const d = renderEl(el);
    old.replaceWith(d);
  }
  function applyStyleToDom(el) {
    const d = document.querySelector('.el[data-id="' + el.id + '"]');
    if (d) applyElStyle(d, el);
  }

  /* ---------- 组合 ---------- */
  function canGroup() {
    return selList().length >= 2;
  }
  function groupOf(id) {
    return state.groups.find(g => g.ids.includes(id));
  }
  function groupSel() {
    const list = selList(); if (list.length < 2) return;
    const ids = list.map(e => e.id);
    const gid = "grp_" + (uid++) + "_" + Date.now().toString(36);
    state.groups.push({ id: gid, name: "组合 " + (state.groups.length + 1), ids });
    renderStage(); renderLayers(); pushHistory();
    toast("已组合 " + ids.length + " 个元素");
  }
  function ungroup(gid) {
    state.groups = state.groups.filter(g => g.id !== gid);
    renderStage(); renderLayers(); pushHistory();
    toast("已取消组合");
  }
  function selectGroup(g) {
    state.sel.clear();
    g.ids.forEach(id => state.sel.add(id));
    state.selectedId = g.ids[0];
    refreshSelection(); renderInspector(); renderLayers(); updateSelInfo();
  }
  function renderGroupOverlays() {
    const st = stageEl();
    st.querySelectorAll(".grp-overlay").forEach(n => n.remove());
    state.groups = state.groups.map(g => ({ ...g, ids: g.ids.filter(id => elById(id)) })).filter(g => g.ids.length >= 2);
    state.groups.forEach(g => {
      const els = g.ids.map(elById).filter(Boolean);
      if (!els.length) return;
      const rects = els.map(posOf);
      const minX = Math.min(...rects.map(r => r.x)), minY = Math.min(...rects.map(r => r.y));
      const maxX = Math.max(...rects.map(r => r.x + r.w)), maxY = Math.max(...rects.map(r => r.y + r.h));
      g.x = minX; g.y = minY; g.w = maxX - minX; g.h = maxY - minY;
      const o = document.createElement("div");
      o.className = "grp-overlay";
      o.dataset.gid = g.id;
      o.style.left = g.x + "px"; o.style.top = g.y + "px"; o.style.width = g.w + "px"; o.style.height = g.h + "px";
      o.innerHTML = '<span class="grp-name">' + esc(g.name) + '</span><span class="grp-x" title="取消组合">×</span>';
      o.addEventListener("mousedown", e => {
        e.preventDefault(); e.stopPropagation();
        if (e.target.classList.contains("grp-x")) { ungroup(g.id); return; }
        selectGroup(g);
        const rect = stageEl().getBoundingClientRect();
        const startX = e.clientX, startY = e.clientY;
        const ox = g.x, oy = g.y;
        const mv = ev => {
          const dx = (ev.clientX - startX) / zoom, dy = (ev.clientY - startY) / zoom;
          const nx = Math.round(ox + dx), ny = Math.round(oy + dy);
          const ddx = nx - g.x, ddy = ny - g.y;
          g.ids.map(elById).filter(Boolean).forEach(el => { const r = posOf(el); setPos(el, { x: r.x + ddx, y: r.y + ddy, w: r.w, h: r.h }); });
          g.x = nx; g.y = ny;
          const od = document.querySelector('.grp-overlay[data-gid="' + g.id + '"]');
          if (od) { od.style.left = nx + "px"; od.style.top = ny + "px"; }
          syncInspectorNumbers(); updateCoord();
        };
        const up = () => {
          window.removeEventListener("mousemove", mv);
          window.removeEventListener("mouseup", up);
          pushHistory();
        };
        window.addEventListener("mousemove", mv);
        window.addEventListener("mouseup", up);
      });
      st.appendChild(o);
    });
  }

  /* ---------- 图层 ---------- */
  function renderLayers() {
    const list = $("#layer-list");
    const sorted = state.elements.slice().sort((a, b) => (b.style.z || 0) - (a.style.z || 0));
    $("#layer-count").textContent = state.elements.length + " 项";
    list.innerHTML = "";
    sorted.forEach(el => {
      const row = document.createElement("div");
      row.className = "layer-item" + (el.id === state.selectedId ? " sel" : "");
      row.innerHTML = '<span class="li-eye ' + (el.visible ? "" : "off") + '" title="显示/隐藏">'
        + (el.visible ? "●" : "○") + '</span>'
        + '<span class="li-thumb">' + (ICON[el.type] || "") + '</span>'
        + '<span class="li-name">' + esc(el.name || TYPE_NAMES[el.type]) + '</span>'
        + (groupOf(el.id) ? '<span class="li-grp" title="已组合">组</span>' : "")
        + '<span class="li-type">z:' + el.style.z + '</span>'
        + '<span class="li-arrow up" title="上移一层">▲</span>'
        + '<span class="li-arrow down" title="下移一层">▼</span>';
      row.querySelector(".li-eye").addEventListener("click", e => {
        e.stopPropagation();
        el.visible = !el.visible;
        renderStage(); renderLayers(); markDirty(true);
      });
      row.querySelector(".li-arrow.up").addEventListener("click", e => {
        e.stopPropagation(); zStep(el, 1);
      });
      row.querySelector(".li-arrow.down").addEventListener("click", e => {
        e.stopPropagation(); zStep(el, -1);
      });
      row.addEventListener("click", () => selectEl(el.id));
      list.appendChild(row);
    });
  }

  function zStep(el, dir) {
    const sorted = state.elements.slice().sort((a, b) => (a.style.z || 0) - (b.style.z || 0));
    const i = sorted.indexOf(el);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const other = sorted[j];
    const t = el.style.z; el.style.z = other.style.z; other.style.z = t;
    renderStage(); renderLayers(); renderInspector(); pushHistory();
  }

  /* ---------- 组件增删 ---------- */
  function addComponent(type, x, y) {
    const el = makeEl(type, x, y);
    state.elements.push(el);
    state.selectedId = el.id;
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
    return el;
  }

  function delSelected() {
    const list = selList(); if (!list.length) return;
    const ids = new Set(list.map(e => e.id));
    state.elements = state.elements.filter(e => !ids.has(e.id));
    state.groups = state.groups.map(g => ({ ...g, ids: g.ids.filter(id => !ids.has(id)) })).filter(g => g.ids.length >= 2);
    state.selectedId = null; state.sel.clear();
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
  }

  function duplicate() {
    const list = selList(); if (!list.length) return;
    const news = [];
    list.forEach(el => {
      const cp = JSON.parse(JSON.stringify(el));
      cp.id = genId();
      const r = posOf(cp);
      setPos(cp, { x: r.x + 24, y: r.y + 24, w: r.w, h: r.h });
      news.push(cp);
      const g = state.groups.find(g => g.ids.includes(el.id));
      if (g) g.ids.push(cp.id);
    });
    state.elements.push(...news);
    state.selectedId = news[news.length - 1].id; state.sel.clear();
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
  }

  function copySel() {
    const list = selList(); if (!list.length) return;
    clipboardEls = JSON.parse(JSON.stringify(list));
    clipboardGroups = state.groups.filter(g => g.ids.some(id => list.some(e => e.id === id))).map(g => ({ ...g, ids: g.ids.filter(id => list.some(e => e.id === id)) }));
    toast("已复制 " + clipboardEls.length + " 个元素");
  }

  function cutSel() {
    const list = selList(); if (!list.length) return;
    copySel();
    delSelected();
  }

  function pasteClip() {
    if (!clipboardEls || !clipboardEls.length) return;
    const map = {};
    const news = clipboardEls.map(el => {
      const cp = JSON.parse(JSON.stringify(el));
      const oldId = cp.id;
      cp.id = genId();
      map[oldId] = cp.id;
      const r = posOf(cp);
      setPos(cp, { x: r.x + 20, y: r.y + 20, w: r.w, h: r.h });
      return cp;
    });
    clipboardGroups.forEach(g => {
      state.groups.push({ id: g.id, name: g.name, ids: g.ids.map(id => map[id]).filter(Boolean) });
    });
    state.elements.push(...news);
    state.selectedId = news[news.length - 1].id; state.sel.clear();
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
    toast("已粘贴 " + news.length + " 个元素");
  }

  function nudgeSel(key, step) {
    const list = selList(); if (!list.length) return;
    const dx = key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0;
    const dy = key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0;
    list.forEach(el => { el.x += dx; el.y += dy; });
    renderStage(); renderLayers(); renderInspector(); updateSelInfo(); pushHistory();
  }

  function zTop() {
    const el = selEl(); if (!el) return;
    const zMax = state.elements.reduce((m, e) => Math.max(m, e.style.z || 0), 0);
    el.style.z = zMax + 1;
    renderStage(); renderLayers(); renderInspector(); pushHistory();
  }
  function zBottom() {
    const el = selEl(); if (!el) return;
    const zMin = state.elements.reduce((m, e) => Math.min(m, e.style.z || 0), 0);
    el.style.z = zMin - 1;
    renderStage(); renderLayers(); renderInspector(); pushHistory();
  }

  function pickImage(el) {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.addEventListener("change", () => {
      const f = inp.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        el.props.src = rd.result;
        renderElementOnly(el);
        renderInspector();
        markDirty(true);
        toast("图片已嵌入，导出 HTML 后仍可显示");
      };
      rd.readAsDataURL(f);
    });
    inp.click();
  }

  /* ---------- 拖入组件 ---------- */
  function setupPalette() {
    const grid = $("#palette-grid");
    const PALETTE = [
      { type: "button", name: "按钮" }, { type: "text", name: "文字" },
      { type: "switch", name: "开关" }, { type: "input", name: "输入框" },
      { type: "slider", name: "滑块" }, { type: "select", name: "下拉框" },
      { type: "checkbox", name: "复选框" }, { type: "radio", name: "单选" },
      { type: "image", name: "图片" }, { type: "progress", name: "进度条" },
      { type: "divider", name: "分割线" }, { type: "badge", name: "徽章" },
      { type: "container", name: "容器", wide: true },
      { type: "tabs", name: "选项卡" }, { type: "card", name: "卡片" },
      { type: "chart", name: "图表" }, { type: "table", name: "表格" },
      { type: "video", name: "视频" }, { type: "date", name: "日期" },
      { type: "modal", name: "弹窗" },
      { type: "list", name: "列表" }, { type: "rating", name: "评分" },
      { type: "search", name: "搜索框" }, { type: "navbar", name: "导航栏", wide: true },
      { type: "steps", name: "步骤条" }, { type: "timeline", name: "时间线" },
      { type: "footer", name: "页脚", wide: true }, { type: "avatar", name: "头像" },
      { type: "carousel", name: "轮播图", wide: true }, { type: "breadcrumb", name: "面包屑" },
      { type: "stat", name: "统计数字" }, { type: "price", name: "价格卡" },
      { type: "sidebar", name: "侧边菜单" }, { type: "notice", name: "通知条", wide: true },
      { type: "accordion", name: "手风琴", wide: true }, { type: "quote", name: "引用块", wide: true },
      { type: "code", name: "代码块", wide: true }, { type: "qrcode", name: "二维码" },
      { type: "tags", name: "标签组" },
      { type: "custom", name: "自定义 HTML", wide: true }
    ];
    grid.innerHTML = "";
    const allItems = PALETTE.map(it => {
      const item = document.createElement("div");
      item.className = "pal-item" + (it.wide ? " wide" : "");
      item.dataset.type = it.type;
      item.dataset.name = it.name;
      item.innerHTML = '<span class="pal-icon">' + (ICON[it.type] || "") + '</span><span class="pal-name">' + it.name + '</span>';
      grid.appendChild(item);
      return { item, it };
    });
    const filterPal = v => {
      const kw = String(v || "").trim().toLowerCase();
      allItems.forEach(({ item, it }) => {
        item.style.display = (!kw || it.name.indexOf(kw) >= 0 || it.type.indexOf(kw) >= 0) ? "" : "none";
      });
    };
    const palSearch = $("#palette-filter");
    if (palSearch) palSearch.addEventListener("input", e => filterPal(e.target.value));
    allItems.forEach(({ item, it }) => {

      let downX = 0, downY = 0, ghost = null;
      item.addEventListener("mousedown", e => {
        e.preventDefault();
        downX = e.clientX; downY = e.clientY;
        ghost = document.createElement("div");
        ghost.innerHTML = ICON[it.type] || "";
        ghost.style.cssText = "position:fixed;left:" + e.clientX + "px;top:" + e.clientY + "px;z-index:9000;pointer-events:none;opacity:.8;width:46px;height:46px;background:#2c2f37;border:1px solid #4f8cff;border-radius:9px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.4);";
        document.body.appendChild(ghost);
        item.style.opacity = ".4";

        const mv = ev => {
          if (ghost) { ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px"; }
        };
        const up = ev => {
          document.removeEventListener("mousemove", mv);
          document.removeEventListener("mouseup", up);
          if (ghost) ghost.remove();
          item.style.opacity = "";
          const dist = Math.abs(ev.clientX - downX) + Math.abs(ev.clientY - downY);
          if (dist < 5) {
            const st = stageEl();
            const rect = st.getBoundingClientRect();
            addComponent(it.type, Math.round((rect.width - DEF_W[it.type]) / 2), Math.round((rect.height - DEF_H[it.type]) / 2));
            return;
          }
          const hit = document.elementFromPoint(ev.clientX, ev.clientY);
          if (hit && stageEl().contains(hit)) {
            const rect = stageEl().getBoundingClientRect();
            let x = (ev.clientX - rect.left) / zoom - DEF_W[it.type] / 2;
            let y = (ev.clientY - rect.top) / zoom - DEF_H[it.type] / 2;
            x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
            addComponent(it.type, x, y);
          }
        };
        document.addEventListener("mousemove", mv);
        document.addEventListener("mouseup", up);
      });
    });
  }

  /* ---------- 模板 ---------- */
  function setupTemplates() {
    const grid = $("#template-grid");
    if (!grid) return;
    const TPL = [
      { name: "卡片页", icon: "▣", fn: buildTplCard },
      { name: "导航页", icon: "☰", fn: buildTplNav },
      { name: "表单页", icon: "▤", fn: buildTplForm },
      { name: "数据页", icon: "▥", fn: buildTplData },
      { name: "着陆页", icon: "▸", fn: buildTplLanding },
      { name: "看板页", icon: "▦", fn: buildTplDashboard },
      { name: "电商页", icon: "▧", fn: buildTplShop },
      { name: "个人页", icon: "▩", fn: buildTplProfile }
    ];
    TPL.forEach(t => {
      const b = document.createElement("button");
      b.className = "tpl-btn";
      b.innerHTML = '<span class="tpl-icon">' + t.icon + '</span><span>' + t.name + '</span>';
      b.addEventListener("click", () => { t.fn(); });
      grid.appendChild(b);
    });
  }
  function tplAdd(type, x, y, extra) {
    addComponent(type, x, y);
    const el = state.elements[state.elements.length - 1];
    if (el && extra) {
      if (extra.w) el.w = extra.w;
      if (extra.h) el.h = extra.h;
      if (extra.text !== undefined) el.props.text = extra.text;
      if (extra.placeholder !== undefined) el.props.placeholder = extra.placeholder;
      if (extra.fontSize) el.style.fontSize = extra.fontSize;
      if (extra.bold) el.style.bold = extra.bold;
      if (extra.color) el.style.textColor = extra.color;
      if (extra.props) Object.assign(el.props, extra.props);
    }
    return el;
  }
  function buildTplCard() {
    tplAdd("card", 20, 20, { w: 360, h: 260 });
    tplAdd("text", 40, 46, { text: "功能卡片", fontSize: 22, bold: true });
    tplAdd("text", 40, 92, { text: "这里是一段卡片描述文字，用于说明该卡片的功能与亮点，可双击编辑。", w: 320, h: 60, color: "#666666" });
    tplAdd("button", 40, 210, { text: "立即体验", w: 120 });
    tplAdd("avatar", 330, 44, { w: 44, h: 44, props: { text: "A" } });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「卡片页」"); pushHistory();
  }
  function buildTplNav() {
    tplAdd("navbar", 0, 0, { w: 1280 });
    tplAdd("text", 60, 300, { text: "欢迎使用 WebUI Studio", fontSize: 40, bold: true, w: 600, h: 60 });
    tplAdd("text", 62, 382, { text: "拖拽式网页 UI 设计，快速构建你的第一个页面。", w: 560, h: 40, color: "#666666" });
    tplAdd("button", 62, 442, { text: "开始创作", w: 150 });
    tplAdd("image", 700, 220, { w: 400, h: 300 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「导航页」"); pushHistory();
  }
  function buildTplForm() {
    tplAdd("text", 40, 30, { text: "联系表单", fontSize: 26, bold: true });
    tplAdd("input", 40, 100, { w: 420, h: 40, placeholder: "请输入姓名" });
    tplAdd("input", 40, 160, { w: 420, h: 40, placeholder: "请输入邮箱" });
    tplAdd("input", 40, 220, { w: 420, h: 80, placeholder: "请输入留言内容" });
    tplAdd("button", 40, 320, { text: "提交", w: 140 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「表单页」"); pushHistory();
  }
  function buildTplData() {
    tplAdd("text", 40, 26, { text: "数据概览", fontSize: 24, bold: true });
    tplAdd("chart", 40, 80, { w: 520, h: 300 });
    tplAdd("table", 600, 80, { w: 460, h: 300 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「数据页」"); pushHistory();
  }
  function buildTplLanding() {
    tplAdd("navbar", 0, 0, { w: 1280 });
    tplAdd("text", 90, 220, { text: "下一代网页设计工具", fontSize: 44, bold: true, w: 680, h: 64 });
    tplAdd("text", 92, 302, { text: "拖拽即得，一键导出单文件 HTML，让创意立刻上线。", w: 640, h: 44, color: "#666666" });
    tplAdd("button", 92, 372, { text: "免费开始", w: 150 });
    tplAdd("button", 262, 372, { text: "查看文档", w: 150 });
    tplAdd("stat", 700, 240, { w: 210, h: 96 });
    tplAdd("stat", 940, 240, { w: 210, h: 96 });
    tplAdd("carousel", 90, 470, { w: 1100, h: 240 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「着陆页」"); pushHistory();
  }
  function buildTplDashboard() {
    tplAdd("sidebar", 0, 0, { w: 220, h: 720 });
    tplAdd("text", 260, 24, { text: "数据看板", fontSize: 24, bold: true });
    tplAdd("stat", 260, 84, { w: 230, h: 96 });
    tplAdd("stat", 510, 84, { w: 230, h: 96 });
    tplAdd("stat", 760, 84, { w: 230, h: 96 });
    tplAdd("chart", 260, 210, { w: 500, h: 280 });
    tplAdd("table", 790, 210, { w: 470, h: 280 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「看板页」"); pushHistory();
  }
  function buildTplShop() {
    tplAdd("navbar", 0, 0, { w: 1280 });
    tplAdd("notice", 60, 62, { w: 1160, h: 44 });
    tplAdd("carousel", 60, 126, { w: 1160, h: 300 });
    tplAdd("text", 100, 452, { text: "选择你的套餐", fontSize: 22, bold: true });
    tplAdd("price", 100, 500, { w: 240, h: 240 });
    tplAdd("price", 380, 500, { w: 240, h: 240, props: { title: "旗舰版", price: "199", featured: true } });
    tplAdd("price", 660, 500, { w: 240, h: 240 });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「电商页」"); pushHistory();
  }
  function buildTplProfile() {
    tplAdd("avatar", 80, 70, { w: 120, h: 120, props: { text: "M", shape: "circle" } });
    tplAdd("text", 250, 86, { text: "你好，我是 Marvis", fontSize: 30, bold: true, w: 400, h: 46 });
    tplAdd("text", 252, 140, { text: "全栈开发者 · UI 设计工具作者 · 开源爱好者", w: 460, h: 36, color: "#666666" });
    tplAdd("tags", 252, 190, { w: 300, h: 30, props: { items: "WebUI Studio,Python,开源" } });
    tplAdd("button", 80, 300, { text: "查看作品集", w: 150 });
    tplAdd("button", 250, 300, { text: "联系我", w: 130 });
    tplAdd("quote", 80, 390, { w: 520, h: 96, props: { text: "代码与设计的边界，是我每天跨越的地方。", author: "— Marvis" } });
    tplAdd("accordion", 660, 70, { w: 480, h: 260, props: { items: "我做过什么？|WebUI Studio 网页设计器，拖拽式构建 HTML 页面并一键导出。\n最近在忙什么？|迭代 v1.7，为设计器增加更多实用组件与模板。" } });
    tplAdd("qrcode", 660, 360, { w: 140, h: 140, props: { text: "https://github.com/wjw-exe/WebUIStudio", size: 120 } });
    renderStage(); renderLayers(); updateCount(); toast("已插入模板「个人页」"); pushHistory();
  }

  /* ---------- 画布设置 ---------- */
  function bindCanvasSettings() {
    $$("#panel-canvas .seg-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.bpView = btn.dataset.bp;
        $$("#panel-canvas .seg-btn").forEach(b => b.classList.toggle("on", b === btn));
        renderStage(); refreshSelection(); renderInspector(); renderLayers(); updateCoord();
      });
    });
    $("#cv-w").addEventListener("change", () => {
      state.stage.w = clamp(parseInt($("#cv-w").value) || 1280, 320, 1920);
      $("#cv-w").value = state.stage.w;
      renderStage(); markDirty(true); zoomFit();
    });
    $("#cv-h").addEventListener("change", () => {
      state.stage.h = clamp(parseInt($("#cv-h").value) || 720, 240, 2400);
      $("#cv-h").value = state.stage.h;
      renderStage(); markDirty(true); zoomFit();
    });
    BPS.forEach(b => {
      const bindBp = (axis, min, max) => {
        const inp = $("#bp-" + axis + "-" + b);
        inp.addEventListener("change", () => {
          const v = clamp(parseInt(inp.value) || min, min, max);
          inp.value = v;
          if (b === "desktop") {
            state.stage[axis] = v;
            $("#cv-" + axis).value = v;
          } else {
            const s = bpSize(b);
            setBpSize(b, axis === "w" ? v : s.w, axis === "h" ? v : s.h);
          }
          renderStage(); markDirty(true);
          if (b === "desktop") zoomFit();
          syncCanvasPanel();
        });
      };
      bindBp("w", 320, 1920);
      bindBp("h", 240, 2400);
    });
    $("#cv-bg").addEventListener("input", () => {
      state.stage.bg = $("#cv-bg").value;
      $("#cv-bg-hex").value = state.stage.bg;
      renderStage();
    });
    $("#cv-bg-hex").addEventListener("change", () => {
      let v = $("#cv-bg-hex").value;
      if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
        v = v[0] === "#" ? v : "#" + v;
        state.stage.bg = v; $("#cv-bg").value = v; renderStage(); markDirty(true);
      }
    });
    $("#cv-grid").addEventListener("change", () => {
      state.stage.grid = $("#cv-grid").checked;
      renderStage(); markDirty(true);
    });
    $("#cv-css").addEventListener("input", () => {
      state.css = $("#cv-css").value;
      applyStudioCss();
    });
    $("#cv-css").addEventListener("change", () => { markDirty(true); });
  }
  function syncCanvasPanel() {
    $("#cv-w").value = state.stage.w;
    $("#cv-h").value = state.stage.h;
    BPS.forEach(b => {
      const s = bpSize(b);
      const wi = $("#bp-w-" + b), hi = $("#bp-h-" + b);
      if (wi) wi.value = s.w;
      if (hi) hi.value = s.h;
    });
    $("#cv-bg").value = state.stage.bg;
    $("#cv-bg-hex").value = state.stage.bg;
    $("#cv-grid").checked = state.stage.grid;
    $("#cv-css").value = state.css || "";
  }

  /* ---------- 缩放 ---------- */
  function applyZoom() {
    const st = stageEl();
    const cw = $("#canvas-scroll");
    const pad = 60;
    st.style.transform = "scale(" + zoom + ")";
    st.style.transformOrigin = "top left";
    cw.scrollLeft = cw.scrollLeft || 0;
    cw.scrollTop = cw.scrollTop || 0;
    $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
    $("#sb-zoom").textContent = Math.round(zoom * 100) + "%";
  }
  function zoomSet(z) {
    zoom = clamp(z, 0.2, 3);
    applyZoom();
  }
  function zoomIn() { zoomSet(zoom + 0.1); }
  function zoomOut() { zoomSet(zoom - 0.1); }
  function zoom100() { zoomSet(1); }
  function zoomFit() {
    const area = $("#canvas-scroll");
    const availW = area.clientWidth - 130;
    const availH = area.clientHeight - 130;
    const z = Math.min(availW / state.stage.w, availH / state.stage.h, 1);
    zoomSet(Math.max(0.2, Math.round(z * 100) / 100));
  }
  function updateZoomLabel() { applyZoom(); }

  /* ---------- 状态栏 ---------- */
  function updateCount() {
    $("#sb-count").textContent = state.elements.length + " 个元素";
  }
  function updateSelInfo() {
    const el = elById(state.selectedId);
    $("#sb-sel").textContent = el ? (el.name || TYPE_NAMES[el.type]) + (state.sel.size > 1 ? " 等 " + state.sel.size + " 项" : "") + " (已选中)" : "未选中";
  }
  function updateCoord() {
    const el = selEl();
    const r = el ? posOf(el) : null;
    $("#sb-coord").textContent = el && r ? "X " + r.x + "  Y " + r.y + "  W " + r.w + "  H " + r.h + "  [" + BP_NAMES[curBp()] + "]" : "";
  }
  function updateUndoBtns() {
    $("#tb-undo").classList.toggle("disabled", histIdx <= 0);
    $("#tb-redo").classList.toggle("disabled", histIdx >= history.length - 1);
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = msg;
    t.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
  }

  /* ---------- 右键菜单 ---------- */
  function showCtxMenu(x, y) {
    const m = $("#ctx-menu");
    m.classList.remove("hidden");
    m.style.left = Math.min(x, window.innerWidth - 190) + "px";
    m.style.top = Math.min(y, window.innerHeight - 220) + "px";
  }
  function hideCtxMenu() { $("#ctx-menu").classList.add("hidden"); }

  /* ---------- 弹窗 ---------- */
  function modal(title, body) {
    const ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;";
    ov.innerHTML = '<div style="background:#26282f;border:1px solid #3d4048;border-radius:12px;min-width:420px;max-width:640px;box-shadow:0 20px 60px rgba(0,0,0,.6);">'
      + '<div style="padding:14px 18px;border-bottom:1px solid #33353d;font-size:14px;font-weight:600;">' + title + '</div>'
      + '<div style="padding:16px 18px;font-size:13px;color:#c8cdd5;line-height:2;">' + body + '</div>'
      + '<div style="padding:10px 18px 14px;text-align:right;"><button id="modal-ok" style="background:#2f5cff;color:#fff;border:none;border-radius:7px;padding:7px 22px;font-size:13px;cursor:pointer;">知道了</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector("#modal-ok").addEventListener("click", () => ov.remove());
    ov.addEventListener("mousedown", e => { if (e.target === ov) ov.remove(); });
  }

  const SHORTCUTS = [
    ["拖入 / 点击组件", "从左侧添加到画布"],
    ["拖动组件", "画布内自由移动"],
    ["拖动 8 个手柄", "自由缩放尺寸"],
    ["双击文字", "直接编辑文字内容"],
    ["Ctrl + 滚轮", "缩放画布"],
    ["Ctrl+Z / Ctrl+Y", "撤销 / 重做"],
    ["Ctrl+D", "复制所选组件"],
    ["Delete", "删除所选组件"],
    ["Ctrl+G / Ctrl+Shift+G", "组合 / 取消组合"],
    ["Ctrl+E", "导出 HTML"],
    ["Ctrl+S", "保存项目"],
    ["Ctrl+O / Ctrl+N", "打开 / 新建项目"],
    ["F5", "浏览器预览"],
    ["Ctrl+Shift+[ / ]", "置底 / 置顶"],
    ["Esc", "取消选中 / 关闭菜单"]
  ].map(r => '<div style="display:flex;justify-content:space-between;gap:30px;"><b style="color:#8ab0ff;font-weight:600;">' + r[0] + '</b><span style="color:#9aa0aa;">' + r[1] + '</span></div>').join("");

  function showHelp() {
    modal("快捷键与操作说明", SHORTCUTS);
  }
  function showAbout() {
    modal("关于 WebUI Studio",
      '<div style="text-align:center;padding:6px 0 2px;">'
      + '<div style="font-size:20px;font-weight:700;color:#d7dbe1;">WebUI Studio v1.5.0</div>'
      + '<div style="color:#8a8f98;margin-top:6px;">网页 UI 制作软件 · 拖拽式可视化设计</div>'
      + '<div style="color:#6b7180;margin-top:4px;">PySide6 + QWebEngineView</div>'
      + '</div>');
  }

  /* ---------- 页面管理 ---------- */
  function currentPage() { return state.pages[state.pageIdx] || { elements: state.elements }; }
  function switchPage(i) {
    if (i < 0 || i >= state.pages.length) return;
    currentPage().elements = state.elements;
    currentPage().groups = state.groups;
    state.pageIdx = i;
    state.elements = state.pages[i].elements;
    state.groups = (state.pages[i].groups || []).slice();
    state.selectedId = null;
    renderStage(); renderLayers(); renderInspector(); renderPages(); updateCount();
  }
  function addPage() {
    currentPage().elements = state.elements;
    currentPage().groups = state.groups;
    const pg = { id: "page_" + (state.pages.length + 1) + "_" + Date.now().toString(36), name: "页面 " + (state.pages.length + 1), elements: [], groups: [] };
    state.pages.push(pg);
    state.pageIdx = state.pages.length - 1;
    state.elements = pg.elements;
    state.groups = [];
    state.selectedId = null;
    renderStage(); renderLayers(); renderInspector(); renderPages(); updateCount(); pushHistory();
  }
  function copyPage(i) {
    const src = state.pages[i];
    if (!src) return;
    const cp = {
      id: "page_" + (state.pages.length + 1) + "_" + Date.now().toString(36),
      name: src.name + " 副本",
      elements: JSON.parse(JSON.stringify(src.elements)),
      groups: src.groups ? JSON.parse(JSON.stringify(src.groups)) : []
    };
    state.pages.splice(i + 1, 0, cp);
    renderPages(); markDirty(true);
    toast("已复制页面「" + cp.name + "」");
  }
  function delPage(i) {
    if (state.pages.length <= 1) { toast("至少保留一个页面"); return; }
    if (i === state.pageIdx) {
      state.pages.splice(i, 1);
      const next = Math.max(0, i - 1);
      state.pageIdx = next;
      state.elements = state.pages[next].elements;
      state.groups = (state.pages[next].groups || []).slice();
      state.selectedId = null;
      renderStage(); renderLayers(); renderInspector(); renderPages(); updateCount(); pushHistory();
    } else {
      state.pages.splice(i, 1);
      if (i < state.pageIdx) state.pageIdx--;
      renderPages();
    }
  }
  function renamePage(i, name) {
    if (!state.pages[i]) return;
    state.pages[i].name = String(name || "").trim() || ("页面 " + (i + 1));
    renderPages(); markDirty(true);
  }
  function renderPages() {
    const list = $("#page-list");
    if (!list) return;
    list.innerHTML = "";
    state.pages.forEach((pg, i) => {
      const row = document.createElement("div");
      row.className = "page-item" + (i === state.pageIdx ? " sel" : "");
      row.innerHTML = '<span class="pi-dot"></span><span class="pi-name">' + esc(pg.name) + '</span>'
        + '<span class="pi-count">' + pg.elements.length + '</span>'
        + '<span class="pi-copy" title="复制页面">⧉</span>'
        + '<span class="pi-x" title="删除页面">×</span>';
      row.querySelector(".pi-copy").addEventListener("click", e => { e.stopPropagation(); copyPage(i); });
      row.querySelector(".pi-x").addEventListener("click", e => { e.stopPropagation(); delPage(i); });
      row.querySelector(".pi-name").addEventListener("dblclick", e => {
        const nm = prompt("页面名称：", pg.name);
        if (nm) renamePage(i, nm);
      });
      row.addEventListener("click", () => { if (i !== state.pageIdx) switchPage(i); });
      list.appendChild(row);
    });
  }

  /* ---------- 项目保存 / 打开 / 导出 / 预览 ---------- */
  function projectJSON() {
    const pages = state.pages.length ? state.pages : [{ id: "page_1", name: "页面 1", elements: state.elements }];
    return JSON.stringify({
      version: 3, title: state.title, stage: state.stage, pageIdx: state.pageIdx,
      pages: pages.map(p => ({ id: p.id, name: p.name, elements: p.elements, groups: p.groups || [] }))
    }, null, 2);
  }

  function doSaveProject() {
    if (bridge) {
      bridge.saveFile(JSON.stringify({
        name: state.title + ".wuis",
        content: projectJSON(),
        filter: "WebUI Studio 项目 (*.wuis);;JSON 文件 (*.json)"
      }), res => {
        const r = JSON.parse(res);
        if (r.ok) toast("项目已保存到 <b>" + r.path + "</b>");
        else if (!r.cancel) toast("保存失败：" + r.msg);
      });
    } else {
      fallbackDownload("project.wuis", projectJSON(), "text/plain");
    }
  }

  function doExport() {
    const html = WUIS_EXPORTER.exportHTML(state);
    if (bridge) {
      bridge.saveFile(JSON.stringify({
        name: state.title + ".html",
        content: html,
        filter: "HTML 文件 (*.html)"
      }), res => {
        const r = JSON.parse(res);
        if (r.ok) toast("已导出 <b>" + r.path + "</b>");
        else if (!r.cancel) toast("导出失败：" + r.msg);
      });
    } else {
      fallbackDownload(state.title + ".html", html, "text/html");
    }
  }

  function doPreview() {
    const html = WUIS_EXPORTER.exportHTML(state);
    if (bridge) {
      bridge.preview(html, res => {
        const r = JSON.parse(res);
        if (r.ok) toast("已在浏览器中打开预览");
        else toast("预览失败：" + r.msg);
      });
    } else {
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); }
    }
  }

  function doOpen() {
    if (!bridge) { toast("请在本软件内使用打开功能"); return; }
    bridge.openFile(res => {
      const r = JSON.parse(res);
      if (r.cancel) return;
      if (!r.ok) { toast("打开失败：" + r.msg); return; }
      try {
        const data = JSON.parse(r.content);
        if (!data || (!Array.isArray(data.elements) && !Array.isArray(data.pages))) throw new Error("格式不正确");
        state.title = data.title || "未命名页面";
        state.stage = Object.assign({ w: 1280, h: 720, bg: "#ffffff", grid: true, bp: { tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 844 } } }, data.stage);
        if (!state.stage.bp) state.stage.bp = { tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 844 } };
        if (Array.isArray(data.pages) && data.pages.length) {
          state.pages = data.pages.map((p, i) => ({ id: p.id || ("page_" + (i + 1)), name: p.name || ("页面 " + (i + 1)), elements: p.elements || [], groups: p.groups || [] }));
          state.pageIdx = Math.max(0, Math.min(data.pageIdx || 0, state.pages.length - 1));
          state.elements = state.pages[state.pageIdx].elements;
          state.groups = (state.pages[state.pageIdx].groups || []).slice();
        } else {
          state.pages = [{ id: "page_1", name: "页面 1", elements: data.elements || [], groups: [] }];
          state.pageIdx = 0;
          state.elements = state.pages[0].elements;
          state.groups = [];
        }
        state.selectedId = null;
        history = [snapshot()];
        histIdx = 0;
        renderStage(); renderLayers(); renderInspector(); renderPages(); updateCount(); syncCanvasPanel();
        updateUndoBtns();
        toast("已打开项目 <b>" + r.path + "</b>");
      } catch (err) {
        toast("项目文件解析失败：" + err.message);
      }
    });
  }

  function doNew() {
    if (state.elements.length) {
      const ok = confirm("确定要新建项目吗？当前设计将丢失。");
      if (!ok) return;
    }
    state.title = "未命名页面";
    state.stage = { w: 1280, h: 720, bg: "#ffffff", grid: true, bp: { tablet: { w: 768, h: 1024 }, mobile: { w: 390, h: 844 } } };
    state.pages = [{ id: "page_1", name: "页面 1", elements: [], groups: [] }];
    state.pageIdx = 0;
    state.elements = state.pages[0].elements;
    state.groups = [];
    state.selectedId = null;
    history = [snapshot()];
    histIdx = 0;
    renderStage(); renderLayers(); renderInspector(); renderPages(); updateCount(); syncCanvasPanel();
    updateUndoBtns();
    zoomFit();
    toast("已新建空白项目");
  }

  function fallbackDownload(name, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast("已下载 <b>" + name + "</b>");
  }

  /* ---------- 菜单与动作 ---------- */
  function setupMenus() {
    $$(".menu-root").forEach(root => {
      root.querySelector(".menu-label").addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = root.classList.contains("open");
        $$(".menu-root").forEach(r => r.classList.remove("open"));
        if (!isOpen) root.classList.add("open");
      });
      root.querySelectorAll(".mi").forEach(mi => {
        mi.addEventListener("click", () => {
          root.classList.remove("open");
          action(mi.dataset.cmd);
        });
      });
    });
    document.addEventListener("mousedown", e => {
      if (!e.target.closest(".menu-root")) $$(".menu-root").forEach(r => r.classList.remove("open"));
      if (!e.target.closest("#ctx-menu")) hideCtxMenu();
    });
    $("#ctx-menu").querySelectorAll(".mi").forEach(mi => {
      mi.addEventListener("click", () => { hideCtxMenu(); action(mi.dataset.cmd); });
    });
  }

  function action(cmd) {
    const alias = {
      alignLeft: "align-left", alignCenterX: "align-h", alignRight: "align-right",
      alignTop: "align-top", alignCenterY: "align-v", alignBottom: "align-bottom",
      distH: "dist-h", distV: "dist-v", lockSel: "lock", unlockSel: "unlock",
      showAll: "show-all", group: "group", ungroup: "ungroup", hideSel: "hide"
    };
    cmd = alias[cmd] || cmd;
    switch (cmd) {
      case "new": doNew(); break;
      case "open": doOpen(); break;
      case "save": doSaveProject(); break;
      case "export": doExport(); break;
      case "preview": doPreview(); break;
      case "undo": undo(); break;
      case "redo": redo(); break;
      case "duplicate": duplicate(); break;
      case "delete": delSelected(); break;
      case "top": zTop(); break;
      case "bottom": zBottom(); break;
      case "align-left": case "align-h": case "align-right":
      case "align-top": case "align-v": case "align-bottom":
      case "dist-h": case "dist-v": case "lock": case "hide":
        alignAction(cmd); break;
      case "unlock":
        selList().forEach(e => { e.locked = false; });
        state.selectedId = null; state.sel.clear();
        renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
        break;
      case "show-all":
        state.elements.forEach(e => { e.visible = true; });
        renderStage(); renderLayers(); pushHistory();
        break;
      case "group":
        if (canGroup()) groupSel(); else toast("请先多选两个以上组件");
        break;
      case "ungroup": {
        const g = state.groups.find(gr => state.sel.size && gr.ids.some(id => state.sel.has(id)));
        if (g) ungroup(g.id); else toast("当前所选不在组合中");
        break;
      }
      case "center-h": case "center-v": {
        const el = selEl(); if (!el) break;
        const r = posOf(el), ss = stageSize();
        if (cmd === "center-h") setPos(el, { x: Math.round((ss.w - r.w) / 2), y: r.y, w: r.w, h: r.h });
        else setPos(el, { x: r.x, y: Math.round((ss.h - r.h) / 2), w: r.w, h: r.h });
        renderStage(); renderInspector(); renderLayers(); updateSelInfo(); pushHistory();
        break;
      }
      case "zoomIn": zoomIn(); break;
      case "zoomOut": zoomOut(); break;
      case "zoom100": zoom100(); break;
      case "toggleSnap":
        snap = !snap;
        const _ms = document.getElementById("menu-snap");
        if (_ms) _ms.textContent = "网格吸附: " + (snap ? "开" : "关");
        toast("网格吸附已" + (snap ? "开启" : "关闭"));
        break;
      case "help": showHelp(); break;
      case "about": showAbout(); break;
    }
  }

  /* ---------- 对齐 / 分布 / 锁定 / 隐藏 ---------- */
  function alignAction(cmd) {
    const list = selList();
    if (cmd === "lock" || cmd === "hide") {
      if (!list.length) return;
      if (cmd === "lock") list.forEach(e => { e.locked = !e.locked; });
      else list.forEach(e => { e.visible = false; });
      state.selectedId = null; state.sel.clear();
      renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
      return;
    }
    if (list.length < 2) { toast("请按住 Ctrl 多选两个以上组件后再对齐"); return; }
    const rs = list.map(e => posOf(e));
    const xs = rs.map(r => r.x), ys = rs.map(r => r.y);
    const xe = rs.map(r => r.x + r.w), ye = rs.map(r => r.y + r.h);
    const minX = Math.min(...xs), maxX = Math.max(...xe), minY = Math.min(...ys), maxY = Math.max(...ye);
    if (cmd === "align-left") list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: minX, y: r.y, w: r.w, h: r.h }); });
    else if (cmd === "align-h") { const cx = (minX + maxX) / 2; list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: cx - r.w / 2, y: r.y, w: r.w, h: r.h }); }); }
    else if (cmd === "align-right") list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: maxX - r.w, y: r.y, w: r.w, h: r.h }); });
    else if (cmd === "align-top") list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: r.x, y: minY, w: r.w, h: r.h }); });
    else if (cmd === "align-v") { const cy = (minY + maxY) / 2; list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: r.x, y: cy - r.h / 2, w: r.w, h: r.h }); }); }
    else if (cmd === "align-bottom") list.forEach((e, i) => { const r = rs[i]; setPos(e, { x: r.x, y: maxY - r.h, w: r.w, h: r.h }); });
    else if (cmd === "dist-h") {
      const sorted = list.slice().sort((a, b) => posOf(a).x - posOf(b).x);
      const totalW = sorted.reduce((s, e) => s + posOf(e).w, 0);
      const gap = (posOf(sorted[sorted.length - 1]).x + posOf(sorted[sorted.length - 1]).w - posOf(sorted[0]).x - totalW) / (sorted.length - 1);
      let cur = posOf(sorted[0]).x + posOf(sorted[0]).w;
      for (let i = 1; i < sorted.length; i++) { const r = posOf(sorted[i]); setPos(sorted[i], { x: cur + gap, y: r.y, w: r.w, h: r.h }); cur = posOf(sorted[i]).x + posOf(sorted[i]).w; }
    }
    else if (cmd === "dist-v") {
      const sorted = list.slice().sort((a, b) => posOf(a).y - posOf(b).y);
      const totalH = sorted.reduce((s, e) => s + posOf(e).h, 0);
      const gap = (posOf(sorted[sorted.length - 1]).y + posOf(sorted[sorted.length - 1]).h - posOf(sorted[0]).y - totalH) / (sorted.length - 1);
      let cur = posOf(sorted[0]).y + posOf(sorted[0]).h;
      for (let i = 1; i < sorted.length; i++) { const r = posOf(sorted[i]); setPos(sorted[i], { x: r.x, y: cur + gap, w: r.w, h: r.h }); cur = posOf(sorted[i]).y + posOf(sorted[i]).h; }
    }
    renderStage(); renderInspector(); renderLayers(); updateSelInfo(); pushHistory();
  }

  /* ---------- 工具切换（移动 / 画笔） ---------- */
  function switchTool(tool) {
    state.tool = tool;
    $("#tb-tool-move").classList.toggle("active", tool === "move");
    $("#tb-tool-paint").classList.toggle("active", tool === "paint");
    stageEl().classList.toggle("paint-mode", tool === "paint");
    refreshSelection();
  }

  function setupToolbar() {
    $("#tb-tool-move").addEventListener("click", () => switchTool("move"));
    $("#tb-tool-paint").addEventListener("click", () => switchTool("paint"));
    $("#tb-undo").addEventListener("click", () => undo());
    $("#tb-redo").addEventListener("click", () => redo());
    $("#tb-duplicate").addEventListener("click", () => duplicate());
    $("#tb-delete").addEventListener("click", () => delSelected());
    $("#tb-save").addEventListener("click", () => doSaveProject());
    $("#tb-export").addEventListener("click", () => doExport());
    $("#tb-preview").addEventListener("click", () => doPreview());
    $("#zoom-in").addEventListener("click", zoomIn);
    $("#zoom-out").addEventListener("click", zoomOut);
    $("#zoom-fit").addEventListener("click", zoomFit);
    $("#rail-components").addEventListener("click", () => switchPanel("components"));
    $("#rail-layers").addEventListener("click", () => switchPanel("layers"));
    $("#rail-pages").addEventListener("click", () => switchPanel("pages"));
    $("#rail-bg").addEventListener("click", () => switchPanel("canvas"));
    $("#page-add").addEventListener("click", addPage);
    $("#tb-align-left").addEventListener("click", () => action("align-left"));
    $("#tb-align-cx").addEventListener("click", () => action("align-h"));
    $("#tb-align-right").addEventListener("click", () => action("align-right"));
    $("#tb-align-top").addEventListener("click", () => action("align-top"));
    $("#tb-align-cy").addEventListener("click", () => action("align-v"));
    $("#tb-align-bottom").addEventListener("click", () => action("align-bottom"));
  }

  function switchPanel(name) {
    $("#panel-components").classList.toggle("hidden", name !== "components");
    $("#panel-layers").classList.toggle("hidden", name !== "layers");
    $("#panel-pages").classList.toggle("hidden", name !== "pages");
    $("#panel-canvas").classList.toggle("hidden", name !== "canvas");
    $$(".rail-btn").forEach(b => b.classList.remove("active"));
    const r = $("#rail-" + name);
    if (r) r.classList.add("active");
    if (name === "layers") renderLayers();
    if (name === "pages") renderPages();
    if (name === "canvas") syncCanvasPanel();
  }

  /* ---------- 快捷键 ---------- */
  function setupKeys() {
    document.addEventListener("keydown", e => {
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Escape") {
        if (editing) return;
        state.selectedId = null;
        refreshSelection(); renderInspector(); renderLayers(); updateSelInfo();
        $$(".menu-root").forEach(r => r.classList.remove("open"));
        hideCtxMenu();
        return;
      }
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) {
        if (mod && (e.key === "z" || e.key === "y" || e.key === "e" || e.key === "s" || e.key === "d")) { /* 允许全局快捷键 */ }
        else return;
      }
      if (mod && e.key === "z") { e.preventDefault(); undo(); }
      else if (mod && e.key === "y") { e.preventDefault(); redo(); }
      else if (mod && e.key === "c") { e.preventDefault(); copySel(); }
      else if (mod && e.key === "x") { e.preventDefault(); cutSel(); }
      else if (mod && e.key === "v") { e.preventDefault(); pasteClip(); }
      else if (e.key === "v" || e.key === "V") { switchTool("move"); }
      else if (e.key === "b" || e.key === "B") { switchTool("paint"); }
      else if (mod && e.shiftKey && e.key === "g") { e.preventDefault(); action("ungroup"); }
      else if (mod && e.key === "g") { e.preventDefault(); action("group"); }
      else if (mod && e.key === "d") { e.preventDefault(); duplicate(); }
      else if (mod && e.key === "e") { e.preventDefault(); doExport(); }
      else if (mod && e.key === "s") { e.preventDefault(); doSaveProject(); }
      else if (mod && e.key === "o") { e.preventDefault(); doOpen(); }
      else if (mod && e.key === "n") { e.preventDefault(); doNew(); }
      else if (mod && e.key === "=") { e.preventDefault(); zoomIn(); }
      else if (mod && e.key === "-") { e.preventDefault(); zoomOut(); }
      else if (mod && e.key === "0") { e.preventDefault(); zoom100(); }
      else if (mod && e.shiftKey && e.key === "]") { e.preventDefault(); zTop(); }
      else if (mod && e.shiftKey && e.key === "[") { e.preventDefault(); zBottom(); }
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault(); delSelected();
      }
      else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (e.target.closest && e.target.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        nudgeSel(e.key, e.shiftKey ? 10 : 1);
      }
      else if (e.key === "F5") { e.preventDefault(); doPreview(); }
      else if (e.key === "F1") { e.preventDefault(); showHelp(); }
    });
    // Ctrl + 滚轮缩放
    $("#canvas-scroll").addEventListener("wheel", e => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      zoomSet(zoom + (e.deltaY < 0 ? 0.1 : -0.1));
    }, { passive: false });
    // 点击画布空白取消选中
    stageEl().addEventListener("mousedown", e => {
      if (e.target === stageEl() || e.target.id === "empty-hint") {
        state.selectedId = null;
        refreshSelection(); renderInspector(); renderLayers(); updateSelInfo();
      }
    });
  }

  /* ---------- 桥接 Python ---------- */
  function setupBridge() {
    if (typeof qt !== "undefined" && qt.webChannelTransport) {
      new QWebChannel(qt.webChannelTransport, ch => {
        bridge = ch.objects.bridge;
        toast("WebUI Studio 已就绪");
      });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    pushHistory();
    state.pages = [{ id: "page_1", name: "页面 1", elements: state.elements, groups: [] }];
    state.pageIdx = 0;
    renderStage();
    setupPalette();
    setupTemplates();
    bindCanvasSettings();
    renderInspector();
    renderLayers();
    renderPages();
    updateCount();
    updateSelInfo();
    setupMenus();
    setupToolbar();
    setupKeys();
    setupBridge();
    switchTool("move");
    const _ms0 = document.getElementById("menu-snap");
    if (_ms0) _ms0.textContent = "网格吸附: 开";
    window.setTimeout(zoomFit, 80);
    window.addEventListener("resize", () => { /* 不做自动缩放 */ });
  }

  window.App = { action: action };

  document.addEventListener("DOMContentLoaded", init);
})();
