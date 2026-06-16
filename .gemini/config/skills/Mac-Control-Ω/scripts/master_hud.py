#!/usr/bin/env python3
# C5-REAL
# HUD v1.1 | STATE: NON-INTRUSIVE | INTERACTION: ZERO

from AppKit import *
from WebKit import *

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: rgba(10, 10, 10, 0.7);
            color: #2B3BE5;
            font-family: 'Helvetica Neue', sans-serif;
            overflow: hidden;
            border-left: 3px solid #2B3BE5;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 20px;
            backdrop-filter: blur(20px);
        }
        .header {
            font-size: 1.2rem;
            font-weight: 900;
            letter-spacing: 0.2rem;
            margin-bottom: 10px;
        }
        .item {
            font-size: 0.7rem;
            margin-bottom: 5px;
            opacity: 0.8;
            font-family: monospace;
        }
        .pulse {
            color: #fff;
            animation: pulse-kf 2s infinite;
        }
        @keyframes pulse-kf {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    </style>
</head>
<body>
    <div class="header">CORTEX HUD</div>
    <div class="item pulse">∴ STATUS: ACTIVE</div>
    <div class="item">∴ MODE: PHYSICAL_Ω</div>
    <div class="item">∴ EXERGY: OPTIMAL</div>
</body>
</html>
"""


class MasterHUD(NSObject):
    def run(self):
        self.app = NSApplication.sharedApplication()
        self.app.setActivationPolicy_(NSApplicationActivationPolicyAccessory)

        screen = NSScreen.mainScreen().frame()
        # POS: TOP-RIGHT | 250x150
        hud_width, hud_height = 250, 150
        hud_rect = NSMakeRect(
            screen.size.width - hud_width - 20,
            screen.size.height - hud_height - 60,
            hud_width,
            hud_height,
        )

        self.win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
            hud_rect, NSWindowStyleMaskBorderless, NSBackingStoreBuffered, False
        )
        self.win.setOpaque_(False)
        self.win.setBackgroundColor_(NSColor.clearColor())
        self.win.setLevel_(NSStatusWindowLevel + 2)
        self.win.setIgnoresMouseEvents_(True)
        self.win.setHasShadow_(True)

        # RENDER: RADIUS 15.0
        self.win.contentView().setWantsLayer_(True)
        self.win.contentView().layer().setCornerRadius_(15.0)
        self.win.contentView().layer().setMasksToBounds_(True)

        self.webview = WKWebView.alloc().initWithFrame_configuration_(
            self.win.contentView().bounds(), WKWebViewConfiguration.alloc().init()
        )
        self.webview.setBackgroundColor_(NSColor.clearColor())
        self.webview.setOpaque_(False)
        self.win.setContentView_(self.webview)

        self.webview.loadHTMLString_baseURL_(HTML_TEMPLATE, None)
        self.win.makeKeyAndOrderFront_(None)
        self.app.run()


if __name__ == "__main__":
    hud = MasterHUD.alloc().init()
    hud.run()
