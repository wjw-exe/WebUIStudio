# WebUI Studio

WebUI Studio 是一款**拖拽式网页 UI 设计器**，以 Windows 桌面程序形式运行。你只需从左侧组件库中拖入组件，即可在画布上搭建网页界面；设计完成后可一键导出为**独立可交互的 HTML 文件**，无需任何构建工具即可在浏览器中打开使用。

## 功能特性

- **拖拽式设计**：从左侧组件库拖入组件即可在画布生成对应组件，也支持点击组件直接添加。
- **自由画布**：画布可自由移动、缩放（`Ctrl + 滚轮`），支持网格吸附与画布尺寸/背景自定义。
- **文字可编辑**：双击画布中的文字组件即可直接编辑内容。
- **双工具模式**：内置「移动工具」（`V`）与「画笔工具」（`B`）两种操作模式。
- **丰富的组件库**：内置按钮、文字、开关、输入框、滑块、下拉框、复选框、单选、图片、进度条、分割线、容器、徽章等 13 种组件。
- **属性面板**：选中组件后可在右侧属性面板调整位置、尺寸、颜色、字号、圆角、透明度、旋转、层级等样式。
- **图层管理**：左侧图层面板支持查看与选择所有元素，支持置于顶层/底层、复制、删除。
- **撤销重做**：完整支持撤销（`Ctrl+Z`）与重做（`Ctrl+Y`）。
- **导出独立 HTML**：一键导出可交互的独立 HTML 文件，包含全部样式与交互逻辑。
- **原生桌面能力**：基于 PySide6 菜单栏/状态栏，支持保存/打开项目、浏览器预览（`F5`）等。
- **Windows 桌面程序**：可通过 PyInstaller 打包为独立的 `.exe` 可执行文件。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 桌面外壳 | Python + PySide6（QtWidgets / QWebEngineView / QWebChannel） |
| 设计器前端 | HTML + CSS + JavaScript（原生实现，无框架依赖） |
| 导出能力 | JavaScript 自研 HTML 导出器（`js/exporter.js`） |
| 打包分发 | PyInstaller |

## 目录结构

```
WebUIStudio/
├── main.py            # 程序入口：PySide6 桌面外壳，菜单/状态栏与 JS-Python 桥
├── index.html         # 设计器主页面（顶栏、组件库、画布、属性面板）
├── css/
│   └── app.css        # 设计器界面样式
├── js/
│   ├── app.js         # 核心逻辑：状态/渲染/拖拽/缩放/属性面板/图层/撤销重做
│   └── exporter.js    # 独立 HTML 导出器
├── WebUIStudio.spec   # PyInstaller 打包配置（本地构建用）
├── build/             # PyInstaller 中间产物（不提交）
└── dist/              # 打包输出目录（不提交）
```

## 使用与打包

### 环境要求

- Python 3.9+（本项目基于 Python 3.11 开发）
- Windows 10/11

### 安装依赖

```bash
pip install PySide6 pyinstaller
```

### 开发运行

```bash
python main.py
```

### 打包为 Windows 可执行文件

使用项目内的 spec 文件打包（`WebUIStudio.spec` 已含前端资源收集配置）：

```bash
pyinstaller WebUIStudio.spec
```

或使用命令行方式（需手动附带前端资源）：

```bash
pyinstaller --noconsole --name WebUIStudio \
  --add-data "index.html;." \
  --add-data "css;css" \
  --add-data "js;js" \
  main.py
```

打包完成后，可执行文件位于 `dist/WebUIStudio/WebUIStudio.exe`，可直接分发使用。

## 许可证

[MIT](LICENSE)
