/* =====================================================
   WebUI Studio - 导出 HTML 生成器
   将当前设计导出为独立可用的单文件 HTML
   ===================================================== */
"use strict";

const WUIS_EXPORTER = (function () {

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* 组件的导出 HTML 主体（不含外层定位容器，由 buildEl 包裹） */
  function innerHTML(type, p, st) {
    switch (type) {
      case "button": {
        const bg = st.bgColor || "#2f5cff";
        return `<button class="wuis-btn" style="background:${bg};color:${st.textColor};font-size:${st.fontSize}px;font-weight:${st.bold ? "700" : "400"};border-radius:${st.radius}px;">${escAttr(p.text || "按钮")}</button>`;
      }
      case "text": {
        const align = p.align || "left";
        return `<div class="wuis-text" style="color:${st.textColor};font-size:${st.fontSize}px;font-weight:${st.bold ? "700" : "400"};justify-content:${align === "left" ? "flex-start" : align === "center" ? "center" : "flex-end"};">${escAttr(p.text || "双击编辑文字")}</div>`;
      }
      case "switch": {
        const on = p.checked ? " on" : "";
        const ac = st.accentColor || "#2f5cff";
        return `<div class="wuis-switch${on}" data-acc="${escAttr(ac)}"><div class="sw-track"><div class="sw-thumb"></div></div><span class="sw-label">${escAttr(p.label || "开关")}</span></div>`;
      }
      case "input": {
        return `<input class="wuis-input" type="text" placeholder="${escAttr(p.placeholder || "请输入…")}" value="${escAttr(p.text || "")}" style="font-size:${st.fontSize}px;color:${st.textColor};border-radius:${st.radius}px;border:${st.borderWidth}px solid ${st.borderColor};background:${st.bgColor};">`;
      }
      case "slider": {
        return `<div class="wuis-slider"><input type="range" min="${p.min}" max="${p.max}" value="${p.value}" style="accent-color:${st.accentColor}"><span class="sl-val">${p.value}</span></div>`;
      }
      case "select": {
        const opts = String(p.options || "").split(",").map(s => s.trim()).filter(Boolean);
        return `<select class="wuis-select" style="font-size:${st.fontSize}px;color:${st.textColor};border-radius:${st.radius}px;">${opts.map(o => `<option>${escAttr(o)}</option>`).join("")}</select>`;
      }
      case "checkbox": {
        return `<label class="wuis-check"><input type="checkbox"${p.checked ? " checked" : ""} style="accent-color:${st.accentColor}"><span class="ck-label">${escAttr(p.label || "复选框")}</span></label>`;
      }
      case "radio": {
        return `<label class="wuis-radio"><input type="radio" name="${escAttr(p.name || "radio")}"${p.checked ? " checked" : ""} style="accent-color:${st.accentColor}"><span class="rd-label">${escAttr(p.label || "单选")}</span></label>`;
      }
      case "image": {
        const src = p.src || "";
        return `<img class="wuis-img" src="${escAttr(src)}" alt="" style="border-radius:${st.radius}px;object-fit:${p.fit || "cover"};">`;
      }
      case "progress": {
        const pct = Math.max(0, Math.min(100, (p.value / Math.max(1, p.max)) * 100));
        return `<div class="wuis-progress"><div class="pr-track" style="background:${st.trackColor}"><div class="pr-fill" style="width:${pct}%;background:${st.fillColor}"></div></div><span class="pr-val">${pct | 0}%</span></div>`;
      }
      case "divider": {
        const styleMap = { solid: "solid", dashed: "dashed", dotted: "dotted" };
        const b = styleMap[p.style2] || "solid";
        return `<div class="wuis-divider"><div style="width:100%;border-top:${p.thickness}px ${b} ${escAttr(p.color || "#d0d5dd")};"></div></div>`;
      }
      case "container": {
        return `<div class="wuis-container" style="background:${st.bgColor};border:${st.borderWidth}px ${st.borderStyle || "solid"} ${st.borderColor};border-radius:${st.radius}px;"></div>`;
      }
      case "badge": {
        return `<span class="wuis-badge" style="background:${st.bgColor};color:${st.textColor};font-size:${st.fontSize}px;">${escAttr(p.text || "NEW")}</span>`;
      }
      default:
        return "";
    }
  }

  /* 每个元素的完整导出节点 */
  function buildEl(el) {
    const st = el.style;
    const common = [
      `left:${el.x}px`, `top:${el.y}px`, `width:${el.w}px`, `height:${el.h}px`,
      `opacity:${st.opacity}`, `transform:rotate(${st.rotate}deg)`, `z-index:${st.z}`
    ].join(";");
    return `<div class="wuis-ct" data-type="${escAttr(el.type)}" style="${common}">${innerHTML(el.type, el.props, st)}</div>`;
  }

  /* 导出完整页面 */
  function exportHTML(state) {
    const st = state.stage;
    const els = state.elements.slice().sort((a, b) => (a.style.z || 1) - (b.style.z || 1));
    const parts = els.map(buildEl).join("\n    ");
    const bodyBg = st.bg || "#ffffff";

    const runtime = `
  /* 交互运行时：开关/滑块/进度条/下拉等 */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.wuis-switch').forEach(function (sw) {
      sw.addEventListener('click', function () {
        sw.classList.toggle('on');
      });
    });
    document.querySelectorAll('.wuis-slider input').forEach(function (inp) {
      var val = inp.parentElement.querySelector('.sl-val');
      inp.addEventListener('input', function () { if (val) val.textContent = inp.value; });
    });
    document.querySelectorAll('.wuis-progress').forEach(function (pr) {
      var fill = pr.querySelector('.pr-fill'); var val = pr.querySelector('.pr-val');
      if (fill && val) {
        var track = pr.querySelector('.pr-track');
        var handle = new MutationObserver(function () { });
      }
    });
    document.querySelectorAll('.wuis-btn').forEach(function (b) {
      b.addEventListener('click', function () { b.style.filter = 'brightness(.85)'; setTimeout(function(){ b.style.filter=''; }, 120); });
    });
  });`;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escAttr(state.title || "WebUI Studio 导出页面")}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; background: #eef0f4; padding: 24px; font-family: "Segoe UI", "Microsoft YaHei", system-ui, sans-serif; }
  .wuis-page { position: relative; width: ${st.w}px; height: ${st.h}px; background: ${bodyBg}; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.18); }
  .wuis-ct { position: absolute; }
  .wuis-btn { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; white-space: nowrap; overflow: hidden; transition: filter .1s, transform .1s; }
  .wuis-btn:hover { filter: brightness(1.08); }
  .wuis-text { width: 100%; height: 100%; display: flex; align-items: center; white-space: pre-wrap; word-break: break-word; line-height: 1.4; }
  .wuis-switch { width: 100%; height: 100%; display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .wuis-switch .sw-track { width: 46px; height: 26px; border-radius: 13px; background: #c9ced6; position: relative; transition: background .18s; flex-shrink: 0; }
  .wuis-switch .sw-thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .18s; }
  .wuis-switch.on .sw-track { background: #2f5cff; }
  .wuis-switch.on .sw-thumb { transform: translateX(20px); }
  .wuis-switch .sw-label { font-size: 14px; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wuis-input { width: 100%; height: 100%; border: 1.5px solid #c9ced6; border-radius: 8px; padding: 0 12px; font-size: 14px; outline: none; }
  .wuis-input:focus { border-color: #4f8cff; box-shadow: 0 0 0 3px rgba(79,140,255,.18); }
  .wuis-slider { width: 100%; height: 100%; display: flex; align-items: center; gap: 10px; }
  .wuis-slider input { flex: 1; height: 6px; }
  .wuis-slider .sl-val { min-width: 34px; text-align: right; font-size: 12.5px; color: #555; font-variant-numeric: tabular-nums; }
  .wuis-select { width: 100%; height: 100%; border: 1.5px solid #c9ced6; border-radius: 8px; padding: 0 10px; font-size: 14px; outline: none; }
  .wuis-check, .wuis-radio { width: 100%; height: 100%; display: flex; align-items: center; gap: 9px; cursor: pointer; font-size: 14px; color: #222; }
  .wuis-check input, .wuis-radio input { width: 17px; height: 17px; accent-color: #2f5cff; cursor: pointer; flex-shrink: 0; }
  .wuis-img { width: 100%; height: 100%; object-fit: cover; display: block; background: #eef1f5; }
  .wuis-progress { width: 100%; height: 100%; display: flex; align-items: center; gap: 10px; }
  .wuis-progress .pr-track { flex: 1; height: 10px; border-radius: 5px; background: #e4e8ee; overflow: hidden; }
  .wuis-progress .pr-fill { height: 100%; border-radius: 5px; transition: width .2s; }
  .wuis-progress .pr-val { min-width: 34px; text-align: right; font-size: 12.5px; color: #555; font-variant-numeric: tabular-nums; }
  .wuis-divider { width: 100%; height: 100%; display: flex; align-items: center; }
  .wuis-container { width: 100%; height: 100%; }
  .wuis-badge { width: 100%; height: 100%; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; font-weight: 600; white-space: nowrap; padding: 0 4px; }
</style>
</head>
<body>
  <div class="wuis-page">
    ${parts}
  </div>
<script>${runtime}</script>
</body>
</html>`;
  }

  return { exportHTML: exportHTML };
})();
