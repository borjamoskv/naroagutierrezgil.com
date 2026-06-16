#!/usr/bin/env python3
# C5-REAL
import sys
import os
import signal
import json
from AppKit import *
from WebKit import *

HTML_TEMPLATE_VISUAL = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0; padding: 0;
            background: rgba(10, 10, 10, 0.9);
            color: #2B3BE5;
            font-family: 'Helvetica Neue', sans-serif;
            overflow: hidden;
            border: 1px solid #2B3BE5;
            box-sizing: border-box;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(40px);
        }
        .container {
            text-align: center;
            border: 1px solid #2B3BE5;
            padding: 4rem;
            position: relative;
        }
        .container::before {
            content: ''; position: absolute;
            top: -5px; left: -5px;
            width: 20px; height: 20px;
            border-top: 2px solid #2B3BE5; border-left: 2px solid #2B3BE5;
        }
        .container::after {
            content: ''; position: absolute;
            bottom: -5px; right: -5px;
            width: 20px; height: 20px;
            border-bottom: 2px solid #2B3BE5; border-right: 2px solid #2B3BE5;
        }
        .status {
            font-size: 5rem; font-weight: 900;
            text-transform: uppercase; letter-spacing: 1.5rem;
            text-shadow: 0 0 20px #FF9F1C, 2px 2px #2B3BE5;
            margin-bottom: 0.5rem;
            animation: glitch 3s infinite;
        }
        @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
        }
        .sub {
            font-size: 1rem; letter-spacing: 0.5rem;
            opacity: 0.9; color: #FF9F1C;
        }
        .telemetry {
            margin-top: 3rem;
            font-family: monospace; font-size: 0.7rem;
            line-height: 1.5; text-align: left; opacity: 0.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">MAESTRO</div>
        <div class="sub">PHYSICAL SOVEREIGNTY v9.0.0</div>
        <div class="telemetry">
            ∴ STATE: C5-REAL<br>
            ∴ PORT: 8011 (DAEMON)<br>
            ∴ AX-Ω: SILICON_BYPASS<br>
            ∴ B-OS: MACOS_CONTROL
        </div>
    </div>
</body>
</html>
"""

HTML_TEMPLATE_CONFIRM = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0; padding: 0;
            background: rgba(10, 10, 10, 0.92);
            color: #FF9F1C;
            font-family: 'Helvetica Neue', sans-serif;
            overflow: hidden;
            border: 2px solid #FF9F1C;
            box-sizing: border-box;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(50px);
        }
        .container {
            text-align: center;
            border: 1px solid #FF9F1C;
            padding: 4rem;
            position: relative;
            background: rgba(5, 5, 5, 0.8);
            box-shadow: 0 0 40px rgba(255, 159, 28, 0.15);
        }
        .container::before {
            content: ''; position: absolute;
            top: -5px; left: -5px;
            width: 20px; height: 20px;
            border-top: 3px solid #FF9F1C; border-left: 3px solid #FF9F1C;
        }
        .container::after {
            content: ''; position: absolute;
            bottom: -5px; right: -5px;
            width: 20px; height: 20px;
            border-bottom: 3px solid #FF9F1C; border-right: 3px solid #FF9F1C;
        }
        .alert {
            font-size: 2rem; font-weight: 900;
            text-transform: uppercase; letter-spacing: 0.5rem;
            color: #FF9F1C; margin-bottom: 1.5rem;
            text-shadow: 0 0 10px rgba(255, 159, 28, 0.5);
        }
        .action-desc {
            font-size: 1.5rem; color: #FFFFFF;
            border-left: 3px solid #2B3BE5;
            padding: 0.5rem 1rem; margin: 1.5rem 0;
            background: rgba(43, 59, 229, 0.1);
            text-align: left; font-family: monospace;
        }
        .instruction {
            font-size: 1.1rem; color: #2B3BE5;
            letter-spacing: 0.2rem; font-weight: bold;
            margin-top: 2rem;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        .countdown {
            margin-top: 2rem; font-size: 0.9rem;
            opacity: 0.5; font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">⚠️ SECURE ATTENTION REQUIRED</div>
        <div style="font-size: 0.9rem; opacity: 0.7; letter-spacing: 0.1rem;">An automated task is requesting HID control:</div>
        <div class="action-desc">{action_text}</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">To authorize, press and hold:</div>
        <div style="font-size: 1.3rem; font-weight: 900; margin-top: 0.5rem; color: #FFFFFF; letter-spacing: 0.15rem;">
            ⌃ Control + ⌥ Option + ⌘ Command
        </div>
        <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">and Left Click anywhere on the screen.</div>
        <div class="instruction">AWAITING HARDWARE GESTURE</div>
        <div class="countdown">TIMEOUT IN 10 SECONDS · CLICK ELSEWHERE TO CANCEL</div>
    </div>
</body>
</html>
"""

class ConfirmOverlayWindow(NSWindow):
    def sendEvent_(self, event):
        if event.type() == 1:  # LeftMouseDown
            flags = event.modifierFlags()
            # 0x1C0000 = Command (1<<20) | Option (1<<19) | Control (1<<18)
            if (flags & 0x1C0000) == 0x1C0000:
                print(json.dumps({"status": "confirmed"}))
                os._exit(0)
            else:
                # Any other click without modifier cancels/denies
                print(json.dumps({"status": "cancelled"}))
                os._exit(1)
        super(ConfirmOverlayWindow, self).sendEvent_(event)

class NoirOverlay(NSObject):
    def run_with_mode(self, confirm_action=None):
        self.confirm_mode = bool(confirm_action)
        self.app = NSApplication.sharedApplication()
        self.app.setActivationPolicy_(NSApplicationActivationPolicyAccessory)

        screen = NSScreen.mainScreen().frame()
        
        if confirm_action:
            self.win = ConfirmOverlayWindow.alloc().initWithContentRect_styleMask_backing_defer_(
                screen, NSWindowStyleMaskBorderless, NSBackingStoreBuffered, False
            )
            self.win.setIgnoresMouseEvents_(False)
            html = HTML_TEMPLATE_CONFIRM.replace("{action_text}", confirm_action)
            timeout = 10.0
        else:
            self.win = NSWindow.alloc().initWithContentRect_styleMask_backing_defer_(
                screen, NSWindowStyleMaskBorderless, NSBackingStoreBuffered, False
            )
            self.win.setIgnoresMouseEvents_(True)
            html = HTML_TEMPLATE_VISUAL
            timeout = 5.0

        self.win.setOpaque_(False)
        self.win.setBackgroundColor_(NSColor.clearColor())
        self.win.setLevel_(NSStatusWindowLevel + 2)
        self.win.setCollectionBehavior_(
            NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehaviorFullScreenAuxiliary
        )

        config = WKWebViewConfiguration.alloc().init()
        self.webview = WKWebView.alloc().initWithFrame_configuration_(
            self.win.contentView().bounds(), config
        )
        self.webview.setBackgroundColor_(NSColor.clearColor())
        self.webview.setOpaque_(False)
        self.win.setContentView_(self.webview)

        self.webview.loadHTMLString_baseURL_(html, None)
        self.win.makeKeyAndOrderFront_(None)

        signal.signal(signal.SIGINT, lambda s, f: os._exit(1))

        # Setup NSTimer using self as target and timeout: selector
        NSTimer.scheduledTimerWithTimeInterval_target_selector_userInfo_repeats_(
            timeout, self, "timeout:", None, False
        )

        self.app.run()

    def timeout_(self, timer):
        if self.confirm_mode:
            print(json.dumps({"status": "timeout"}))
            os._exit(1)
        else:
            self.app.terminate_(None)

if __name__ == "__main__":
    confirm_action = None
    if len(sys.argv) > 2 and sys.argv[1] == "--confirm":
        confirm_action = sys.argv[2]
        
    overlay = NoirOverlay.alloc().init()
    overlay.run_with_mode(confirm_action)
