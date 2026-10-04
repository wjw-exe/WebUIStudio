# -*- coding: utf-8 -*-
"""
WebUI Studio - 网页UI制作软件
PySide6 + QWebEngineView 桌面外壳，内嵌拖拽式网页设计器。
功能：拖拽组件、文字编辑、属性调整、图层管理、撤销重做、导出HTML、打包为 exe。
"""
import sys
import os
import json
import tempfile

from PySide6.QtCore import QUrl, QObject, Slot, Qt
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QFileDialog, QMessageBox, QLabel
)
from PySide6.QtWebChannel import QWebChannel
from PySide6.QtWebEngineWidgets import QWebEngineView

APP_TITLE = "WebUI Studio"
APP_VERSION = "1.4.0"


def resource_path(rel: str) -> str:
    """兼容 PyInstaller 打包后的资源路径"""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)


class Bridge(QObject):
    """JS <-> Python 通信桥，提供原生保存/打开/预览能力"""

    def __init__(self, win: "MainWindow"):
        super().__init__(win)
        self.win = win

    @Slot(str, result=str)
    def saveFile(self, payload: str) -> str:
        """
        payload: {"name": str, "content": str, "filter": str}
        返回: {"ok": bool, "path": str, "cancel": bool, "msg": str}
        """
        try:
            data = json.loads(payload)
        except Exception:
            return json.dumps({"ok": False, "msg": "参数解析失败"})
        name = data.get("name", "untitled.html")
        content = data.get("content", "")
        flt = data.get("filter", "所有文件 (*.*)")
        path, _ = QFileDialog.getSaveFileName(self.win, "保存文件", name, flt)
        if not path:
            return json.dumps({"ok": False, "cancel": True})
        try:
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(content)
            return json.dumps({"ok": True, "path": path})
        except Exception as e:
            return json.dumps({"ok": False, "msg": str(e)})

    @Slot(result=str)
    def openFile(self) -> str:
        """
        打开项目文件，返回 {"ok": true, "path": str, "content": str}
        """
        path, _ = QFileDialog.getOpenFileName(
            self.win, "打开文件", "",
            "WebUI Studio 项目 (*.wuis);;JSON 文件 (*.json);;所有文件 (*.*)",
        )
        if not path:
            return json.dumps({"ok": False, "cancel": True})
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return json.dumps({"ok": True, "path": path, "content": content})
        except Exception as e:
            return json.dumps({"ok": False, "msg": str(e)})

    @Slot(str, result=str)
    def preview(self, html: str) -> str:
        """把 HTML 写到临时目录并用系统默认浏览器打开"""
        try:
            tmp = tempfile.gettempdir()
            path = os.path.join(tmp, "wuis_preview.html")
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(html)
            os.startfile(path)
            return json.dumps({"ok": True, "path": path})
        except Exception as e:
            return json.dumps({"ok": False, "msg": str(e)})

    @Slot(result=str)
    def getVersion(self) -> str:
        return APP_VERSION


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle(f"{APP_TITLE} v{APP_VERSION}")
        self.resize(1480, 920)
        self.setMinimumSize(1120, 700)

        self.view = QWebEngineView(self)
        self.setCentralWidget(self.view)

        # 注入 WebChannel 桥
        self.channel = QWebChannel(self.view.page())
        self.bridge = Bridge(self)
        self.channel.registerObject("bridge", self.bridge)
        self.view.page().setWebChannel(self.channel)

        self.view.load(QUrl.fromLocalFile(resource_path("index.html")))

        self._build_menus()
        self._build_statusbar()

    # ---------- 菜单 ----------
    def _build_menus(self):
        mb = self.menuBar()

        m_file = mb.addMenu("文件(&F)")
        self._act("新建项目", "Ctrl+N", "new", m_file)
        self._act("打开项目…", "Ctrl+O", "open", m_file)
        m_file.addSeparator()
        self._act("保存项目", "Ctrl+S", "save", m_file)
        self._act("导出 HTML", "Ctrl+E", "export", m_file)
        m_file.addSeparator()
        self._act("浏览器预览", "F5", "preview", m_file)
        m_file.addSeparator()
        qa = QAction("退出", self)
        qa.setShortcut("Alt+F4")
        qa.triggered.connect(self.close)
        m_file.addAction(qa)

        m_edit = mb.addMenu("编辑(&E)")
        self._act("撤销", "Ctrl+Z", "undo", m_edit)
        self._act("重做", "Ctrl+Y", "redo", m_edit)
        m_edit.addSeparator()
        self._act("复制所选", "Ctrl+D", "duplicate", m_edit)
        self._act("删除所选", "Del", "delete", m_edit)
        m_edit.addSeparator()
        self._act("置于顶层", "Ctrl+Shift+]", "top", m_edit)
        self._act("置于底层", "Ctrl+Shift+[", "bottom", m_edit)

        m_view = mb.addMenu("视图(&V)")
        self._act("放大", "Ctrl+=", "zoomIn", m_view)
        self._act("缩小", "Ctrl+-", "zoomOut", m_view)
        self._act("实际大小", "Ctrl+0", "zoom100", m_view)

        m_help = mb.addMenu("帮助(&H)")
        self._act("快捷键说明", "F1", "help", m_help)
        self._act("关于", "", "about", m_help)

    def _act(self, text, shortcut, js, menu):
        a = QAction(text, self)
        if shortcut:
            a.setShortcut(QKeySequence(shortcut))
        a.triggered.connect(lambda: self.js(js))
        menu.addAction(a)
        return a

    # ---------- 状态栏 ----------
    def _build_statusbar(self):
        sb = self.statusBar()
        self.lb_ready = QLabel("就绪  ·  从左侧组件库拖入组件开始设计  ·  双击文字可编辑  ·  Ctrl+滚轮缩放画布")
        sb.addWidget(self.lb_ready)
        self.lb_ready.setStyleSheet("color:#8a8f98; padding:0 12px; font-size:12px;")

    # ---------- 调用前端 ----------
    def js(self, action: str):
        self.view.page().runJavaScript(f"window.App && App.action('{action}')")


def main():
    QApplication.setApplicationName(APP_TITLE)
    QApplication.setOrganizationName("Marvis")
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    # 深色 UI 基调
    app.setStyleSheet(
        "QMainWindow{background:#1b1c20;}"
        "QMenuBar{background:#1b1c20;color:#d4d8de;border-bottom:1px solid #2a2b31;font-size:13px;}"
        "QMenuBar::item:selected{background:#2f3138;}"
        "QMenu{background:#24262c;color:#d4d8de;border:1px solid #33353d;}"
        "QMenu::item:selected{background:#2f5cff;color:#fff;}"
        "QStatusBar{background:#1b1c20;color:#8a8f98;border-top:1px solid #2a2b31;}"
    )
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
