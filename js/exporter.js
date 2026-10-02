/* =====================================================
   WebUI Studio - 导出 HTML 生成器 v2
   将设计导出为独立可交互 HTML：多页面 / 点击事件 /
   过渡动画 / 动态显隐 / 响应式缩放
   ===================================================== */
"use strict";

const WUIS_EXPORTER = (function () {

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const PALETTE = ["#4f8cff", "#29c4a9", "#ff9f43", "#f5576c", "#8e5cf7", "#f7b731", "#2dd4bf", "#a78bfa"];

  /* 图标（按钮/徽章/文字前缀） */
  function iconSVG(name) {
    const I = {
      none: "",
      arrow: '<path d="M4 12h14M13 6l6 6-6 6"/>',
      star: '<path d="M12 3l2.7 5.9 6.3.7-4.7 4.3 1.3 6.1L12 16.9 6.4 20l1.3-6.1L3 9.6l6.3-.7Z"/>',
      heart: '<path d="M12 20s-7-4.3-7-9.5A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7 3.5C19 15.7 12 20 12 20Z"/>',
      check: '<path d="m5 12 5 5 9-10"/>',
      cross: '<path d="M6 6l12 12M18 6 6 18"/>',
      search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>',
      gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
      upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
      play: '<path d="M7 4.5v15l13-7.5Z"/>',
      pause: '<path d="M7 4v16M17 4v16"/>',
      cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 11.5h10.2L21 7H6"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.6-6 8-6s6.8 2 8 6"/>',
      home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
      warn: '<path d="M12 3 2.5 20h19Z"/><path d="M12 10v4M12 17h.01"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      minus: '<path d="M5 12h14"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
      bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'
    };
    const d = I[name] || "";
    return '<span class="wuis-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg></span>';
  }

  /* 组件导出主体（不含定位容器） */
  function innerHTML(type, p, st, w, h) {
    const fontF = st.fontFamily ? "font-family:" + st.fontFamily + ";" : "";
    const ic = iconSVG(p.icon);
    switch (type) {
      case "button": {
        const bg = st.bgGradient || st.bgColor || "#2f5cff";
        return '<button class="wuis-btn" style="background:' + bg + ';color:' + (st.textColor || "#fff") + ';font-size:' + st.fontSize + 'px;font-weight:' + (st.bold ? "700" : "400") + ';border-radius:' + st.radius + 'px;' + fontF + '">' + ic + esc(p.text || "按钮") + "</button>";
      }
      case "text": {
        const align = p.align || "left";
        const jc = align === "left" ? "flex-start" : align === "center" ? "center" : "flex-end";
        return '<div class="wuis-text" style="color:' + (st.textColor || "#222") + ';font-size:' + st.fontSize + 'px;font-weight:' + (st.bold ? "700" : "400") + ';justify-content:' + jc + ';' + fontF + '">' + ic + esc(p.text || "双击编辑文字") + "</div>";
      }
      case "switch": {
        const on = p.checked ? " on" : "";
        return '<div class="wuis-switch' + on + '" data-acc="' + esc(st.accentColor || "#2f5cff") + '"><div class="sw-track"><div class="sw-thumb"></div></div><span class="sw-label">' + esc(p.label || "开关") + "</span></div>";
      }
      case "input": {
        return '<input class="wuis-input" type="text" placeholder="' + esc(p.placeholder || "请输入…") + '" value="' + esc(p.text || "") + '" style="font-size:' + st.fontSize + 'px;color:' + st.textColor + ';border-radius:' + st.radius + 'px;border:' + st.borderWidth + 'px solid ' + st.borderColor + ';background:' + st.bgColor + ';' + fontF + '">';
      }
      case "slider": {
        return '<div class="wuis-slider"><input type="range" min="' + (p.min || 0) + '" max="' + (p.max || 100) + '" value="' + p.value + '" style="accent-color:' + (st.accentColor || "#2f5cff") + '"><span class="sl-val">' + p.value + "</span></div>";
      }
      case "select": {
        const opts = String(p.options || "").split(",").map(s => s.trim()).filter(Boolean);
        return '<select class="wuis-select" style="font-size:' + st.fontSize + 'px;color:' + st.textColor + ';border-radius:' + st.radius + 'px;' + fontF + '">' + opts.map(o => "<option>" + esc(o) + "</option>").join("") + "</select>";
      }
      case "checkbox": {
        return '<label class="wuis-check"><input type="checkbox"' + (p.checked ? " checked" : "") + ' style="accent-color:' + (st.accentColor || "#2f5cff") + '"><span class="ck-label">' + esc(p.label || "复选框") + "</span></label>";
      }
      case "radio": {
        return '<label class="wuis-radio"><input type="radio" name="' + esc(p.name || "radio") + '"' + (p.checked ? " checked" : "") + ' style="accent-color:' + (st.accentColor || "#2f5cff") + '"><span class="rd-label">' + esc(p.label || "单选") + "</span></label>";
      }
      case "image": {
        return '<img class="wuis-img" src="' + esc(p.src || "") + '" alt="" style="border-radius:' + st.radius + 'px;object-fit:' + (p.fit || "cover") + ';">';
      }
      case "progress": {
        const pct = Math.max(0, Math.min(100, (p.value / Math.max(1, p.max || 1)) * 100));
        return '<div class="wuis-progress" data-pct="' + pct + '"><div class="pr-track" style="background:' + (st.trackColor || "#e4e8ee") + '"><div class="pr-fill" style="width:' + pct + "%;background:" + (st.fillColor || "#2f5cff") + '"></div></div><span class="pr-val">' + Math.round(pct) + "%</span></div>";
      }
      case "divider": {
        const styleMap = { solid: "solid", dashed: "dashed", dotted: "dotted", double: "double", groove: "groove", ridge: "ridge" };
        const b = styleMap[p.style2] || "solid";
        return '<div class="wuis-divider"><div style="width:100%;border-top:' + (p.thickness || 2) + "px " + b + " " + esc(p.color || "#d0d5dd") + ';"></div></div>';
      }
      case "container": {
        const bg = st.bgGradient || st.bgColor;
        return '<div class="wuis-container" style="background:' + bg + ';border:' + st.borderWidth + "px " + (st.borderStyle || "solid") + " " + st.borderColor + ";border-radius:" + st.radius + 'px;"></div>';
      }
      case "badge": {
        return '<span class="wuis-badge" style="background:' + (st.bgGradient || st.bgColor) + ";color:" + st.textColor + ";font-size:" + st.fontSize + "px;" + fontF + '">' + ic + esc(p.text || "NEW") + "</span>";
      }
      case "tabs": {
        const tabs = String(p.tabs || "标签一,标签二").split(",").map(s => s.trim()).filter(Boolean);
        const act = Math.min(p.active || 0, Math.max(0, tabs.length - 1));
        return '<div class="wuis-tabs"><div class="wt-head">' + tabs.map((t, i) => '<span class="wt-tab' + (i === act ? " on" : "") + '">' + esc(t) + "</span>").join("") + '</div><div class="wt-body">' + esc(tabs[act] || "") + " 的内容</div></div>";
      }
      case "card": {
        return '<div class="wuis-card" style="' + fontF + '"><div class="wc-title">' + esc(p.title || "卡片标题") + '</div><div class="wc-body">' + esc(p.content || "卡片内容，可双击编辑文字组件，或在属性面板修改。") + "</div></div>";
      }
      case "chart": {
        return '<div class="wuis-chart">' + chartSVG(p.type || "bar", p.data, p.labels, p.colors, w, h) + "</div>";
      }
      case "table": {
        const rows = String(p.rows || "标题|数量|价格\n苹果|3|15\n香蕉|5|20").trim().split("\n").map(r => r.split("|").map(c => c.trim()));
        const head = rows.shift() || [];
        const th = head.map(c => "<th>" + esc(c) + "</th>").join("");
        const td = rows.map(r => "<tr>" + (head.length ? r.map((c, i) => "<td>" + esc(c) + "</td>").join("") : "<td>" + esc(r.join(" ")) + "</td>") + "</tr>").join("");
        return '<div class="wuis-table" style="' + fontF + '"><table><thead><tr>' + th + "</tr></thead><tbody>" + td + "</tbody></table></div>";
      }
      case "video": {
        if (p.src) {
          return '<div class="wuis-video"><video controls src="' + esc(p.src) + '" poster="' + esc(p.poster || "") + '"></video></div>';
        }
        return '<div class="wuis-video"><div class="vd-ph"><b>视频组件</b>请在属性面板设置视频 URL</div></div>';
      }
      case "date": {
        return '<input class="wuis-date" type="date" value="' + esc(p.value || "") + '" placeholder="' + esc(p.placeholder || "") + '" style="' + fontF + '">';
      }
      case "modal": {
        return '<div class="wuis-modal"><button class="wm-btn" style="background:' + (st.bgGradient || st.bgColor || "#2f5cff") + ";border-radius:" + st.radius + 'px;">' + esc(p.btnText || "打开弹窗") + '</button></div>'
          + '<div class="wuis-modal-pop"><div class="wmp-box"><div class="wmp-title">' + esc(p.title || "弹窗标题") + '</div><div class="wmp-body">' + esc(p.content || "弹窗内容") + '</div><div class="wmp-foot"><button class="wmp-close">关闭</button></div></div></div>';
      }
      default:
        return "";
    }
  }

  /* 图表 SVG 生成 */
  function chartSVG(type, data, labels, colors, w, h) {
    const vals = String(data || "").split(",").map(s => parseFloat(s) || 0);
    const labs = String(labels || "").split(",").map(s => s.trim());
    const cs = String(colors || "").split(",").map(s => s.trim()).filter(Boolean);
    const C = cs.length ? cs : PALETTE;
    const W = Math.max(60, w || 300), H = Math.max(60, h || 180);
    if (type === "pie") {
      const total = vals.reduce((a, b) => a + b, 0);
      if (total <= 0) return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet"></svg>';
      const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 12;
      let a0 = -Math.PI / 2, paths = "", legend = "";
      vals.forEach((v, i) => {
        const a1 = a0 + (v / total) * Math.PI * 2;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const large = (a1 - a0) > Math.PI ? 1 : 0;
        paths += '<path d="M' + cx.toFixed(1) + "," + cy.toFixed(1) + " L" + x0.toFixed(1) + "," + y0.toFixed(1) + " A" + r.toFixed(1) + "," + r.toFixed(1) + " 0 " + large + " 1 " + x1.toFixed(1) + "," + y1.toFixed(1) + ' Z" fill="' + C[i % C.length] + '"></path>';
        a0 = a1;
      });
      return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet"><g>' + paths + "</g></svg>";
    }
    const padT = 14, padR = 8, padB = 22, padL = 34;
    const iw = W - padL - padR, ih = H - padT - padB;
    const maxV = Math.max(1, Math.max.apply(null, vals));
    const n = Math.max(1, vals.length);
    let grid = "", bars = "", lines = "", pts = "";
    for (let g = 0; g <= 4; g++) {
      const y = padT + ih - (ih * g) / 4;
      grid += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '" stroke="#eef0f4"></line>';
    }
    vals.forEach((v, i) => {
      const x = padL + (iw * (i + 0.5)) / n;
      const bh = (v / maxV) * ih;
      if (type === "bar") {
        const bw = Math.min(34, iw / n * 0.6);
        bars += '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + (padT + ih - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="3" fill="' + C[i % C.length] + '"></rect>';
        if (labs[i]) bars += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#8a8f98">' + esc(labs[i]) + "</text>";
      } else {
        pts += (i ? " L" : "M") + x.toFixed(1) + " " + (padT + ih - bh).toFixed(1);
        if (labs[i]) lines += '<text x="' + x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="10" fill="#8a8f98">' + esc(labs[i]) + "</text>";
      }
    });
    if (type === "line") {
      const poly = '<polyline points="' + pts.replace(/[ML]/g, m => m === "M" ? "" : " ").trim() + '" fill="none" stroke="' + C[0] + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>';
      const area = '<polygon points="' + pts.replace(/M/, "").replace(/L/g, " ").trim() + " " + (padL + iw) + " " + (padT + ih) + " " + padL + " " + (padT + ih) + '" fill="' + C[0] + '" opacity=".12"></polygon>';
      return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet"><g>' + grid + area + poly + lines + "</g></svg>";
    }
    return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet"><g>' + grid + bars + "</g></svg>";
  }

  /* 单个元素导出节点 */
  function buildEl(el) {
    const st = el.style || {};
    const common = "left:" + el.x + "px;top:" + el.y + "px;width:" + el.w + "px;height:" + el.h + "px;opacity:" + (st.opacity || 1) + ";transform:rotate(" + (st.rotate || 0) + "deg);z-index:" + (st.z || 1);
    let extra = "";
    if (st.bgGradient && el.type !== "button" && el.type !== "badge" && el.type !== "container" && el.type !== "modal") extra += "background:" + st.bgGradient + ";";
    if (st.shadow && st.shadow !== "none") extra += "box-shadow:" + st.shadow + ";";
    if (st.fontFamily) extra += "font-family:" + st.fontFamily + ";";
    const anim = (el.props && el.props.showAnimation && el.props.showAnimation !== "none") ? ' data-anim="' + esc(el.props.showAnimation) + '"' : "";
    const adur = (el.props && el.props.showAnimation !== "none" && el.props.animDuration) ? ' style="--anim-dur:' + el.props.animDuration + "ms\"" : "";
    const act = (el.props && el.props.clickAction && el.props.clickAction !== "none") ? ' data-action="' + esc(el.props.clickAction) + '"' : "";
    const tgt = (el.props && (el.props.clickAction === "link" || el.props.clickAction === "page" || el.props.clickAction === "toggle") && el.props.clickTarget) ? ' data-target="' + esc(el.props.clickTarget) + '"' : "";
    const hidden = (el.visible === false) ? ' style="display:none;"' : "";
    return '<div class="wuis-ct el" data-el-id="' + esc(el.id) + '" data-type="' + esc(el.type) + '"' + act + tgt + anim + ' style="' + common + ";" + extra + '">' + innerHTML(el.type, el.props, st, el.w, el.h) + "</div>" + (hidden ? "" : "");
  }

  const EXPORT_CSS = `*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;background:#eef0f4;font-family:"Segoe UI","Microsoft YaHei",system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;overflow:auto}
.wuis-nav{display:flex;gap:4px;background:#fff;border:1px solid #dfe4ea;border-radius:8px;padding:5px;margin:14px 0 0;box-shadow:0 3px 12px rgba(0,0,0,.07);position:sticky;top:10px;z-index:50;max-width:94vw;overflow-x:auto}
.wuis-nav button{border:none;background:transparent;padding:7px 16px;border-radius:6px;font-size:13px;color:#666;cursor:pointer;white-space:nowrap}
.wuis-nav button:hover{background:#f1f4f8;color:#222}
.wuis-nav button.on{background:#4f8cff;color:#fff;font-weight:600}
.wuis-pages{position:relative;margin:16px 0 40px;transform-origin:top center}
.wuis-page{position:relative;overflow:hidden;box-shadow:0 12px 44px rgba(0,0,0,.2);display:none}
.wuis-page:first-child{display:block}
.wuis-ct{position:absolute}
.wuis-ic{display:inline-flex;align-items:center;justify-content:center;margin-right:6px;flex-shrink:0}
.wuis-ic svg{width:1.05em;height:1.05em;display:block}
.wuis-btn{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;white-space:nowrap;overflow:hidden;transition:filter .1s,transform .1s}
.wuis-btn:hover{filter:brightness(1.08)}
.wuis-text{width:100%;height:100%;display:flex;align-items:center;white-space:pre-wrap;word-break:break-word;line-height:1.4}
.wuis-switch{width:100%;height:100%;display:flex;align-items:center;gap:10px;cursor:pointer}
.wuis-switch .sw-track{width:46px;height:26px;border-radius:13px;background:#c9ced6;position:relative;transition:background .18s;flex-shrink:0}
.wuis-switch .sw-thumb{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .18s}
.wuis-switch.on .sw-track{background:#2f5cff}
.wuis-switch.on .sw-thumb{transform:translateX(20px)}
.wuis-switch .sw-label{font-size:14px;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wuis-input{width:100%;height:100%;border:1.5px solid #c9ced6;border-radius:8px;padding:0 12px;font-size:14px;outline:none;background:#fff;color:#222}
.wuis-input:focus{border-color:#4f8cff;box-shadow:0 0 0 3px rgba(79,140,255,.18)}
.wuis-slider{width:100%;height:100%;display:flex;align-items:center;gap:10px}
.wuis-slider input{flex:1;height:6px;cursor:ew-resize}
.wuis-slider .sl-val{min-width:34px;text-align:right;font-size:12.5px;color:#555;font-variant-numeric:tabular-nums}
.wuis-select{width:100%;height:100%;border:1.5px solid #c9ced6;border-radius:8px;padding:0 10px;font-size:14px;outline:none;background:#fff;color:#222}
.wuis-check,.wuis-radio{width:100%;height:100%;display:flex;align-items:center;gap:9px;cursor:pointer;font-size:14px;color:#222}
.wuis-check input,.wuis-radio input{width:17px;height:17px;accent-color:#2f5cff;cursor:pointer;flex-shrink:0}
.wuis-check .ck-label,.wuis-radio .rd-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wuis-img{width:100%;height:100%;object-fit:cover;display:block;background:#eef1f5}
.wuis-progress{width:100%;height:100%;display:flex;align-items:center;gap:10px}
.wuis-progress .pr-track{flex:1;height:10px;border-radius:5px;background:#e4e8ee;overflow:hidden}
.wuis-progress .pr-fill{height:100%;border-radius:5px;transition:width .25s}
.wuis-progress .pr-val{min-width:34px;text-align:right;font-size:12.5px;color:#555;font-variant-numeric:tabular-nums}
.wuis-divider{width:100%;height:100%;display:flex;align-items:center}
.wuis-container{width:100%;height:100%}
.wuis-badge{width:100%;height:100%;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-weight:600;white-space:nowrap;padding:0 6px}
.wuis-tabs{width:100%;height:100%;display:flex;flex-direction:column;background:#fff;border:1px solid #d6dbe3;border-radius:8px;overflow:hidden}
.wuis-tabs .wt-head{display:flex;border-bottom:1px solid #d6dbe3;background:#f7f9fb;flex-shrink:0;overflow-x:auto}
.wuis-tabs .wt-tab{padding:9px 15px;font-size:13px;color:#666;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
.wuis-tabs .wt-tab.on{color:#1f6bff;border-bottom-color:#1f6bff;background:rgba(31,107,255,.05);font-weight:600}
.wuis-tabs .wt-body{flex:1;padding:13px 15px;font-size:13px;color:#333;overflow:auto}
.wuis-card{width:100%;height:100%;background:#fff;border:1px solid #d6dbe3;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;display:flex;flex-direction:column}
.wuis-card .wc-title{padding:12px 15px;font-size:14px;font-weight:600;color:#222;border-bottom:1px solid #eef1f5;background:#fafbfc;flex-shrink:0}
.wuis-card .wc-body{flex:1;padding:13px 15px;font-size:13px;color:#444;line-height:1.7;overflow:auto}
.wuis-chart{width:100%;height:100%;background:#fff;border:1px solid #e4e8ee;border-radius:8px;overflow:hidden;display:flex}
.wuis-chart svg{width:100%;height:100%;display:block}
.wuis-table{width:100%;height:100%;overflow:auto;background:#fff;border:1px solid #dfe4ea;border-radius:8px}
.wuis-table table{width:100%;border-collapse:collapse;font-size:12.5px}
.wuis-table th{background:#f4f6f9;color:#333;font-weight:600;padding:8px 10px;border-bottom:1px solid #dfe4ea;text-align:left;white-space:nowrap}
.wuis-table td{padding:7px 10px;border-bottom:1px solid #eef1f5;color:#444}
.wuis-table tr:last-child td{border-bottom:none}
.wuis-table tr:hover td{background:#f8fafc}
.wuis-video{width:100%;height:100%;background:#0e0f11;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#8a8f98}
.wuis-video video{width:100%;height:100%;object-fit:cover;display:block;background:#000}
.wuis-video .vd-ph{text-align:center;font-size:11.5px;line-height:1.9}
.wuis-video .vd-ph b{color:#c2c7cf;display:block;font-size:13px}
.wuis-date{width:100%;height:100%;border:1.5px solid #c9ced6;border-radius:8px;padding:0 12px;font-size:14px;outline:none;background:#fff;color:#222}
.wuis-date:focus{border-color:#4f8cff;box-shadow:0 0 0 3px rgba(79,140,255,.18)}
.wuis-modal{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.wuis-modal .wm-btn{padding:10px 24px;background:#2f5cff;color:#fff;border:none;border-radius:7px;font-size:13.5px;font-weight:500;cursor:pointer}
.wuis-modal .wm-btn:hover{filter:brightness(1.08)}
.wuis-modal-pop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:none;align-items:center;justify-content:center}
.wuis-modal-pop.open{display:flex}
.wuis-modal-pop .wmp-box{background:#fff;border-radius:10px;width:min(420px,90vw);box-shadow:0 24px 60px rgba(0,0,0,.35);overflow:hidden}
.wuis-modal-pop .wmp-title{padding:13px 18px;font-size:14px;font-weight:600;color:#222;border-bottom:1px solid #eef1f5}
.wuis-modal-pop .wmp-body{padding:16px 18px;font-size:13px;color:#444;line-height:1.7}
.wuis-modal-pop .wmp-foot{padding:10px 18px 14px;text-align:right}
.wuis-modal-pop .wmp-close{padding:7px 20px;background:#f1f3f6;color:#333;border:none;border-radius:6px;font-size:12.5px;cursor:pointer}
.wuis-modal-pop .wmp-close:hover{background:#e5e8ee}
@keyframes wuis-fade-in{from{opacity:0}to{opacity:1}}
@keyframes wuis-slide-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes wuis-slide-left{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:none}}
@keyframes wuis-zoom-in{from{opacity:0;transform:scale(.72)}to{opacity:1;transform:none}}
@keyframes wuis-bounce-in{0%{opacity:0;transform:scale(.5)}60%{opacity:1;transform:scale(1.08)}80%{transform:scale(.96)}100%{opacity:1;transform:none}}
.el[data-anim="fadeIn"]{animation:wuis-fade-in var(--anim-dur,.4s) ease both}
.el[data-anim="slideUp"]{animation:wuis-slide-up var(--anim-dur,.4s) ease both}
.el[data-anim="slideLeft"]{animation:wuis-slide-left var(--anim-dur,.4s) ease both}
.el[data-anim="zoomIn"]{animation:wuis-zoom-in var(--anim-dur,.4s) ease both}
.el[data-anim="bounceIn"]{animation:wuis-bounce-in var(--anim-dur,.5s) ease both}`;

  const RUNTIME = `(function(){
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}
var PAGES=$$('.wuis-page');
var NAV=$$('.wuis-nav button');
var W=0,H=0;
if(PAGES.length){var pg=PAGES[0];var r=pg.getBoundingClientRect();W=r.width;H=r.height;}
function fit(){
  var wrap=document.querySelector('.wuis-pages');if(!wrap)return;
  var s=Math.min(1,(window.innerWidth-40)/W,(window.innerHeight-40)/H);
  if(!s||s<=0)s=1;
  wrap.style.transform='scale('+s+')';
}
function replay(pg){
  $$('.el[data-anim]',pg).forEach(function(el){el.style.animation='none';void el.offsetWidth;el.style.animation='';});
}
function showPage(i){
  PAGES.forEach(function(p,k){p.style.display=(k===i)?'block':'none';});
  NAV.forEach(function(b,k){b.classList.toggle('on',k===i);});
  replay(PAGES[i]);fit();window.scrollTo(0,0);
}
NAV.forEach(function(b,k){b.addEventListener('click',function(){showPage(k);});});
$$('.wuis-switch').forEach(function(sw){
  sw.addEventListener('click',function(){
    var st=sw.querySelector('.sw-track');var c=sw.getAttribute('data-acc')||'#2f5cff';
    sw.classList.toggle('on');
    if(st)st.style.background=sw.classList.contains('on')?c:'';
  });
});
$$('.wuis-slider input').forEach(function(inp){
  inp.addEventListener('input',function(){var v=inp.parentElement.querySelector('.sl-val');if(v)v.textContent=inp.value;});
});
$$('.wuis-tabs').forEach(function(t){
  var tabs=$$('.wt-tab',t),body=t.querySelector('.wt-body');
  tabs.forEach(function(tab,k){
    tab.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('on');});tab.classList.add('on');
      if(body){var cur=tabs[k]?tabs[k].textContent:'';body.textContent=cur+' 的内容';}
    });
  });
});
$$('.wuis-modal .wm-btn').forEach(function(b){
  b.addEventListener('click',function(e){
    e.stopPropagation();
    var ct=b.closest('.wuis-ct');
    var pop=ct?ct.querySelector('.wuis-modal-pop'):null;
    if(pop)pop.classList.add('open');
  });
});
document.addEventListener('click',function(e){
  var t=e.target;
  if(t.classList&&t.classList.contains('wmp-close')){var p=t.closest('.wuis-modal-pop');if(p)p.classList.remove('open');}
  else if(t.classList&&t.classList.contains('wuis-modal-pop')){t.classList.remove('open');}
  var ct=t.closest?t.closest('.wuis-ct[data-action]'):null;
  if(!ct)return;
  var act=ct.getAttribute('data-action'),tar=ct.getAttribute('data-target');
  if(act==='link'&&tar){window.open(tar,'_blank');}
  else if(act==='page'){var idx=parseInt(tar,10);if(!isNaN(idx)&&idx>=0&&idx<PAGES.length)showPage(idx);}
  else if(act==='modal'){var pop=ct.querySelector('.wuis-modal-pop');if(pop)pop.classList.add('open');}
  else if(act==='toggle'&&tar){var tgt=document.querySelector('.el[data-el-id="'+tar+'"]');if(tgt){tgt.style.display=(tgt.style.display==='none')?'':'none';}}
});
window.addEventListener('resize',fit);
document.addEventListener('DOMContentLoaded',function(){fit();replay(PAGES[0]);});
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fit);}else{fit();replay(PAGES[0]);}
})();`;

  /* 导出完整 HTML（多页面支持） */
  function exportHTML(state) {
    const st = state.stage || { w: 1280, h: 720, bg: "#ffffff", grid: true };
    const bodyBg = st.bg || "#ffffff";
    const pages = (state.pages && state.pages.length) ? state.pages : [{ id: "pg_1", name: "页面 1", elements: state.elements || [] }];
    const multi = pages.length > 1;

    const pageHtml = pages.map((pg, pi) => {
      const els = (pg.elements || []).slice().sort((a, b) => (a.style.z || 1) - (b.style.z || 1));
      const parts = els.map(buildEl).join("\n      ");
      return '    <div class="wuis-page" style="width:' + st.w + 'px;height:' + st.h + "px;background:" + bodyBg + '">\n      ' + parts + "\n    </div>";
    }).join("\n");

    const navHtml = multi ? '<div class="wuis-nav">' + pages.map((pg, i) => '<button class="' + (i === 0 ? "on" : "") + '">' + esc(pg.name || ("页面 " + (i + 1))) + "</button>").join("") + "</div>" : "";

    return "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>" + esc(state.title || "WebUI Studio 导出页面") + "</title>\n<style>\n" + EXPORT_CSS + "\n</style>\n</head>\n<body>\n  " + navHtml + '\n  <div class="wuis-pages">\n' + pageHtml + "\n  </div>\n<script>\n" + RUNTIME + "\n</script>\n</body>\n</html>";
  }

  return { exportHTML: exportHTML };
})();
