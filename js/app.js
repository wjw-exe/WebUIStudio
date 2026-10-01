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
    badge: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5b8cff" stroke-width="1.7"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M9 12h6"/></svg>'
  };

  const TYPE_NAMES = {
    button: "按钮", text: "文字", switch: "开关", input: "输入框", slider: "滑块",
    select: "下拉框", checkbox: "复选框", radio: "单选", image: "图片",
    progress: "进度条", divider: "分割线", container: "容器", badge: "徽章"
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
    badge: () => ({ text: "NEW" })
  };

  const DEF_W = { button: 150, text: 180, switch: 90, input: 220, slider: 240, select: 180, checkbox: 140, radio: 140, image: 200, progress: 260, divider: 220, container: 320, badge: 70 };
  const DEF_H = { button: 44, text: 32, switch: 34, input: 40, slider: 34, select: 40, checkbox: 30, radio: 30, image: 140, progress: 30, divider: 24, container: 200, badge: 28 };

  /* ---------- 状态 ---------- */
  const state = {
    version: 1,
    title: "未命名页面",
    stage: { w: 1280, h: 720, bg: "#ffffff", grid: true },
    elements: [],
    selectedId: null,
    tool: "move" /* move=移动工具  paint=画笔工具 */
  };

  let history = [];
  let histIdx = -1;
  let zoom = 1;
  let snap = true;
  let bridge = null;
  let editing = false;

  const elById = id => state.elements.find(e => e.id === id);
  const selEl = () => elById(state.selectedId);
  let uid = 1;
  const genId = () => "el_" + (uid++) + "_" + Date.now().toString(36);

  function makeEl(type, x, y) {
    const st = DEFAULT_STYLE();
    const zMax = state.elements.reduce((m, e) => Math.max(m, e.style.z || 0), 0);
    st.z = zMax + 1;
    return {
      id: genId(), type, x, y,
      w: DEF_W[type], h: DEF_H[type],
      visible: true, locked: false,
      props: DEFAULT_PROPS[type](),
      style: st
    };
  }

  /* ---------- 历史 ---------- */
  function snapshot() {
    return JSON.parse(JSON.stringify({ title: state.title, stage: state.stage, elements: state.elements }));
  }
  function restore(snap) {
    state.title = snap.title; state.stage = snap.stage; state.elements = snap.elements;
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
    st.style.width = state.stage.w + "px";
    st.style.height = state.stage.h + "px";
    st.style.background = state.stage.bg;
    st.classList.toggle("grid-on", state.stage.grid);
    const eh = $("#empty-hint");
    eh.style.display = state.elements.length ? "none" : "block";
    st.querySelectorAll(".el").forEach(n => n.remove());
    state.elements.slice().sort((a, b) => (a.style.z || 0) - (b.style.z || 0)).forEach(el => {
      if (!el.visible) return;
      st.appendChild(renderEl(el));
    });
    syncInspectorNumbers();
  }

  function renderEl(el) {
    const d = document.createElement("div");
    d.className = "el";
    d.dataset.id = el.id;
    if (el.id === state.selectedId) d.classList.add("selected");
    if (el.locked) d.classList.add("locked");
    applyElStyle(d, el);
    d.innerHTML = elInnerHTML(el) + handlesHTML();
    bindElEvents(d, el);
    return d;
  }

  function applyElStyle(d, el) {
    d.style.left = el.x + "px";
    d.style.top = el.y + "px";
    d.style.width = el.w + "px";
    d.style.height = el.h + "px";
    d.style.opacity = el.style.opacity;
    d.style.zIndex = el.style.z;
    d.style.transform = "rotate(" + el.style.rotate + "deg)";
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
    switch (el.type) {
      case "button":
        return '<button class="wuis-btn" style="background:' + st.bgColor + ';color:' + st.textColor
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
        return '<div class="wuis-container" style="background:' + st.bgColor + ';border:' + st.borderWidth + 'px '
          + st.borderStyle + ' ' + st.borderColor + ';border-radius:' + st.radius + 'px;"></div>';
      case "badge":
        return '<span class="wuis-badge" style="background:' + st.bgColor + ';color:' + st.textColor
          + ';font-size:' + st.fontSize + 'px;">' + esc(p.text || "NEW") + '</span>';
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

    const t = d.querySelector(".wuis-text");
    if (t) t.addEventListener("dblclick", e => {
      e.stopPropagation();
      startTextEdit(d, el, t);
    });

    d.addEventListener("mousedown", e => {
      if (editing) return;
      if (e.target.classList.contains("h")) return;
      selectEl(el.id);
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
    dragState = {
      mode: "move", el, startX: e.clientX, startY: e.clientY,
      ox: el.x, oy: el.y, stageRect: rect, moved: false
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  }

  function startResize(e, d, el, dir) {
    const rect = stageEl().getBoundingClientRect();
    dragState = {
      mode: "resize", el, dir, startX: e.clientX, startY: e.clientY,
      ox: el.x, oy: el.y, ow: el.w, oh: el.h, stageRect: rect
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
      ds.el.x = nx; ds.el.y = ny;
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
      ds.el.x = x; ds.el.y = y; ds.el.w = w; ds.el.h = h;
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
  function selectEl(id) {
    if (state.selectedId === id) { refreshSelection(); return; }
    state.selectedId = id;
    refreshSelection();
    renderInspector();
    renderLayers();
    updateSelInfo();
  }
  function refreshSelection() {
    $$("#stage .el").forEach(n => {
      n.classList.toggle("selected", n.dataset.id === state.selectedId);
    });
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

    h += '<div class="ip-group"><div class="ip-title">位置与尺寸</div>';
    h += numRow("X", "x", el.x, 0, 9999) + numRow("Y", "y", el.y, 0, 9999);
    h += numRow("宽度", "w", el.w, 12, 9999) + numRow("高度", "h", el.h, 12, 9999);
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

    h += '<div class="ip-group"><div class="ip-title">外观</div>';
    h += colorRow("背景色", "bgColor", st.bgColor);
    h += colorRow("文字色", "textColor", st.textColor);
    h += numRow("字号", "fontSize", st.fontSize, 8, 200);
    h += '<div class="prop"><label>粗体</label><input type="checkbox" class="chk" data-s="bold"></div>';
    h += numRow("圆角", "radius", st.radius, 0, 200);
    h += numRow("旋转", "rotate", st.rotate, -360, 360);
    h += rangeRow("不透明度", "opacity", Math.round(st.opacity * 100), 5, 100);
    h += numRow("层级 z", "z", st.z, -9999, 9999);
    h += colorRow("边框色", "borderColor", st.borderColor);
    h += numRow("边框宽", "borderWidth", st.borderWidth, 0, 20);
    h += '</div>';

    h += '<div class="ip-group"><div class="ip-title">交互</div>';
    if (el.type === "switch" || el.type === "checkbox" || el.type === "radio" || el.type === "slider" || el.type === "progress") {
      h += colorRow("强调色", "accentColor", st.accentColor);
    }
    if (el.type === "progress") h += colorRow("轨道色", "trackColor", st.trackColor) + colorRow("进度色", "fillColor", st.fillColor);
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
    }
    return h;
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
    return '<div class="prop"><label>' + label + '</label><input type="color" data-s="' + key + '"><input type="text" class="hex" data-s="' + key + '-hex"></div>';
  }
  function colorRowP(label, key, val) {
    return '<div class="prop"><label>' + label + '</label><input type="color" data-p="' + key + '"><input type="text" class="hex" data-p="' + key + '-hex"></div>';
  }
  function rangeRow(label, key, val, min, max) {
    return '<div class="prop"><label>' + label + '</label><input type="range" data-s="' + key + '" min="' + min + '" max="' + max + '"><span class="range-val"></span></div>';
  }
  function opt(v, t, cur) {
    return '<option value="' + v + '"' + (cur === v ? " selected" : "") + '>' + t + '</option>';
  }

  function bindInspector(el) {
    const ip = $("#inspector");
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
    ip.querySelectorAll("[data-icmd]").forEach(b => {
      b.addEventListener("click", () => {
        const cmd = b.dataset.icmd;
        if (cmd === "duplicate") duplicate();
        else if (cmd === "delete") delSelected();
        else if (cmd === "top") zTop();
        else if (cmd === "bottom") zBottom();
        else if (cmd === "pickimg") pickImage(el);
      });
    });
  }

  function updateInspectorValues(el) {
    const ip = $("#inspector");
    ip.querySelectorAll("input[type=number][data-s]").forEach(inp => { inp.value = el.style[inp.dataset.s]; });
    ip.querySelectorAll("input[type=number][data-p]").forEach(inp => { inp.value = el.props[inp.dataset.p]; });
    ip.querySelectorAll("input[type=text][data-p]").forEach(inp => { inp.value = el.props[inp.dataset.p] || ""; });
    ip.querySelectorAll("textarea[data-p]").forEach(ta => { ta.value = el.props[ta.dataset.p] || ""; });
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
        + '<span class="li-name">' + TYPE_NAMES[el.type] + '</span>'
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
    if (!state.selectedId) return;
    state.elements = state.elements.filter(e => e.id !== state.selectedId);
    state.selectedId = null;
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
  }

  function duplicate() {
    const el = selEl();
    if (!el) return;
    const cp = JSON.parse(JSON.stringify(el));
    cp.id = genId();
    cp.x += 24; cp.y += 24;
    state.elements.push(cp);
    state.selectedId = cp.id;
    renderStage(); renderLayers(); renderInspector(); updateCount(); pushHistory();
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
      { type: "container", name: "容器", wide: true }
    ];
    grid.innerHTML = "";
    PALETTE.forEach(it => {
      const item = document.createElement("div");
      item.className = "pal-item" + (it.wide ? " wide" : "");
      item.innerHTML = '<span class="pal-icon">' + (ICON[it.type] || "") + '</span><span class="pal-name">' + it.name + '</span>';
      grid.appendChild(item);

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

  /* ---------- 画布设置 ---------- */
  function bindCanvasSettings() {
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
  }
  function syncCanvasPanel() {
    $("#cv-w").value = state.stage.w;
    $("#cv-h").value = state.stage.h;
    $("#cv-bg").value = state.stage.bg;
    $("#cv-bg-hex").value = state.stage.bg;
    $("#cv-grid").checked = state.stage.grid;
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
    $("#sb-sel").textContent = state.selectedId ? TYPE_NAMES[elById(state.selectedId).type] + " (已选中)" : "未选中";
  }
  function updateCoord() {
    const el = selEl();
    $("#sb-coord").textContent = el ? "X " + el.x + "  Y " + el.y + "  W " + el.w + "  H " + el.h : "";
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
      + '<div style="font-size:20px;font-weight:700;color:#d7dbe1;">WebUI Studio v1.0.0</div>'
      + '<div style="color:#8a8f98;margin-top:6px;">网页 UI 制作软件 · 拖拽式可视化设计</div>'
      + '<div style="color:#6b7180;margin-top:4px;">PySide6 + QWebEngineView</div>'
      + '</div>');
  }

  /* ---------- 项目保存 / 打开 / 导出 / 预览 ---------- */
  function projectJSON() {
    return JSON.stringify({ version: 1, title: state.title, stage: state.stage, elements: state.elements }, null, 2);
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
        if (!data || !Array.isArray(data.elements)) throw new Error("格式不正确");
        state.title = data.title || "未命名页面";
        state.stage = Object.assign({ w: 1280, h: 720, bg: "#ffffff", grid: true }, data.stage);
        state.elements = data.elements;
        state.selectedId = null;
        history = [snapshot()];
        histIdx = 0;
        renderStage(); renderLayers(); renderInspector(); updateCount(); syncCanvasPanel();
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
    state.stage = { w: 1280, h: 720, bg: "#ffffff", grid: true };
    state.elements = [];
    state.selectedId = null;
    history = [snapshot()];
    histIdx = 0;
    renderStage(); renderLayers(); renderInspector(); updateCount(); syncCanvasPanel();
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
      case "zoomIn": zoomIn(); break;
      case "zoomOut": zoomOut(); break;
      case "zoom100": zoom100(); break;
      case "toggleSnap":
        snap = !snap;
        $("#menu-snap").textContent = "网格吸附: " + (snap ? "开" : "关");
        toast("网格吸附已" + (snap ? "开启" : "关闭"));
        break;
      case "help": showHelp(); break;
      case "about": showAbout(); break;
    }
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
    $("#rail-bg").addEventListener("click", () => switchPanel("canvas"));
  }

  function switchPanel(name) {
    $("#panel-components").classList.toggle("hidden", name !== "components");
    $("#panel-layers").classList.toggle("hidden", name !== "layers");
    $("#panel-canvas").classList.toggle("hidden", name !== "canvas");
    $$(".rail-btn").forEach(b => b.classList.remove("active"));
    $("#rail-" + name).classList.add("active");
    if (name === "layers") renderLayers();
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
      else if (e.key === "v" || e.key === "V") { switchTool("move"); }
      else if (e.key === "b" || e.key === "B") { switchTool("paint"); }
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
    renderStage();
    setupPalette();
    bindCanvasSettings();
    renderInspector();
    renderLayers();
    updateCount();
    updateSelInfo();
    setupMenus();
    setupToolbar();
    setupKeys();
    setupBridge();
    switchTool("move");
    $("#menu-snap").textContent = "网格吸附: 开";
    window.setTimeout(zoomFit, 80);
    window.addEventListener("resize", () => { /* 不做自动缩放 */ });
  }

  window.App = { action: action };

  document.addEventListener("DOMContentLoaded", init);
})();
